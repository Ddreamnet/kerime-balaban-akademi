-- Faz A — Per-child billing cycle
--
-- Replaces the calendar-month payment model with a per-student billing cycle.
-- Each child gets:
--   • billing_start_date: the day their billing cycle anchors to (e.g. 18 Mar)
--   • payment_due_day:    the day-of-month payment is due (default = day of
--                         billing_start_date, admin can override)
--
-- Each payments row now carries explicit period_start / period_end / due_date,
-- so cycles are immutable history once written. A trigger generates 12 future
-- periods when billing_start_date is set, and regenerates future unpaid rows
-- when billing config changes. Historical payments are backfilled with
-- computed dates (period_start = 1st of month, due_date = same).
--
-- Notification reminder hook (reminder_sent_at) is added here; the cron job
-- and edge function are introduced in a separate migration so this one can
-- ship the schema independently.

-- ─── Helper: clamp day to month length ─────────────────────────────────────
-- Returns make_date(year, month, day) but clamps day to that month's last
-- day. So clamp(2026, 2, 31) → 2026-02-28.

create or replace function public.clamp_day_to_month(
  p_year int,
  p_month int,
  p_day int
)
returns date
language sql
immutable
as $$
  select make_date(
    p_year,
    p_month,
    least(
      greatest(p_day, 1),
      extract(day from (make_date(p_year, p_month, 1) + interval '1 month - 1 day'))::int
    )
  );
$$;

-- ─── children: billing config ──────────────────────────────────────────────

alter table public.children
  add column if not exists billing_start_date date,
  add column if not exists payment_due_day smallint
    check (payment_due_day is null or (payment_due_day between 1 and 31));

create index if not exists children_billing_start_date_idx
  on public.children (billing_start_date)
  where billing_start_date is not null;

-- ─── payments: cycle dates + reminder marker ───────────────────────────────

alter table public.payments
  add column if not exists period_start date,
  add column if not exists period_end date,
  add column if not exists due_date date,
  add column if not exists reminder_sent_at timestamptz;

-- ─── Backfill historical payments ──────────────────────────────────────────
-- Legacy rows (period_month/period_year only) get their date columns
-- computed: cycle = full calendar month, due_date = first of month.
-- This matches the "default vade = period_start" rule and preserves the
-- current behaviour for already-resolved months.

update public.payments
set
  period_start = make_date(period_year, period_month, 1),
  period_end   = (make_date(period_year, period_month, 1) + interval '1 month - 1 day')::date,
  due_date     = make_date(period_year, period_month, 1)
where period_start is null;

-- Now that every row has dates, enforce NOT NULL. period_month/period_year
-- are kept for backward compatibility with existing client code; new code
-- should read period_start/period_end/due_date.
alter table public.payments
  alter column period_start set not null,
  alter column period_end   set not null,
  alter column due_date     set not null;

-- One period per child per start date — prevents accidental duplicate
-- generation when triggers fire concurrently or admin re-saves config.
alter table public.payments
  drop constraint if exists payments_child_period_start_uniq;
alter table public.payments
  add constraint payments_child_period_start_uniq
  unique (child_id, period_start);

-- Cron query support: "due in N days and not paid" filter.
create index if not exists payments_due_date_status_idx
  on public.payments (due_date, status);

-- ─── Period generation function ────────────────────────────────────────────
-- Inserts p_count consecutive monthly periods starting at p_start_date.
-- period_end = period_start + 1 month - 1 day (Postgres handles short
-- months natively; e.g. Jan 31 + 1 month = Feb 28).
-- due_date = clamp_day_to_month(year, month, p_due_day) within each period.
-- Amount is left null — admin fills it from AdminPaymentsPage.

create or replace function public.generate_payment_periods(
  p_child_id uuid,
  p_start_date date,
  p_due_day int,
  p_count int default 12
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  i int;
  cur_start date;
  cur_end   date;
  cur_due   date;
begin
  for i in 0..(p_count - 1) loop
    cur_start := (p_start_date + (i || ' months')::interval)::date;
    cur_end   := (cur_start + interval '1 month - 1 day')::date;
    cur_due   := public.clamp_day_to_month(
      extract(year from cur_start)::int,
      extract(month from cur_start)::int,
      p_due_day
    );

    insert into public.payments (
      child_id, period_start, period_end, due_date, status,
      period_month, period_year
    )
    values (
      p_child_id, cur_start, cur_end, cur_due, 'unpaid',
      extract(month from cur_start)::int,
      extract(year from cur_start)::int
    )
    on conflict (child_id, period_start) do nothing;
  end loop;
end;
$$;

-- ─── Trigger: regenerate periods when billing config changes ───────────────
-- Behaviour:
--   • billing_start_date set for the first time → generate 12 periods
--   • billing_start_date or payment_due_day updated → drop future *unpaid*
--     rows from the new start onward, regenerate. Past rows and any
--     already-paid future rows are left untouched (history is immutable).
--   • billing_start_date cleared → drop future unpaid rows, generate nothing
--
-- payment_due_day default = day of billing_start_date.

create or replace function public.children_billing_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  due_day int;
begin
  -- Skip when neither billing column actually changed (UPDATE only).
  if tg_op = 'UPDATE'
     and (new.billing_start_date is not distinct from old.billing_start_date)
     and (new.payment_due_day    is not distinct from old.payment_due_day) then
    return new;
  end if;

  -- Cleared: just remove future unpaid rows.
  if new.billing_start_date is null then
    delete from public.payments
    where child_id = new.id
      and status = 'unpaid'
      and period_start >= current_date;
    return new;
  end if;

  due_day := coalesce(
    new.payment_due_day,
    extract(day from new.billing_start_date)::int
  );

  -- Clear future unpaid rows from new anchor onward (paid rows protected).
  delete from public.payments
  where child_id = new.id
    and status = 'unpaid'
    and period_start >= new.billing_start_date;

  perform public.generate_payment_periods(
    new.id, new.billing_start_date, due_day, 12
  );

  return new;
end;
$$;

drop trigger if exists children_billing_changed on public.children;
create trigger children_billing_changed
after insert or update of billing_start_date, payment_due_day
on public.children
for each row execute function public.children_billing_changed();
