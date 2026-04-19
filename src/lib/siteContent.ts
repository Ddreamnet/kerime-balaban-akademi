/**
 * Site Content service — single-row admin-editable public settings.
 * Keys mirror src/data/academyInfo.ts which acts as a fallback when
 * the DB row has a null value.
 */

import { supabase } from './supabase'

export interface StatItem {
  value: string
  label: string
}

export interface FaqItem {
  q: string
  a: string
}

export interface ValueCardItem {
  title: string
  body: string
}

export interface ScheduleSlot {
  time: string
  group: string
  note: string
}

export interface FeatureCardItem {
  title: string
  body: string
}

export interface SiteContent {
  // Contact
  phone: string | null
  whatsapp: string | null
  email: string | null
  address: string | null
  district: string | null
  instagram: string | null

  // Home hero
  hero_headline: string | null
  hero_highlight: string | null
  hero_subtext: string | null
  hero_bg_url: string | null
  hero_cta_primary_label: string | null
  hero_cta_primary_href: string | null
  hero_cta_secondary_label: string | null
  hero_cta_secondary_href: string | null
  home_hero_overline: string | null

  google_maps_url: string | null

  // Academy stats (used on home hero, about, contact)
  academy_stats: StatItem[] | null

  // Coach
  coach_name: string | null
  coach_title: string | null
  coach_bio: string | null
  coach_credentials: string[] | null

  // About page
  about_hero_headline: string | null
  about_hero_highlight: string | null
  about_hero_body: string | null
  about_story_label: string | null
  about_story_headline: string | null
  about_story_highlight: string | null
  about_story_paragraphs: string[] | null
  about_founded_year: number | null
  about_coach_label: string | null
  about_values_label: string | null
  about_values_headline: string | null
  about_values_highlight: string | null
  about_values_body: string | null

  // Contact page
  contact_hero_headline: string | null
  contact_hero_body: string | null
  contact_hours_days: string | null
  contact_hours_time: string | null
  contact_form_label: string | null
  contact_form_headline: string | null
  contact_channels_label: string | null
  contact_channels_headline: string | null

  // Class FAQs
  class_faqs: FaqItem[] | null

  // Home CTA section
  home_cta_label: string | null
  home_cta_headline: string | null
  home_cta_headline_highlight: string | null
  home_cta_headline_suffix: string | null
  home_cta_body: string | null
  home_cta_benefits: string[] | null
  home_cta_form_title: string | null
  home_cta_form_subtitle: string | null

  // Home features / value-prop section
  home_features_label: string | null
  home_features_headline: string | null
  home_features_highlight: string | null
  home_features_body: string | null
  home_features_cards: FeatureCardItem[] | null

  // Home classes preview
  home_classes_label: string | null
  home_classes_headline: string | null
  home_classes_highlight: string | null
  home_classes_body: string | null
  home_classes_link_label: string | null

  // Home announcements preview
  home_announcements_label: string | null
  home_announcements_headline: string | null
  home_announcements_highlight: string | null
  home_announcements_body: string | null

  // Home products preview
  home_products_label: string | null
  home_products_headline: string | null
  home_products_highlight: string | null
  home_products_body: string | null

  // About values cards
  about_values: ValueCardItem[] | null

  // About bottom CTA
  about_cta_headline: string | null
  about_cta_body: string | null
  about_cta_primary_label: string | null
  about_cta_secondary_label: string | null

  // Classes page hero + sections
  classes_hero_label: string | null
  classes_hero_headline: string | null
  classes_hero_highlight: string | null
  classes_hero_body: string | null
  classes_groups_label: string | null
  classes_groups_headline: string | null
  classes_groups_highlight: string | null
  classes_schedule_label: string | null
  classes_schedule_headline: string | null
  classes_schedule_highlight: string | null
  classes_schedule_body: string | null
  classes_faq_label: string | null
  classes_faq_headline: string | null
  classes_faq_highlight: string | null

  // Classes schedule + bottom CTA
  classes_schedule: ScheduleSlot[] | null
  classes_cta_headline: string | null
  classes_cta_body: string | null
  classes_cta_button_label: string | null

  // Announcements page hero
  announcements_hero_label: string | null
  announcements_hero_headline: string | null
  announcements_hero_highlight: string | null
  announcements_hero_body: string | null

  // Products page hero + bottom CTA
  products_hero_label: string | null
  products_hero_headline: string | null
  products_hero_highlight: string | null
  products_hero_body: string | null
  products_cta_headline: string | null
  products_cta_body: string | null
  products_cta_button_label: string | null
}

const EMPTY: SiteContent = {
  phone: null,
  whatsapp: null,
  email: null,
  address: null,
  district: null,
  instagram: null,
  hero_headline: null,
  hero_highlight: null,
  hero_subtext: null,
  hero_bg_url: null,
  hero_cta_primary_label: null,
  hero_cta_primary_href: null,
  hero_cta_secondary_label: null,
  hero_cta_secondary_href: null,
  home_hero_overline: null,
  google_maps_url: null,
  academy_stats: null,
  coach_name: null,
  coach_title: null,
  coach_bio: null,
  coach_credentials: null,
  about_hero_headline: null,
  about_hero_highlight: null,
  about_hero_body: null,
  about_story_label: null,
  about_story_headline: null,
  about_story_highlight: null,
  about_story_paragraphs: null,
  about_founded_year: null,
  about_coach_label: null,
  about_values_label: null,
  about_values_headline: null,
  about_values_highlight: null,
  about_values_body: null,
  contact_hero_headline: null,
  contact_hero_body: null,
  contact_hours_days: null,
  contact_hours_time: null,
  contact_form_label: null,
  contact_form_headline: null,
  contact_channels_label: null,
  contact_channels_headline: null,
  class_faqs: null,
  home_cta_label: null,
  home_cta_headline: null,
  home_cta_headline_highlight: null,
  home_cta_headline_suffix: null,
  home_cta_body: null,
  home_cta_benefits: null,
  home_cta_form_title: null,
  home_cta_form_subtitle: null,
  home_features_label: null,
  home_features_headline: null,
  home_features_highlight: null,
  home_features_body: null,
  home_features_cards: null,
  home_classes_label: null,
  home_classes_headline: null,
  home_classes_highlight: null,
  home_classes_body: null,
  home_classes_link_label: null,
  home_announcements_label: null,
  home_announcements_headline: null,
  home_announcements_highlight: null,
  home_announcements_body: null,
  home_products_label: null,
  home_products_headline: null,
  home_products_highlight: null,
  home_products_body: null,
  about_values: null,
  about_cta_headline: null,
  about_cta_body: null,
  about_cta_primary_label: null,
  about_cta_secondary_label: null,
  classes_hero_label: null,
  classes_hero_headline: null,
  classes_hero_highlight: null,
  classes_hero_body: null,
  classes_groups_label: null,
  classes_groups_headline: null,
  classes_groups_highlight: null,
  classes_schedule_label: null,
  classes_schedule_headline: null,
  classes_schedule_highlight: null,
  classes_schedule_body: null,
  classes_faq_label: null,
  classes_faq_headline: null,
  classes_faq_highlight: null,
  classes_schedule: null,
  classes_cta_headline: null,
  classes_cta_body: null,
  classes_cta_button_label: null,
  announcements_hero_label: null,
  announcements_hero_headline: null,
  announcements_hero_highlight: null,
  announcements_hero_body: null,
  products_hero_label: null,
  products_hero_headline: null,
  products_hero_highlight: null,
  products_hero_body: null,
  products_cta_headline: null,
  products_cta_body: null,
  products_cta_button_label: null,
}

export const SITE_CONTENT_DEFAULTS: SiteContent = EMPTY

function str(d: Record<string, unknown>, k: string): string | null {
  const v = d[k]
  return typeof v === 'string' ? v : v == null ? null : String(v)
}

function arr<T>(d: Record<string, unknown>, k: string): T[] | null {
  const v = d[k]
  return Array.isArray(v) ? (v as T[]) : null
}

function mapRow(data: Record<string, unknown>): SiteContent {
  return {
    phone: str(data, 'phone'),
    whatsapp: str(data, 'whatsapp'),
    email: str(data, 'email'),
    address: str(data, 'address'),
    district: str(data, 'district'),
    instagram: str(data, 'instagram'),
    hero_headline: str(data, 'hero_headline'),
    hero_highlight: str(data, 'hero_highlight'),
    hero_subtext: str(data, 'hero_subtext'),
    hero_bg_url: str(data, 'hero_bg_url'),
    hero_cta_primary_label: str(data, 'hero_cta_primary_label'),
    hero_cta_primary_href: str(data, 'hero_cta_primary_href'),
    hero_cta_secondary_label: str(data, 'hero_cta_secondary_label'),
    hero_cta_secondary_href: str(data, 'hero_cta_secondary_href'),
    home_hero_overline: str(data, 'home_hero_overline'),
    google_maps_url: str(data, 'google_maps_url'),
    academy_stats: arr<StatItem>(data, 'academy_stats'),
    coach_name: str(data, 'coach_name'),
    coach_title: str(data, 'coach_title'),
    coach_bio: str(data, 'coach_bio'),
    coach_credentials: arr<string>(data, 'coach_credentials'),
    about_hero_headline: str(data, 'about_hero_headline'),
    about_hero_highlight: str(data, 'about_hero_highlight'),
    about_hero_body: str(data, 'about_hero_body'),
    about_story_label: str(data, 'about_story_label'),
    about_story_headline: str(data, 'about_story_headline'),
    about_story_highlight: str(data, 'about_story_highlight'),
    about_story_paragraphs: arr<string>(data, 'about_story_paragraphs'),
    about_founded_year: (data.about_founded_year as number | null) ?? null,
    about_coach_label: str(data, 'about_coach_label'),
    about_values_label: str(data, 'about_values_label'),
    about_values_headline: str(data, 'about_values_headline'),
    about_values_highlight: str(data, 'about_values_highlight'),
    about_values_body: str(data, 'about_values_body'),
    contact_hero_headline: str(data, 'contact_hero_headline'),
    contact_hero_body: str(data, 'contact_hero_body'),
    contact_hours_days: str(data, 'contact_hours_days'),
    contact_hours_time: str(data, 'contact_hours_time'),
    contact_form_label: str(data, 'contact_form_label'),
    contact_form_headline: str(data, 'contact_form_headline'),
    contact_channels_label: str(data, 'contact_channels_label'),
    contact_channels_headline: str(data, 'contact_channels_headline'),
    class_faqs: arr<FaqItem>(data, 'class_faqs'),
    home_cta_label: str(data, 'home_cta_label'),
    home_cta_headline: str(data, 'home_cta_headline'),
    home_cta_headline_highlight: str(data, 'home_cta_headline_highlight'),
    home_cta_headline_suffix: str(data, 'home_cta_headline_suffix'),
    home_cta_body: str(data, 'home_cta_body'),
    home_cta_benefits: arr<string>(data, 'home_cta_benefits'),
    home_cta_form_title: str(data, 'home_cta_form_title'),
    home_cta_form_subtitle: str(data, 'home_cta_form_subtitle'),
    home_features_label: str(data, 'home_features_label'),
    home_features_headline: str(data, 'home_features_headline'),
    home_features_highlight: str(data, 'home_features_highlight'),
    home_features_body: str(data, 'home_features_body'),
    home_features_cards: arr<FeatureCardItem>(data, 'home_features_cards'),
    home_classes_label: str(data, 'home_classes_label'),
    home_classes_headline: str(data, 'home_classes_headline'),
    home_classes_highlight: str(data, 'home_classes_highlight'),
    home_classes_body: str(data, 'home_classes_body'),
    home_classes_link_label: str(data, 'home_classes_link_label'),
    home_announcements_label: str(data, 'home_announcements_label'),
    home_announcements_headline: str(data, 'home_announcements_headline'),
    home_announcements_highlight: str(data, 'home_announcements_highlight'),
    home_announcements_body: str(data, 'home_announcements_body'),
    home_products_label: str(data, 'home_products_label'),
    home_products_headline: str(data, 'home_products_headline'),
    home_products_highlight: str(data, 'home_products_highlight'),
    home_products_body: str(data, 'home_products_body'),
    about_values: arr<ValueCardItem>(data, 'about_values'),
    about_cta_headline: str(data, 'about_cta_headline'),
    about_cta_body: str(data, 'about_cta_body'),
    about_cta_primary_label: str(data, 'about_cta_primary_label'),
    about_cta_secondary_label: str(data, 'about_cta_secondary_label'),
    classes_hero_label: str(data, 'classes_hero_label'),
    classes_hero_headline: str(data, 'classes_hero_headline'),
    classes_hero_highlight: str(data, 'classes_hero_highlight'),
    classes_hero_body: str(data, 'classes_hero_body'),
    classes_groups_label: str(data, 'classes_groups_label'),
    classes_groups_headline: str(data, 'classes_groups_headline'),
    classes_groups_highlight: str(data, 'classes_groups_highlight'),
    classes_schedule_label: str(data, 'classes_schedule_label'),
    classes_schedule_headline: str(data, 'classes_schedule_headline'),
    classes_schedule_highlight: str(data, 'classes_schedule_highlight'),
    classes_schedule_body: str(data, 'classes_schedule_body'),
    classes_faq_label: str(data, 'classes_faq_label'),
    classes_faq_headline: str(data, 'classes_faq_headline'),
    classes_faq_highlight: str(data, 'classes_faq_highlight'),
    classes_schedule: arr<ScheduleSlot>(data, 'classes_schedule'),
    classes_cta_headline: str(data, 'classes_cta_headline'),
    classes_cta_body: str(data, 'classes_cta_body'),
    classes_cta_button_label: str(data, 'classes_cta_button_label'),
    announcements_hero_label: str(data, 'announcements_hero_label'),
    announcements_hero_headline: str(data, 'announcements_hero_headline'),
    announcements_hero_highlight: str(data, 'announcements_hero_highlight'),
    announcements_hero_body: str(data, 'announcements_hero_body'),
    products_hero_label: str(data, 'products_hero_label'),
    products_hero_headline: str(data, 'products_hero_headline'),
    products_hero_highlight: str(data, 'products_hero_highlight'),
    products_hero_body: str(data, 'products_hero_body'),
    products_cta_headline: str(data, 'products_cta_headline'),
    products_cta_body: str(data, 'products_cta_body'),
    products_cta_button_label: str(data, 'products_cta_button_label'),
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .eq('id', 1)
    .maybeSingle()

  if (error || !data) return SITE_CONTENT_DEFAULTS

  return mapRow(data as unknown as Record<string, unknown>)
}

export async function updateSiteContent(
  input: Partial<SiteContent>,
): Promise<{ content: SiteContent | null; error: string | null }> {
  const { data, error } = await supabase
    .from('site_content')
    .update(input as never)
    .eq('id', 1)
    .select('*')
    .single()

  if (error || !data) return { content: null, error: error?.message ?? 'Güncelleme başarısız.' }

  return { content: mapRow(data as unknown as Record<string, unknown>), error: null }
}
