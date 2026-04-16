import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { ProductCard } from './ProductCard'
import { products, productCategoryLabels } from '@/data/products'
import { contactLinks } from '@/data/academyInfo'
import { cn } from '@/utils/cn'
import type { ProductCategory } from '@/types/content.types'

type FilterKey = 'all' | ProductCategory

const filters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'dobok', label: productCategoryLabels['dobok'] },
  { key: 'koruyucu', label: productCategoryLabels['koruyucu'] },
  { key: 'aksesuar', label: productCategoryLabels['aksesuar'] },
]

export function ProductsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')

  const visible = products.filter(
    (p) => p.is_available && (activeFilter === 'all' || p.category === activeFilter)
  )

  return (
    <>
      <PageHero
        label="Ekipmanlarımız"
        headline="Doğru ekipman,"
        highlight="doğru başlangıç."
        body="Taekwondo için ihtiyaç duyduğunuz tüm ekipmanları akademimizden temin edebilirsiniz. Sorularınız için bize WhatsApp üzerinden ulaşın."
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

            {/* Count */}
            <p className="text-body-sm text-on-surface/40">
              {visible.length} ürün gösteriliyor
            </p>

            {/* Grid */}
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
          </div>
        </Container>
      </Section>

      {/* Inquiry CTA banner */}
      <Section bg="low">
        <Container>
          <div className="bg-on-surface rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-display font-bold text-headline-sm text-white">
                Hangi ekipmanı seçmeli?
              </h2>
              <p className="text-body-md text-white/60 mt-1">
                Deneyim seviyenize ve grubunuza göre tavsiye için WhatsApp'tan yazın.
              </p>
            </div>
            <a
              href={contactLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold transition-colors shrink-0"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp'tan Sor
            </a>
          </div>
        </Container>
      </Section>
    </>
  )
}
