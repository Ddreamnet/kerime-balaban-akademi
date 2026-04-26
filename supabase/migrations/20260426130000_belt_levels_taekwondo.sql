-- Migrate the legacy 3-tier belt levels (baslangic / orta / ileri) to the
-- canonical taekwondo belt names (beyaz / sari / yesil / mavi / kirmizi /
-- siyah). The mapping picks the most common color within each old tier:
--   baslangic → beyaz   (white — entry level)
--   orta      → yesil   (green — mid-level)
--   ileri     → kirmizi (red — advanced; black is reserved for actual dans)
--
-- belt_level on children is plain TEXT, so this is a straight UPDATE.
-- belt_levels on classes is TEXT[], so each old element is replaced.

update public.children
set belt_level = case belt_level
  when 'baslangic' then 'beyaz'
  when 'orta'      then 'yesil'
  when 'ileri'     then 'kirmizi'
  else belt_level
end
where belt_level in ('baslangic', 'orta', 'ileri');

update public.classes
set belt_levels = (
  select array_agg(
    case b
      when 'baslangic' then 'beyaz'
      when 'orta'      then 'yesil'
      when 'ileri'     then 'kirmizi'
      else b
    end
  )
  from unnest(belt_levels) as b
)
where belt_levels && array['baslangic', 'orta', 'ileri'];
