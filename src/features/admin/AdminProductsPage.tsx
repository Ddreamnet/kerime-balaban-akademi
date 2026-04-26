import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Pencil, Trash2, Plus, ShoppingBag, Star, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { KeyboardSensor } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { PageHeader, EmptyState } from '@/components/dashboard'
import {
  listAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  reorderProducts,
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((p) => p.id === active.id)
    const newIndex = items.findIndex((p) => p.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const next = arrayMove(items, oldIndex, newIndex).map((p, i) => ({
      ...p,
      sort_order: i + 1,
    }))
    setItems(next)

    const { error } = await reorderProducts(next.map((p) => p.id))
    if (error) {
      await load()
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <PageHeader
        kicker="Yönetici Paneli"
        title="Ürünler"
        description={`${items.length} ürün (${items.filter((p) => p.is_available).length} satışta)`}
        action={
          <Button variant="primary" size="md" onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4" />
            Yeni Ürün
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Henüz ürün yok"
          description="İlk ürünü eklemek için üstteki butonu kullanın."
          action={
            <Button variant="primary" size="md" onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4" />
              Yeni Ürün
            </Button>
          }
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((p) => p.id)} strategy={rectSortingStrategy}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((p, index) => (
                <SortableProductCard
                  key={p.id}
                  product={p}
                  order={index + 1}
                  onEdit={() => setEditing(p)}
                  onDelete={() => handleDelete(p.id)}
                  isDeleting={deletingId === p.id}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
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

interface SortableProductCardProps {
  product: Product
  order: number
  onEdit: () => void
  onDelete: () => void
  isDeleting: boolean
}

function SortableProductCard({ product, order, onEdit, onDelete, isDeleting }: SortableProductCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('h-full transition-shadow', isDragging && 'z-10 shadow-xl opacity-90')}
    >
      <Card className={cn('flex flex-col gap-4 h-full', !product.is_available && 'opacity-60')}>
        {/* Header: order + category + drag handle */}
        <div className="flex items-center justify-between gap-2 -mr-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 text-primary font-display font-bold text-label-md tabular-nums">
              {order}
            </span>
            <span className="text-label-sm uppercase tracking-wider font-semibold text-on-surface/55 truncate">
              {productCategoryLabels[product.category]}
            </span>
            {!product.is_available && (
              <span className="shrink-0 text-label-sm uppercase tracking-wider font-semibold text-yellow-700">
                · Kapalı
              </span>
            )}
          </div>
          <button
            type="button"
            aria-label="Sürükleyerek sırala"
            className="shrink-0 p-1.5 rounded-md text-on-surface/30 hover:text-on-surface/70 hover:bg-surface-low touch-none cursor-grab active:cursor-grabbing transition-colors"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Body: name + description */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-start gap-1.5">
            <h3 className="flex-1 min-w-0 font-display font-bold text-title-md text-on-surface leading-tight">
              {product.name}
            </h3>
            {product.is_featured && (
              <Star
                className="shrink-0 mt-0.5 w-4 h-4 text-primary fill-primary"
                aria-label="Öne çıkan"
              />
            )}
          </div>
          <p className="text-body-sm text-on-surface/60 line-clamp-2">{product.description}</p>
        </div>

        {/* Footer: price + actions */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3 -mr-1.5 border-t border-on-surface/5">
          <div className="min-w-0">
            {product.price !== undefined ? (
              <p className="font-display font-bold text-title-md text-on-surface tabular-nums">
                {formatCurrency(product.price)}
              </p>
            ) : (
              <p className="text-body-sm text-on-surface/40 italic">Fiyat sorulur</p>
            )}
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              aria-label="Düzenle"
              onClick={onEdit}
              className="p-2 rounded-md text-on-surface/50 hover:text-on-surface hover:bg-surface-low transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Sil"
              onClick={onDelete}
              disabled={isDeleting}
              className="p-2 rounded-md text-on-surface/50 hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
            >
              {isDeleting ? <Spinner size="sm" color="inherit" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </Card>
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
  const imageUrl = watch('image_url')

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

        <Input
          label="Fiyat (TL)"
          type="number"
          min={0}
          placeholder="Boş = soru üzerine"
          hint="Fiyat gizliyse boş bırakın"
          error={errors.price?.message}
          {...register('price')}
        />

        <ImageUpload
          label="Görsel (opsiyonel)"
          folder="products"
          value={imageUrl || null}
          hint="Kameradan çek veya galeriden seç. JPEG / PNG / WebP, en fazla 5 MB."
          onChange={(url) => setValue('image_url', url ?? '', { shouldDirty: true })}
        />
        <input type="hidden" {...register('image_url')} />

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
