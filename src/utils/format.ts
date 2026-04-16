/**
 * Turkish locale formatting utilities.
 * All date/number formatting should go through here so
 * swapping locale is a one-line change.
 */

const LOCALE = 'tr-TR'

/** Format a date to Turkish long format: "15 Nisan 2024" */
export function formatDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Format a date to Turkish short format: "15.04.2024" */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(LOCALE)
}

/** Format a date to relative Turkish: "2 gün önce" */
export function formatDateRelative(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Bugün'
  if (diffDays === 1) return 'Dün'
  if (diffDays < 7) return `${diffDays} gün önce`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} ay önce`
  return `${Math.floor(diffDays / 365)} yıl önce`
}

/** Format currency in Turkish Lira */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString(LOCALE, {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

/** Format a phone number for display: "+90 533 123 45 67" */
export function formatPhone(raw: string): string {
  return raw
}

/** Build a WhatsApp URL */
export function whatsappUrl(phone: string, message?: string): string {
  const clean = phone.replace(/\D/g, '')
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${clean}${text}`
}
