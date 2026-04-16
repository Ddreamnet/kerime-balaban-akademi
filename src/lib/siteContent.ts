/**
 * Site Content service — single-row admin-editable public settings.
 * Keys mirror src/data/academyInfo.ts which acts as a fallback when
 * the DB row has a null value.
 */

import { supabase } from './supabase'

export interface SiteContent {
  phone: string | null
  whatsapp: string | null
  email: string | null
  address: string | null
  district: string | null
  instagram: string | null
  hero_headline: string | null
  hero_highlight: string | null
  hero_subtext: string | null
  hero_bg_url: string | null
  google_maps_url: string | null
}

export const SITE_CONTENT_DEFAULTS: SiteContent = {
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
  google_maps_url: null,
}

export async function getSiteContent(): Promise<SiteContent> {
  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .eq('id', 1)
    .maybeSingle()

  if (error || !data) return SITE_CONTENT_DEFAULTS

  return {
    phone: data.phone,
    whatsapp: data.whatsapp,
    email: data.email,
    address: data.address,
    district: data.district,
    instagram: data.instagram,
    hero_headline: data.hero_headline,
    hero_highlight: data.hero_highlight,
    hero_subtext: data.hero_subtext,
    hero_bg_url: data.hero_bg_url,
    google_maps_url: data.google_maps_url,
  }
}

export async function updateSiteContent(
  input: Partial<SiteContent>,
): Promise<{ content: SiteContent | null; error: string | null }> {
  const { data, error } = await supabase
    .from('site_content')
    .update(input)
    .eq('id', 1)
    .select('*')
    .single()

  if (error || !data) return { content: null, error: error?.message ?? 'Güncelleme başarısız.' }

  return {
    content: {
      phone: data.phone,
      whatsapp: data.whatsapp,
      email: data.email,
      address: data.address,
      district: data.district,
      instagram: data.instagram,
      hero_headline: data.hero_headline,
      hero_highlight: data.hero_highlight,
      hero_subtext: data.hero_subtext,
      hero_bg_url: data.hero_bg_url,
      google_maps_url: data.google_maps_url,
    },
    error: null,
  }
}
