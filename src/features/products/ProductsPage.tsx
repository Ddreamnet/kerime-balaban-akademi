import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Spinner } from '@/components/ui/Spinner'
import { ProductCard } from './ProductCard'
import { SEO } from '@/components/SEO'
import { productCategoryLabels } from '@/data/products'
import { listAvailableProducts } from '@/lib/products'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { cn } from '@/utils/cn'
import type { Product, ProductCategory } from '@/types/content.types'

type FilterKey = 'all' | ProductCategory

const filters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'dobok', label: productCategoryLabels['dobok'] },
  { key: 'koruyucu', label: productCategoryLabels['koruyucu'] },
  { key: 'aksesuar', label: productCategoryLabels['aksesuar'] },
]

export function ProductsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const settings = useSiteSettings()

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const list = await listAvailableProducts()
      if (!cancelled) {
        setProducts(list)
        setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const visible = products.filter(
    (p) => activeFilter === 'all' || p.category === activeFilter
  )

  return (
    <>
      <SEO
        title="Taekwondo Ürünleri — Dobok, Koruyucu Ekipman | Kerime Balaban Akademi"
        description="Taekwondo doboku, kask, el-ayak koruyucu, hogu, kuşak setleri. Kerime Balaban Akademi öğrencileri için kaliteli taekwondo ekipmanları. WhatsApp ile hızlı bilgi."
        path="/urunler"
      />
      <PageHero
        label={settings.products_hero_label}
        headline={settings.products_hero_headline}
        highlight={settings.products_hero_highlight}
        body={settings.products_hero_body}
      />

      <Section bg="default">
        <Container>
          <div className="flex flex-col gap-8">

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              {filters.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={cn(
                    'px-4 py-2 rounded-full text-body-sm font-semibold transition-all duration-150',
                    'focus-visible:outline-2 focus-visible:outline-primary',
                    activeFilter === key
                      ? 'bg-primary text-white shadow-primary-glow/20'
                      : 'bg-surface-card text-on-surface/60 hover:bg-surface-low hover:text-on-surface shadow-ambient'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : (
              <>
                <p className="text-body-sm text-on-surface/40">
                  {visible.length} ürün gösteriliyor
                </p>

                {visible.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visible.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <p className="text-body-lg text-on-surface/40">
                      Bu kategoride ürün bulunamadı.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </Container>
      </Section>

      {/* Inquiry CTA banner */}
      <Section bg="low">
        <Container>
          <div className="bg-on-surface rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-display font-bold text-headline-sm text-white">
                {settings.products_cta_headline}
              </h2>
              <p className="text-body-md text-white/60 mt-1">
                {settings.products_cta_body}
              </p>
            </div>
            <a
              href={settings.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold transition-colors shrink-0"
            >
              <MessageCircle className="w-5 h-5" />
              {settings.products_cta_button_label}
            </a>
          </div>
        </Container>
      </Section>
    </>
  )
}
