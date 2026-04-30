/**
 * Packages service — 8-derslik paket sistemi (kickboks, cimnastik).
 *
 * Paket oluşturma DB trigger'da implicit consent ile otomatik (attendance
 * INSERT'te tetiklenir). Bu lib sadece okuma + admin abandon işlemlerini
 * sağlar.
 */

import { supabase } from './supabase'
import { todayIsoTrt } from '@/utils/format'

export type PackageStatus = 'active' | 'completed' | 'abandoned'

export interface Package {
  id: string
  child_id: string
  branch_id: string
  class_id: string | null
  package_number: number
  total_slots: number
  used_slots: number
  telafi_granted: boolean
  start_date: string | null
  planned_end_date: string | null
  actual_end_date: string | null
  price: number | null
  status: PackageStatus
  payment_id: string | null
  created_at: string
  updated_at: string
}

export interface PackageProgress {
  used_slots: number
  total_slots: number
  remaining: number
  telafi_granted: boolean
  /** is_extra=true olan lesson sayısı — paketteki excused/cancel sayısı */
  extra_count: number
  /** "5/8" formatında x/y string */
  display: string
  status: PackageStatus
  planned_end_date: string | null
}

function mapPackage(row: {
  id: string
  child_id: string
  branch_id: string
  class_id: string | null
  package_number: number
  total_slots: number
  used_slots: number
  telafi_granted: boolean
  start_date: string | null
  planned_end_date: string | null
  actual_end_date: string | null
  price: number | null
  status: string
  payment_id: string | null
  created_at: string
  updated_at: string
}): Package {
  return {
    id: row.id,
    child_id: row.child_id,
    branch_id: row.branch_id,
    class_id: row.class_id,
    package_number: row.package_number,
    total_slots: row.total_slots,
    used_slots: row.used_slots,
    telafi_granted: row.telafi_granted,
    start_date: row.start_date,
    planned_end_date: row.planned_end_date,
    actual_end_date: row.actual_end_date,
    price: row.price,
    status: row.status as PackageStatus,
    payment_id: row.payment_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

/** Çocuğun aktif paketi (status='active'). Yoksa null — implicit consent için marker. */
export async function getActivePackage(childId: string): Promise<Package | null> {
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('child_id', childId)
    .eq('status', 'active')
    .order('package_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null
  return mapPackage(data)
}

/** Çocuğun tüm paketleri (geçmiş dahil) */
export async function listPackagesByChild(childId: string): Promise<Package[]> {
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('child_id', childId)
    .order('package_number', { ascending: false })

  if (error || !data) return []
  return data.map(mapPackage)
}

/** Aktif paketin progress'i. Yoksa null. Coach UI'daki "x/8" göstergesi için. */
export async function getPackageProgress(childId: string): Promise<PackageProgress | null> {
  const pkg = await getActivePackage(childId)
  if (!pkg) return null

  // Extra lesson count (paket boyu eklenen mazeretli/cancel lesson sayısı)
  const { count: extraCount } = await supabase
    .from('lessons')
    .select('id', { count: 'exact', head: true })
    .eq('package_id', pkg.id)
    .eq('is_extra', true)

  return {
    used_slots: pkg.used_slots,
    total_slots: pkg.total_slots,
    remaining: pkg.total_slots - pkg.used_slots,
    telafi_granted: pkg.telafi_granted,
    extra_count: extraCount ?? 0,
    display: `${pkg.used_slots}/${pkg.total_slots}`,
    status: pkg.status,
    planned_end_date: pkg.planned_end_date,
  }
}

/**
 * Birden fazla çocuk için progress'i toplu çek (yoklama UI'da liste görünümü).
 * Aktif paketsiz çocuklar için Map'te değer yoktur — UI "🆕 Yeni paket" badge gösterir.
 */
export async function getPackageProgressMap(
  childIds: string[],
): Promise<Map<string, PackageProgress>> {
  if (childIds.length === 0) return new Map()

  const { data: packages } = await supabase
    .from('packages')
    .select('*')
    .in('child_id', childIds)
    .eq('status', 'active')

  if (!packages || packages.length === 0) return new Map()

  // Tüm paketler için extra_count'ları tek sorguda topla
  const packageIds = packages.map((p: { id: string }) => p.id)
  const { data: extras } = await supabase
    .from('lessons')
    .select('package_id')
    .in('package_id', packageIds)
    .eq('is_extra', true)

  const extraCountMap = new Map<string, number>()
  for (const row of (extras ?? []) as { package_id: string }[]) {
    extraCountMap.set(row.package_id, (extraCountMap.get(row.package_id) ?? 0) + 1)
  }

  const result = new Map<string, PackageProgress>()
  for (const row of packages as Parameters<typeof mapPackage>[0][]) {
    const pkg = mapPackage(row)
    result.set(pkg.child_id, {
      used_slots: pkg.used_slots,
      total_slots: pkg.total_slots,
      remaining: pkg.total_slots - pkg.used_slots,
      telafi_granted: pkg.telafi_granted,
      extra_count: extraCountMap.get(pkg.id) ?? 0,
      display: `${pkg.used_slots}/${pkg.total_slots}`,
      status: pkg.status,
      planned_end_date: pkg.planned_end_date,
    })
  }
  return result
}

/**
 * Admin: paketi 'abandoned' statüsüne çek (öğrenci bıraktı, refund yok).
 * Yan etki: scheduled lesson'lar otomatik silinmez (audit için), sadece
 * status değişir. İleride aktif paket sayılmaz.
 */
export async function abandonPackage(
  packageId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('packages')
    .update({ status: 'abandoned', actual_end_date: todayIsoTrt() })
    .eq('id', packageId)
  return { error: error?.message ?? null }
}

/** Admin overview: branş+statüye göre paket sayısı (raporlama için). */
export interface PackageBranchSummary {
  branch_id: string
  active: number
  completed: number
  abandoned: number
}

export async function summarizePackagesByBranch(): Promise<PackageBranchSummary[]> {
  const { data, error } = await supabase
    .from('packages')
    .select('branch_id, status')

  if (error || !data) return []

  const map = new Map<string, PackageBranchSummary>()
  for (const row of data as { branch_id: string; status: string }[]) {
    const cur = map.get(row.branch_id) ?? {
      branch_id: row.branch_id,
      active: 0,
      completed: 0,
      abandoned: 0,
    }
    if (row.status === 'active') cur.active += 1
    else if (row.status === 'completed') cur.completed += 1
    else if (row.status === 'abandoned') cur.abandoned += 1
    map.set(row.branch_id, cur)
  }
  return [...map.values()]
}
