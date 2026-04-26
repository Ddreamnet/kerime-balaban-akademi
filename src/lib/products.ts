/**
 * Products service — CRUD for products table.
 */

import { supabase } from './supabase'
import type { Product, ProductCategory } from '@/types/content.types'

export interface ProductInput {
  name: string
  description: string
  category: ProductCategory
  image_url?: string | null
  price?: number | null
  is_inquiry_only?: boolean
  is_featured?: boolean
  is_available?: boolean
  sort_order?: number
}

function mapProduct(row: {
  id: string
  name: string
  description: string
  category: string
  image_url: string | null
  price: number | null
  is_inquiry_only: boolean
  is_featured: boolean
  is_available: boolean
  sort_order: number
}): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category as ProductCategory,
    image_url: row.image_url ?? undefined,
    price: row.price ?? undefined,
    is_inquiry_only: row.is_inquiry_only,
    is_featured: row.is_featured,
    is_available: row.is_available,
    sort_order: row.sort_order,
  }
}

/** Public: only available products */
export async function listAvailableProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_available', true)
    .order('sort_order', { ascending: true })

  if (error || !data) return []
  return data.map(mapProduct)
}

/** Admin: all products including unavailable */
export async function listAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error || !data) return []
  return data.map(mapProduct)
}

export async function createProduct(
  input: ProductInput,
): Promise<{ product: Product | null; error: string | null }> {
  let sortOrder = input.sort_order
  if (sortOrder === undefined) {
    const { data: maxRow } = await supabase
      .from('products')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()
    sortOrder = (maxRow?.sort_order ?? 0) + 1
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      name: input.name,
      description: input.description,
      category: input.category,
      image_url: input.image_url ?? null,
      price: input.price ?? null,
      is_inquiry_only: input.is_inquiry_only ?? true,
      is_featured: input.is_featured ?? false,
      is_available: input.is_available ?? true,
      sort_order: sortOrder,
    })
    .select('*')
    .single()

  if (error || !data) return { product: null, error: error?.message ?? 'Oluşturma başarısız.' }
  return { product: mapProduct(data), error: null }
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>,
): Promise<{ product: Product | null; error: string | null }> {
  const { data, error } = await supabase
    .from('products')
    .update({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.image_url !== undefined && { image_url: input.image_url }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.is_inquiry_only !== undefined && { is_inquiry_only: input.is_inquiry_only }),
      ...(input.is_featured !== undefined && { is_featured: input.is_featured }),
      ...(input.is_available !== undefined && { is_available: input.is_available }),
      ...(input.sort_order !== undefined && { sort_order: input.sort_order }),
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error || !data) return { product: null, error: error?.message ?? 'Güncelleme başarısız.' }
  return { product: mapProduct(data), error: null }
}

export async function deleteProduct(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  return { error: error?.message ?? null }
}

/** Persist a new ordering. `orderedIds` is the desired order; sort_order is set to its index + 1. */
export async function reorderProducts(orderedIds: string[]): Promise<{ error: string | null }> {
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('products').update({ sort_order: index + 1 }).eq('id', id),
    ),
  )
  const failed = results.find((r) => r.error)
  return { error: failed?.error?.message ?? null }
}
