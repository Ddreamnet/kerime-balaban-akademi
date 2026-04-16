import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Pencil, Trash2, Plus, ShoppingBag, Star } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import {
  listAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductInput,
} from '@/lib/products'
import type { Product, ProductCategory } from '@/types/content.types'
import { productCategoryLabels } from '@/data/products'
import { formatCurrency } from '@/utils/format'
import { cn } from '@/utils/cn'

interface FormValues {
  name: string
  description: string
  category: ProductCategory
  image_url: string
  price: string
  sort_order: number
  is_inquiry_only: boolean
  is_featured: boolean
  is_available: boolean
}

const CATEGORIES: ProductCategory[] = ['dobok', 'koruyucu', 'aksesuar', 'diger']

export function AdminProductsPage() {
  const [items, setItems] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editing, setEditing] = useState<Product | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = async () => {
    setIsLoading(true)
    const list = await listAllProducts()
    setItems(list)
    setIsLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return
    setDeletingId(id)
    const { error } = await deleteProduct(id)
    if (!error) setItems((prev) => prev.filter((p) => p.id !== id))
    setDeletingId(null)
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <p className="text-label-md text-primary uppercase tracking-widest">Yönetici Paneli</p>
          <h1 className="font-display text-headline-lg text-on-surface">Ürünler</h1>
          <p className="text-body-md text-on-surface/60 mt-1">
            {items.length} ürün ({items.filter((p) => p.is_available).length} satışta)
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4" />
          Yeni Ürün
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-surface-low flex items-center justify-center">
            <ShoppingBag className="w-7 h-7 text-on-surface/40" />
          </div>
          <p className="font-display font-bold text-title-lg text-on-surface">
            Henüz ürün yok
          </p>
          <p className="text-body-md text-on-surface/60">
            İlk ürünü eklemek için üstteki butonu kullanın.
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((p) => (
            <Card key={p.id} className={cn('flex flex-col gap-3', !p.is_available && 'opacity-60')}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary">{productCategoryLabels[p.category]}</Badge>
                  {p.is_featured && (
                    <Badge variant="primary">
                      <Star className="w-3 h-3 mr-1 inline" />
                      Öne Çıkan
                    </Badge>
                  )}
                  {!p.is_available && <Badge variant="warning">Kapalı</Badge>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(p)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(p.id)}
                    loading={deletingId === p.id}
                    className="text-primary hover:bg-primary/5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <h3 className="font-display text-title-md text-on-surface">{p.name}</h3>
              <p className="text-body-sm text-on-surface/60 line-clamp-2">{p.description}</p>

              <div className="mt-auto">
                {p.price !== undefined ? (
                  <p className="font-display font-bold text-title-lg text-on-surface">
                    {formatCurrency(p.price)}
                  </p>
                ) : (
                  <p className="text-body-sm text-on-surface/40 italic">Fiyat sorulur</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ProductFormModal
        isOpen={isCreating || editing !== null}
        existing={editing}
        onClose={() => {
          setEditing(null)
          setIsCreating(false)
        }}
        onSaved={() => {
          setEditing(null)
          setIsCreating(false)
          void load()
        }}
      />
    </div>
  )
}

interface FormModalProps {
  isOpen: boolean
  existing: Product | null
  onClose: () => void
  onSaved: () => void
}

function ProductFormModal({ isOpen, existing, onClose, onSaved }: FormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    values: isOpen
      ? {
          name: existing?.name ?? '',
          description: existing?.description ?? '',
          category: existing?.category ?? 'dobok',
          image_url: existing?.image_url ?? '',
          price: existing?.price?.toString() ?? '',
          sort_order: existing?.sort_order ?? 0,
          is_inquiry_only: existing?.is_inquiry_only ?? true,
          is_featured: existing?.is_featured ?? false,
          is_available: existing?.is_available ?? true,
        }
      : undefined,
  })

  const category = watch('category')
  const isInquiryOnly = watch('is_inquiry_only')
  const isFeatured = watch('is_featured')
  const isAvailable = watch('is_available')

  const onSubmit = async (data: FormValues) => {
    const priceNum = data.price.trim() === '' ? null : Number(data.price)
    if (priceNum !== null && (isNaN(priceNum) || priceNum < 0)) {
      setError('price', { message: 'Geçerli bir fiyat girin veya boş bırakın.' })
      return
    }

    const payload: ProductInput = {
      name: data.name,
      description: data.description,
      category: data.category,
      image_url: data.image_url || null,
      price: priceNum,
      is_inquiry_only: data.is_inquiry_only,
      is_featured: data.is_featured,
      is_available: data.is_available,
      sort_order: Number(data.sort_order),
    }

    const { error } = existing
      ? await updateProduct(existing.id, payload)
      : await createProduct(payload)

    if (error) {
      setError('root', { message: error })
      return
    }

    reset()
    onSaved()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existing ? 'Ürünü düzenle' : 'Yeni ürün'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          label="Ürün Adı"
          type="text"
          placeholder="Örn. Çocuk Doboku"
          error={errors.name?.message}
          {...register('name', { required: 'Ürün adı gereklidir.' })}
        />

        <Textarea
          label="Açıklama"
          placeholder="Ürün detayları"
          rows={3}
          error={errors.description?.message}
          {...register('description', { required: 'Açıklama gereklidir.' })}
        />

        {/* Category */}
        <div className="flex flex-col gap-2">
          <span className="text-label-md text-on-surface/80 font-medium">Kategori</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setValue('category', c)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-label-md uppercase tracking-widest font-semibold transition-colors',
                  category === c
                    ? 'bg-primary text-white'
                    : 'bg-surface-low text-on-surface/60 hover:bg-surface-high'
                )}
              >
                {productCategoryLabels[c]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Fiyat (TL)"
            type="number"
            min={0}
            placeholder="Boş = soru üzerine"
            hint="Fiyat gizliyse boş bırakın"
            error={errors.price?.message}
            {...register('price')}
          />
          <Input
            label="Sıralama"
            type="number"
            hint="Küçük = üstte"
            {...register('sort_order', { valueAsNumber: true })}
          />
        </div>

        <Input
          label="Görsel URL (opsiyonel)"
          type="url"
          placeholder="https://..."
          error={errors.image_url?.message}
          {...register('image_url')}
        />

        <div className="flex flex-col gap-2">
          <ToggleRow
            label="Öne Çıkan"
            description="Ana sayfa ürünler bölümünde gösterilir."
            checked={isFeatured}
            onChange={(v) => setValue('is_featured', v)}
          />
          <ToggleRow
            label="Sadece Soruyla"
            description="Fiyat direkt gösterilmez, iletişim tetiklenir."
            checked={isInquiryOnly}
            onChange={(v) => setValue('is_inquiry_only', v)}
          />
          <ToggleRow
            label="Satışta"
            description="Kapalı ürünler herkese açık sayfada görünmez."
            checked={isAvailable}
            onChange={(v) => setValue('is_available', v)}
          />
        </div>

        {errors.root && (
          <p className="text-body-sm text-primary bg-primary-container rounded-md px-3 py-2" role="alert">
            {errors.root.message}
          </p>
        )}

        <div className="flex gap-2 mt-2">
          <Button type="button" variant="ghost" size="md" onClick={onClose} className="flex-1">
            İptal
          </Button>
          <Button type="submit" variant="primary" size="md" loading={isSubmitting} className="flex-1">
            {existing ? 'Güncelle' : 'Oluştur'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

interface ToggleRowProps {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 bg-surface-low rounded-md p-3 text-left hover:bg-surface-high transition-colors"
    >
      <div>
        <p className="font-display font-semibold text-body-md text-on-surface">{label}</p>
        <p className="text-body-sm text-on-surface/50">{description}</p>
      </div>
      <div className={cn('w-10 h-6 rounded-full relative transition-colors shrink-0', checked ? 'bg-primary' : 'bg-on-surface/20')}>
        <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-4' : 'translate-x-0.5')} />
      </div>
    </button>
  )
}
