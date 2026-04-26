-- Seeds the products table with the 6 items shown on the public "Mevcut Ürünler"
-- page (src/data/products.ts). Only inserts when the table is empty so reruns
-- on a populated DB are no-ops.

INSERT INTO public.products (name, description, category, image_url, price, is_inquiry_only, is_featured, is_available, sort_order)
SELECT *
FROM (VALUES
  (
    'Çocuk Doboku',
    'ITF ve WTF standartlarına uygun, dayanıklı pamuk-polyester karışımı çocuk taekwondo kıyafeti. Hafif ve rahat kesim.',
    'dobok',
    NULL::text,
    NULL::numeric,
    true,
    true,
    true,
    1
  ),
  (
    'Yetişkin Doboku',
    'Profesyonel antrenman ve müsabakalar için yüksek kalite dobok. Nefes alabilen kumaş, güçlendirilmiş dikiş.',
    'dobok',
    NULL::text,
    NULL::numeric,
    true,
    true,
    true,
    2
  ),
  (
    'Kask & Kafa Koruyucu',
    'WTF onaylı, tam kafa koruma sağlayan serbest dövüş kasket. Yüz kafesi dahil, çocuk ve yetişkin bedenleri mevcut.',
    'koruyucu',
    NULL::text,
    NULL::numeric,
    true,
    true,
    true,
    3
  ),
  (
    'El & Ayak Koruyucu Set',
    'Antrenman ve müsabaka için tam set el ve ayak koruyucu. Sünger destekli, velcro bağlantı, tüm bedenler.',
    'koruyucu',
    NULL::text,
    NULL::numeric,
    true,
    false,
    true,
    4
  ),
  (
    'Gövde Koruyucu (Hogu)',
    'WTF onaylı elektronik ya da geleneksel hogu. Müsabaka oyuncuları için standart koruma ekipmanı.',
    'koruyucu',
    NULL::text,
    NULL::numeric,
    true,
    false,
    true,
    5
  ),
  (
    'Renkli Kuşak Seti',
    'Sertifikalı derece kuşakları. Sinav geçişlerinde akademimizden temin edilebilir.',
    'aksesuar',
    NULL::text,
    NULL::numeric,
    true,
    false,
    true,
    6
  )
) AS seed(name, description, category, image_url, price, is_inquiry_only, is_featured, is_available, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.products);
