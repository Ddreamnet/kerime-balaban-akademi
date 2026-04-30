import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Pencil, Plus, Building2, Power } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { PageHeader, EmptyState } from '@/components/dashboard'
import {
  listAllBranches,
  createBranch,
  updateBranch,
  deactivateBranch,
  getChildrenCountByBranch,
  type Branch,
  type BillingModel,
} from '@/lib/branches'
import { formatCurrency } from '@/utils/format'
import { cn } from '@/utils/cn'

interface FormValues {
  code: string
  name: string
  billing_model: BillingModel
  default_package_size: string
  default_price: string
  sort_order: string
  is_active: boolean
}

const BILLING_LABELS: Record<BillingModel, string> = {
  monthly: 'Aylık abonelik',
  package: '8-Derslik paket',
}

const BILLING_DESCRIPTIONS: Record<BillingModel, string> = {
  monthly: 'Taekwondo gibi sürekli akış. Otomatik aylık fatura döngüsü.',
  package: 'Kickboks/cimnastik gibi paket bazlı. Her paket bittiğinde yeni paket + fatura.',
}

export function AdminBranchesPage() {
  const [items, setItems] = useState<Branch[]>([])
  const [childCounts, setChildCounts] = useState<Map<string, number>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [editing, setEditing] = useState<Branch | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const load = async () => {
    setIsLoading(true)
    const list = await listAllBranches()
    setItems(list)

    const counts = await Promise.all(
      list.map(async (b) => [b.id, await getChildrenCountByBranch(b.id)] as const),
    )
    setChildCounts(new Map(counts))
    setIsLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const handleToggleActive = async (branch: Branch) => {
    if (branch.is_active) {
      const cnt = childCounts.get(branch.id) ?? 0
      const msg = cnt > 0
        ? `Bu branşta ${cnt} öğrenci var. Pasif yaptığında yeni öğrenci eklenemez ama mevcutlar etkilenmez. Devam edilsin mi?`
        : 'Bu branş pasif yapılsın mı?'
      if (!confirm(msg)) return
      const { error } = await deactivateBranch(branch.id)
      if (error) {
        alert(`Pasif yapılamadı: ${error}`)
        return
      }
    } else {
      const { error: updateError } = await updateBranch(branch.id, { is_active: true })
      if (updateError) {
        alert(`Aktif yapılamadı: ${updateError}`)
        return
      }
    }
    await load()
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <PageHeader
        kicker="Yönetici Paneli"
        title="Branşlar"
        description={`${items.length} branş (${items.filter((b) => b.is_active).length} aktif)`}
        action={
          <Button variant="primary" size="md" onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4" />
            Yeni Branş
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Henüz branş yok"
          description="İlk branşı eklemek için yukarıdaki butonu kullan."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((branch) => {
            const childCount = childCounts.get(branch.id) ?? 0
            return (
              <Card
                key={branch.id}
                padding="md"
                className={cn(
                  'flex flex-col gap-3',
                  !branch.is_active && 'opacity-60',
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h3 className="font-display font-bold text-title-md text-on-surface">
                        {branch.name}
                      </h3>
                      <span className="text-label-sm text-on-surface/45 font-mono">
                        {branch.code}
                      </span>
                    </div>
                    <p className="text-body-sm text-on-surface/70 mt-0.5">
                      {BILLING_LABELS[branch.billing_model]}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-on-surface/70">
                  <span>
                    <strong className="text-on-surface">{childCount}</strong> öğrenci
                  </span>
                  {branch.billing_model === 'package' && (
                    <>
                      <span>
                        Paket boyu: <strong className="text-on-surface">{branch.default_package_size}</strong>
                      </span>
                      <span>
                        Varsayılan fiyat:{' '}
                        <strong
                          className={cn(
                            branch.default_price !== null
                              ? 'text-on-surface'
                              : 'text-amber-700',
                          )}
                        >
                          {branch.default_price !== null
                            ? formatCurrency(branch.default_price)
                            : '⚠ Belirsiz'}
                        </strong>
                      </span>
                    </>
                  )}
                  {branch.billing_model === 'package' &&
                    branch.default_price === null && (
                      <span className="w-full text-label-sm text-amber-700 bg-amber-50 rounded px-2 py-1 mt-1">
                        Bu branşta yeni paket başlarsa fatura tutarsız (NULL) oluşur.
                        Lütfen bir varsayılan fiyat gir.
                      </span>
                    )}
                  {!branch.is_active && (
                    <span className="text-wine font-semibold">Pasif</span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(branch)}
                    aria-label={branch.is_active ? 'Pasif yap' : 'Aktif yap'}
                  >
                    <Power className="w-4 h-4" />
                    {branch.is_active ? 'Pasif yap' : 'Aktif yap'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditing(branch)}
                  >
                    <Pencil className="w-4 h-4" />
                    Düzenle
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {isCreating && (
        <BranchFormModal
          onClose={() => setIsCreating(false)}
          onSaved={async () => {
            setIsCreating(false)
            await load()
          }}
        />
      )}

      {editing && (
        <BranchFormModal
          branch={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null)
            await load()
          }}
        />
      )}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────

interface BranchFormModalProps {
  branch?: Branch
  onClose: () => void
  onSaved: () => void
}

function BranchFormModal({ branch, onClose, onSaved }: BranchFormModalProps) {
  const isEdit = !!branch
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    defaultValues: branch
      ? {
          code: branch.code,
          name: branch.name,
          billing_model: branch.billing_model,
          default_package_size: String(branch.default_package_size),
          default_price: branch.default_price !== null ? String(branch.default_price) : '',
          sort_order: String(branch.sort_order),
          is_active: branch.is_active,
        }
      : {
          code: '',
          name: '',
          billing_model: 'package',
          default_package_size: '8',
          default_price: '',
          sort_order: '0',
          is_active: true,
        },
  })

  const billingModel = watch('billing_model')

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    setError(null)

    const payload = {
      code: values.code.trim().toLowerCase(),
      name: values.name.trim(),
      billing_model: values.billing_model,
      default_package_size: parseInt(values.default_package_size, 10) || 8,
      default_price: values.default_price.trim()
        ? parseFloat(values.default_price)
        : null,
      sort_order: parseInt(values.sort_order, 10) || 0,
      is_active: values.is_active,
    }

    const { error: saveError } = isEdit && branch
      ? await updateBranch(branch.id, payload)
      : await createBranch(payload)

    setIsSubmitting(false)

    if (saveError) {
      // Unique violation on code
      if (saveError.includes('duplicate key') || saveError.includes('unique')) {
        setError(`"${payload.code}" kodu zaten kullanılıyor. Farklı bir kod gir.`)
      } else {
        setError(saveError)
      }
      return
    }

    onSaved()
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={isEdit ? 'Branş Düzenle' : 'Yeni Branş'}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-lg bg-wine/10 border border-wine/20 px-3 py-2 text-body-sm text-wine">
            {error}
          </div>
        )}

        <Input
          label="Branş Adı"
          placeholder="Kickboks"
          error={errors.name?.message}
          {...register('name', {
            required: 'Branş adı zorunlu',
            minLength: { value: 2, message: 'En az 2 karakter' },
          })}
        />

        <div>
          <Input
            label="Kod (URL/Sistem)"
            placeholder="kickboks"
            error={errors.code?.message}
            disabled={isEdit}
            {...register('code', {
              required: 'Kod zorunlu',
              pattern: {
                value: /^[a-z0-9_]+$/,
                message: 'Sadece küçük harf, rakam ve _ kullan (örn: kickboks)',
              },
            })}
          />
          {isEdit && (
            <p className="text-label-sm text-on-surface/50 mt-1">
              Kod oluşturulduktan sonra değiştirilemez.
            </p>
          )}
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-body-sm font-semibold text-on-surface mb-1">
            Faturalandırma Modeli
          </legend>
          {(['package', 'monthly'] as BillingModel[]).map((model) => (
            <label
              key={model}
              className={cn(
                'flex items-start gap-3 rounded-xl border-2 p-3 cursor-pointer transition-colors',
                billingModel === model
                  ? 'border-primary bg-primary/5'
                  : 'border-surface-low hover:border-on-surface/20',
              )}
            >
              <input
                type="radio"
                value={model}
                {...register('billing_model', { required: true })}
                className="mt-1 accent-primary"
              />
              <div className="flex-1">
                <div className="font-semibold text-on-surface">{BILLING_LABELS[model]}</div>
                <div className="text-body-sm text-on-surface/65 mt-0.5">
                  {BILLING_DESCRIPTIONS[model]}
                </div>
              </div>
            </label>
          ))}
        </fieldset>

        {billingModel === 'package' && (
          <>
            <Input
              label="Paket Boyu (ders sayısı)"
              type="number"
              min="1"
              inputMode="numeric"
              error={errors.default_package_size?.message}
              {...register('default_package_size', {
                required: 'Paket boyu zorunlu',
                min: { value: 1, message: 'En az 1 ders' },
              })}
            />

            <Input
              label="Varsayılan Paket Fiyatı (₺)"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              placeholder="800"
              error={errors.default_price?.message}
              {...register('default_price', {
                min: { value: 0, message: 'Negatif olamaz' },
              })}
            />
            <p className="text-label-sm text-on-surface/50 -mt-2">
              Boş bırakılırsa paket oluşurken fiyat NULL olur. Per-öğrenci fiyat
              `Üyeler` sayfasında ayrıca girilebilir.
            </p>
          </>
        )}

        <Input
          label="Sıralama"
          type="number"
          {...register('sort_order')}
        />

        {isEdit && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('is_active')}
              className="accent-primary w-4 h-4"
            />
            <span className="text-body-md text-on-surface">Aktif</span>
          </label>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            İptal
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? <Spinner size="sm" /> : isEdit ? 'Kaydet' : 'Oluştur'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
