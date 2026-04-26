import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh flex items-center justify-center bg-surface px-4">
      <div className="text-center flex flex-col items-center gap-6">
        <Link
          to="/"
          aria-label="Kerime Balaban Akademi — Anasayfa"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
        >
          <img
            src="/images/logo-renkli.png"
            alt="Kerime Balaban Akademi"
            className="h-14 w-auto object-contain"
            draggable={false}
          />
        </Link>
        <div>
          <p className="text-label-md text-primary uppercase tracking-widest mb-3">404</p>
          <h1 className="font-display text-display-sm text-on-surface mb-3">
            Sayfa Bulunamadı
          </h1>
          <p className="text-body-lg text-on-surface/60 max-w-sm">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={() => navigate('/')}>
          Anasayfaya Dön
        </Button>
      </div>
    </div>
  )
}
