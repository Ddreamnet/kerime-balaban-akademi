import { HeroSection } from './HeroSection'
import { ValuePropSection } from './ValuePropSection'
import { ClassPreviewSection } from './ClassPreviewSection'
import { AnnouncementsSection } from './AnnouncementsSection'
import { ProductsPreviewSection } from './ProductsPreviewSection'
import { CTASection } from './CTASection'

/**
 * Home page — assembles all sections in business-goal order:
 * Hero → Why KBA → Classes → News → Products → CTA
 */
export function HomePage() {
  return (
    <>
      <HeroSection />
      <ValuePropSection />
      <ClassPreviewSection />
      <AnnouncementsSection />
      <ProductsPreviewSection />
      <CTASection />
    </>
  )
}
