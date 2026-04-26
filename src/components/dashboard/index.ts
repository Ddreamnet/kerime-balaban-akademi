/**
 * Shared dashboard building blocks.
 *
 * These pieces standardise the visual language used by admin/coach/parent
 * panels — page headers, stat cards, empty states, etc. Always import
 * from here rather than from the individual files so a future move/rename
 * doesn't break call sites.
 */

export { PageHeader } from './PageHeader'
export { StatCard } from './StatCard'
export type { StatTone } from './StatCard'
export { EmptyState } from './EmptyState'
export { SectionTitle } from './SectionTitle'
export { MetaList } from './MetaList'
export type { MetaItem } from './MetaList'
export { PanelCard } from './PanelCard'
export type { PanelCardTone } from './PanelCard'
