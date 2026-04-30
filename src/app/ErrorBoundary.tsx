import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Root-level error boundary. Yakalanmamış React render hataları white screen
 * yerine kullanıcı-dostu fallback gösterir + "yeniden yükle" butonu sunar.
 *
 * componentDidCatch sadece render/lifecycle/constructor hatalarını yakalar —
 * event handler'lardaki async hatalar yakalanmaz, onlar try/catch'le UI'da
 * toast olarak gösterilir.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Production hata tracking buraya gelir (örn. Sentry.captureException).
    // Şu an sadece console — error tracking eklenince burayı güncelle.
    if (typeof console !== 'undefined') {
      console.error('[ErrorBoundary]', error, info.componentStack)
    }
  }

  handleReload = (): void => {
    window.location.reload()
  }

  handleHome = (): void => {
    window.location.href = '/'
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="min-h-dvh flex items-center justify-center bg-surface px-6 py-12">
          <div className="max-w-md w-full bg-surface-card rounded-2xl shadow-ambient-lg p-8 flex flex-col items-center gap-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="font-display font-bold text-headline-sm text-on-surface">
                Beklenmeyen bir hata oluştu
              </h1>
              <p className="text-body-md text-on-surface/65">
                Üzgünüz, bir şeyler ters gitti. Sayfayı yenileyerek devam edebilir,
                ya da anasayfaya dönebilirsin.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full mt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="bg-gradient-primary text-white font-display font-semibold rounded-lg min-h-btn px-6 hover:scale-[1.02] transition-transform"
              >
                Sayfayı Yenile
              </button>
              <button
                type="button"
                onClick={this.handleHome}
                className="text-body-sm text-on-surface/55 hover:text-primary transition-colors py-2"
              >
                Anasayfaya Dön
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
