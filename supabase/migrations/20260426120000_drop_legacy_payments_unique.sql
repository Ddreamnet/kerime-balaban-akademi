-- Drop the legacy (child_id, period_month, period_year) unique constraint.
--
-- The new model anchors uniqueness on (child_id, period_start), which is
-- already enforced by `payments_child_period_start_uniq` (added in
-- 20260425120000_payment_billing_cycle.sql). The old composite key
-- prevented per-child cycles from coexisting with backfilled legacy rows
-- in the same calendar month, so it has to go.

alter table public.payments
  drop constraint if exists payments_child_id_period_month_period_year_key;
