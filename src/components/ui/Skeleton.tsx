import { cn } from '@/utils/cn'

interface SkeletonProps {
  className?: string
}

/**
 * Loading placeholder — `animate-pulse` ile düşük dikkat-çeken bir yanıp sönme.
 * Cold-start'ta blank ekran yerine layout iskeletini göstermek için kullanın.
 *
 * Kullanım:
 *   <Skeleton className="h-4 w-32" />          // tek satır metin
 *   <Skeleton className="h-32 rounded-xl" />    // card placeholder
 *
 * `prefers-reduced-motion: reduce` aktifse animasyon globals.css üzerinden
 * otomatik durur (kullanıcı OS tercihi).
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-on-surface/10',
        className,
      )}
      aria-hidden="true"
    />
  )
}

/** Tipik bir StatCard'ın iskelet versiyonu — dashboard cold-start için */
export function SkeletonStatCard() {
  return (
    <div className="rounded-2xl bg-surface-card p-5 shadow-ambient flex flex-col gap-2">
      <Skeleton className="h-9 w-9 rounded-xl" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-7 w-12" />
    </div>
  )
}

/** Tipik bir liste satırı (öğrenci, ödeme vb.) iskelet versiyonu */
export function SkeletonListRow() {
  return (
    <div className="rounded-xl bg-surface-card p-3 shadow-ambient flex items-center gap-3">
      <Skeleton className="h-11 w-11 rounded-xl" />
      <div className="flex-1 flex flex-col gap-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  )
}
