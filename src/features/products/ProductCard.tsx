import { MessageCircle, ShieldCheck } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Card } from '@/components/ui/Card'
import type { Product } from '@/types/content.types'
import { productCategoryLabels } from '@/data/products'
import { contactLinks } from '@/data/academyInfo'
import { formatCurrency } from '@/utils/format'

interface ProductCardProps {
  product: Product
}

const categoryIcons: Record<string, string> = {
  dobok: '🥋',
  koruyucu: '🛡️',
  aksesuar: '🎯',
  diger: '📦',
}

export function ProductCard({ product }: ProductCardProps) {
  const inquiryMessage = `Merhaba, "${product.name}" ürünü hakkında bilgi almak istiyorum.`
  const whatsappHref = `${contactLinks.whatsapp}&text=${encodeURIComponent(inquiryMessage)}`

  return (
    <Card className="flex flex-col gap-0 p-0 overflow-hidden" hoverable>
      <div className={cn('aspect-[4/3] bg-surface-low relative overflow-hidden')}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span className="text-5xl select-none opacity-40" aria-hidden="true">
              {categoryIcons[product.category] ?? '📦'}
            </span>
            <span className="text-label-sm text-on-surface/30 uppercase tracking-widest">
              Fotoğraf yakında
            </span>
          </div>
        )}

        {product.is_featured && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 bg-primary text-white rounded-full px-2.5 py-0.5 text-label-sm font-semibold">
              <ShieldCheck className="w-3 h-3" />
              Öne Çıkan
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-5">
        {/* Category */}
        <span className="text-label-sm text-on-surface/40 uppercase tracking-widest font-semibold">
          {productCategoryLabels[product.category] ?? product.category}
        </span>

        {/* Name */}
        <h3 className="font-display text-title-lg text-on-surface leading-tight">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-body-sm text-on-surface/60 leading-relaxed line-clamp-3">
          {product.description}
        </p>

        {/* Price or inquiry */}
        <div className="mt-auto pt-2 flex items-center justify-between gap-3">
          {product.price && !product.is_inquiry_only ? (
            <span className="font-display font-bold text-headline-sm text-on-surface">
              {formatCurrency(product.price)}
            </span>
          ) : (
            <span className="text-body-sm text-on-surface/40 italic">
              Fiyat için sorunuz
            </span>
          )}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-body-sm font-semibold"
          >
            <MessageCircle className="w-4 h-4" />
            Bilgi Al
          </a>
        </div>
      </div>
    </Card>
  )
}

/** Compact variant used on home page preview */
export function ProductCardCompact({ product }: ProductCardProps) {
  const inquiryMessage = `Merhaba, "${product.name}" ürünü hakkında bilgi almak istiyorum.`
  const whatsappHref = `${contactLinks.whatsapp}&text=${encodeURIComponent(inquiryMessage)}`

  return (
    <Card className="flex gap-4 items-start" hoverable>
      <div className="w-14 h-14 rounded-lg bg-surface-low flex items-center justify-center shrink-0 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl" aria-hidden="true">
            {categoryIcons[product.category] ?? '📦'}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <span className="text-label-sm text-on-surface/40 uppercase tracking-widest">
          {productCategoryLabels[product.category]}
        </span>
        <h3 className="font-display text-title-md text-on-surface truncate">{product.name}</h3>
        <p className="text-body-sm text-on-surface/55 line-clamp-2">{product.description}</p>
      </div>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${product.name} hakkında WhatsApp ile bilgi al`}
        className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
      </a>
    </Card>
  )
}
