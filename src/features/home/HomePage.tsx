import { SEO } from '@/components/SEO'
import { HeroSection } from './HeroSection'
import { ValuePropSection } from './ValuePropSection'
import { ClassPreviewSection } from './ClassPreviewSection'
import { AnnouncementsSection } from './AnnouncementsSection'
import { ProductsPreviewSection } from './ProductsPreviewSection'
import { CTASection } from './CTASection'
import { useStatusBarStyle } from '@/hooks/useStatusBarStyle'

export function HomePage() {
  // Hero is dark — flip the iOS/Android status-bar icons to light so they
  // stay visible against the burgundy backdrop. Restored on unmount.
  useStatusBarStyle({ light: true })

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
