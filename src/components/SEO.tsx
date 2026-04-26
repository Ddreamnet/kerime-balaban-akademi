import { Helmet } from 'react-helmet-async'

const SITE_URL = 'https://kerimebalabanakademi.com'
const DEFAULT_IMAGE = `${SITE_URL}/images/KickTheAir.png`

interface SEOProps {
  /** Page-specific title fragment; gets suffixed with " — Kerime Balaban Akademi" */
  title: string
  /** 140-160 char meta description */
  description: string
  /** Path starting with /, e.g. "/dersler". Default: current pathname */
  path?: string
  /** Absolute URL for OG/Twitter image. Defaults to hero kick. */
  image?: string
  /** Set true on pages that shouldn't be indexed (drafts, utility pages) */
  noindex?: boolean
  /** "article" for announcement detail etc. Default "website" */
  type?: 'website' | 'article'
}

export function SEO({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  noindex,
  type = 'website',
}: SEOProps) {
  const fullTitle =
    title.includes('Kerime Balaban') ? title : `${title} — Kerime Balaban Akademi`
  const canonicalPath = path ?? (typeof window !== 'undefined' ? window.location.pathname : '/')
  const canonical = `${SITE_URL}${canonicalPath}`
  const robots = noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1'

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  )
}
