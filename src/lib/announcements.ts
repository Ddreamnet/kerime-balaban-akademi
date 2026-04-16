/**
 * Announcements service — CRUD for the announcements table.
 */

import { supabase } from './supabase'
import type { Announcement, AnnouncementCategory } from '@/types/content.types'

export interface AnnouncementInput {
  title: string
  excerpt: string
  content: string
  category: AnnouncementCategory
  image_url?: string | null
  is_pinned?: boolean
  is_published?: boolean
  published_at?: string
}

function mapAnnouncement(row: {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  image_url: string | null
  published_at: string
  is_pinned: boolean
  is_published: boolean
}): Announcement {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    category: row.category as AnnouncementCategory,
    image_url: row.image_url ?? undefined,
    published_at: row.published_at,
    is_pinned: row.is_pinned,
    is_published: row.is_published,
  }
}

/** Public: only published announcements, pinned first, most recent first */
export async function listPublishedAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_published', true)
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false })

  if (error || !data) return []
  return data.map(mapAnnouncement)
}

/** Admin: all announcements including unpublished drafts */
export async function listAllAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false })

  if (error || !data) return []
  return data.map(mapAnnouncement)
}

export async function createAnnouncement(
  input: AnnouncementInput,
): Promise<{ announcement: Announcement | null; error: string | null }> {
  const { data, error } = await supabase
    .from('announcements')
    .insert({
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      category: input.category,
      image_url: input.image_url ?? null,
      is_pinned: input.is_pinned ?? false,
      is_published: input.is_published ?? true,
      published_at: input.published_at ?? new Date().toISOString(),
    })
    .select('*')
    .single()

  if (error || !data) return { announcement: null, error: error?.message ?? 'Oluşturma başarısız.' }
  return { announcement: mapAnnouncement(data), error: null }
}

export async function updateAnnouncement(
  id: string,
  input: Partial<AnnouncementInput>,
): Promise<{ announcement: Announcement | null; error: string | null }> {
  const { data, error } = await supabase
    .from('announcements')
    .update({
      ...(input.title !== undefined && { title: input.title }),
      ...(input.excerpt !== undefined && { excerpt: input.excerpt }),
      ...(input.content !== undefined && { content: input.content }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.image_url !== undefined && { image_url: input.image_url }),
      ...(input.is_pinned !== undefined && { is_pinned: input.is_pinned }),
      ...(input.is_published !== undefined && { is_published: input.is_published }),
      ...(input.published_at !== undefined && { published_at: input.published_at }),
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error || !data) return { announcement: null, error: error?.message ?? 'Güncelleme başarısız.' }
  return { announcement: mapAnnouncement(data), error: null }
}

export async function deleteAnnouncement(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('announcements').delete().eq('id', id)
  return { error: error?.message ?? null }
}
