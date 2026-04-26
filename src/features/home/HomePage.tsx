import { SEO } from '@/components/SEO'
import { HeroSection } from './HeroSection'
import { ValuePropSection } from './ValuePropSection'
import { ClassPreviewSection } from './ClassPreviewSection'
import { AnnouncementsSection } from './AnnouncementsSection'
import { ProductsPreviewSection } from './ProductsPreviewSection'
import { CTASection } from './CTASection'

export function HomePage() {
  return (
    <>
      <SEO
        title="Kerime Balaban Taekwondo Akademisi — Bartın'da Çocuk & Yetişkin Dersleri"
        description="Bartın'da Kerime Balaban Taekwondo Akademisi. Çocuklar, gençler ve yetişkinler için profesyonel taekwondo eğitimi. 3. Dan siyah kuşak antrenör, haftada 3 gün dersler, ücretsiz deneme dersi."
        path="/"
      />
      <HeroSection />
      <ValuePropSection />
      <ClassPreviewSection />
      <AnnouncementsSection />
      <ProductsPreviewSection />
      <CTASection />
    </>
  )
}
