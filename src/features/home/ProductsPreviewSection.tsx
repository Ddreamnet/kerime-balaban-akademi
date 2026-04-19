import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { ProductCard } from '@/features/products/ProductCard'
import { products } from '@/data/products'
import { useSiteSettings } from '@/hooks/useSiteSettings'

export function ProductsPreviewSection() {
  const featured = products.filter((p) => p.is_featured && p.is_available).slice(0, 3)
  const settings = useSiteSettings()

  return (
    <Section bg="card">
      <Container>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <SectionHeader
              label={settings.home_products_label}
              headline={settings.home_products_headline}
              highlight={settings.home_products_highlight}
              body={settings.home_products_body}
            />
            <Link
              to="/urunler"
              className="hidden lg:flex items-center gap-2 text-body-sm font-semibold text-primary hover:text-primary-dark transition-colors shrink-0"
            >
              Tüm ürünleri gör
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="flex justify-center lg:hidden">
            <Link
              to="/urunler"
              className="flex items-center gap-2 text-body-md font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              Tüm ürünleri gör
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  )
}
