/**
 * Content types for all static/dynamic content on the public site.
 * These shapes mirror future Supabase table columns exactly,
 * so switching from static data to API calls requires no type changes.
 */

// ─── Announcements ──────────────────────────────────────────────────────────

export type AnnouncementCategory =
  | 'genel'       // General
  | 'sinav'       // Belt exam
  | 'etkinlik'    // Event
  | 'duyuru'      // Notice
  | 'tatil'       // Holiday/closure

export interface Announcement {
  id: string
  title: string
  excerpt: string
  content: string
  category: AnnouncementCategory
  image_url?: string
  published_at: string   // ISO date string
  is_pinned: boolean
  is_published: boolean
}

// ─── Classes ────────────────────────────────────────────────────────────────

export type TrainingDay = 'pazartesi' | 'carsamba' | 'cuma'

export type BeltLevel =
  | 'baslangic'   // Beginner (white–yellow)
  | 'orta'        // Intermediate (green–blue)
  | 'ileri'       // Advanced (red–black)

export interface ClassGroup {
  id: string
  name: string                    // e.g. "Başlangıç Grubu"
  description: string
  age_range: string               // e.g. "6–10 yaş"
  belt_levels: BeltLevel[]
  days: TrainingDay[]             // always Mon/Wed/Fri
  time_start: string              // "16:00"
  time_end: string                // "17:30"
  capacity: number
  instructor: string
  is_active: boolean
}

// ─── Products ───────────────────────────────────────────────────────────────

export type ProductCategory =
  | 'dobok'         // Uniform
  | 'koruyucu'      // Protective gear
  | 'aksesuar'      // Accessories
  | 'diger'         // Other

export interface Product {
  id: string
  name: string
  description: string
  category: ProductCategory
  image_url?: string
  price?: number              // undefined = inquiry only
  is_inquiry_only: boolean
  is_featured: boolean
  is_available: boolean
  sort_order: number
}

// ─── Academy Info ────────────────────────────────────────────────────────────

export interface AcademyInfo {
  name: string
  tagline: string
  description: string
  address: string
  district: string            // "Bartın Merkez"
  city: string                // "Bartın"
  phone: string
  whatsapp: string
  email?: string
  instagram?: string
  facebook?: string
  youtube?: string
  google_maps_url?: string
  google_maps_embed_url?: string
  founded_year?: number
  coach_name: string
  coach_title: string
  coach_bio: string
  coach_image_url?: string
}

// ─── Site Content (admin-editable homepage sections) ─────────────────────────

export interface HeroContent {
  headline: string
  headline_highlight?: string   // Red-colored portion of headline
  subtext: string
  cta_primary_label: string
  cta_primary_href: string
  cta_secondary_label: string
  cta_secondary_href: string
  background_image_url?: string
}

export interface SiteContent {
  hero: HeroContent
  homepage_sections_order: string[]   // future: reorderable sections
  show_announcements_section: boolean
  show_products_section: boolean
  show_classes_section: boolean
  show_stats_section: boolean
}

// ─── Stat / Trust signal ─────────────────────────────────────────────────────

export interface StatItem {
  value: string    // "200+"
  label: string    // "Aktif Öğrenci"
  icon?: string    // Lucide icon name
}
