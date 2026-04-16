import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getSiteContent, type SiteContent, SITE_CONTENT_DEFAULTS } from '@/lib/siteContent'
import { academyInfo, contactLinks as staticContactLinks } from '@/data/academyInfo'
import { whatsappUrl } from '@/utils/format'

/**
 * Resolved site settings = DB override merged with static fallbacks.
 * If DB says null/empty, we use the values from src/data/academyInfo.ts.
 */
export interface ResolvedSiteSettings {
  phone: string
  whatsapp: string
  email: string
  address: string
  district: string
  instagram: string | undefined
  hero_headline: string
  hero_highlight: string
  hero_subtext: string
  hero_bg_url: string | undefined
  google_maps_url: string | undefined
  // Derived
  whatsappLink: string
  phoneLink: string
  instagramLink: string | undefined
  refresh: () => Promise<void>
}

function resolve(raw: SiteContent): Omit<ResolvedSiteSettings, 'refresh'> {
  const phone = raw.phone?.trim() || academyInfo.phone
  const whatsapp = raw.whatsapp?.trim() || academyInfo.whatsapp
  const email = raw.email?.trim() || academyInfo.email || ''
  const address = raw.address?.trim() || academyInfo.address
  const district = raw.district?.trim() || academyInfo.district
  const instagram = raw.instagram?.trim() || academyInfo.instagram

  return {
    phone,
    whatsapp,
    email,
    address,
    district,
    instagram,
    hero_headline: raw.hero_headline?.trim() || 'Gücünü',
    hero_highlight: raw.hero_highlight?.trim() || 'Keşfet.',
    hero_subtext:
      raw.hero_subtext?.trim() ||
      "Bartın'da çocuklar ve gençler için profesyonel taekwondo eğitimi. Disiplin, özgüven ve birlik — haftada 3 gün.",
    hero_bg_url: raw.hero_bg_url?.trim() || undefined,
    google_maps_url: raw.google_maps_url?.trim() || academyInfo.google_maps_url,
    whatsappLink: whatsappUrl(
      whatsapp,
      'Merhaba, Kerime Balaban Akademi hakkında bilgi almak istiyorum.',
    ),
    phoneLink: `tel:${phone.replace(/\s/g, '')}`,
    instagramLink: instagram ? `https://instagram.com/${instagram}` : undefined,
  }
}

const SiteSettingsContext = createContext<ResolvedSiteSettings | null>(null)

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<SiteContent>(SITE_CONTENT_DEFAULTS)

  const load = async () => {
    const content = await getSiteContent()
    setRaw(content)
  }

  useEffect(() => {
    void load()
  }, [])

  const value: ResolvedSiteSettings = { ...resolve(raw), refresh: load }

  return (
    <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
  )
}

/**
 * Hook to get resolved site settings.
 * Falls back to pre-computed static values if used outside provider (e.g. in tests).
 */
export function useSiteSettings(): ResolvedSiteSettings {
  const ctx = useContext(SiteSettingsContext)
  if (ctx) return ctx
  // Safe fallback
  return {
    ...resolve(SITE_CONTENT_DEFAULTS),
    whatsappLink: staticContactLinks.whatsapp,
    phoneLink: staticContactLinks.phone,
    refresh: async () => undefined,
  }
}
