import { Link } from 'react-router-dom'
import { MapPin, Phone, MessageCircle, Instagram } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Container } from './Container'
import { academyInfo } from '@/data/academyInfo'
import { useSiteSettings } from '@/hooks/useSiteSettings'

const quickLinks = [
  { label: 'Anasayfa', href: '/' },
  { label: 'Dersler', href: '/dersler' },
  { label: 'Ürünler', href: '/urunler' },
  { label: 'Hakkımızda', href: '/hakkimizda' },
  { label: 'Duyurular', href: '/duyurular' },
  { label: 'İletişim', href: '/iletisim' },
]

/**
 * Minimal footer — academy identity + contact + quick links.
 * Deliberately lightweight, not overloaded.
 * Uses surface color shift for separation (no top border).
 */
export function Footer() {
  const currentYear = new Date().getFullYear()
  const settings = useSiteSettings()

  return (
    <footer className="bg-on-surface text-white/80">
      <Container>
        {/* Main footer grid */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 w-fit" aria-label="Anasayfa">
              <div className="w-9 h-9 rounded-md bg-gradient-primary flex items-center justify-center shadow-primary-glow/10">
                <span className="font-display font-black text-white text-sm tracking-tight">KBA</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-white text-sm tracking-tight">Kerime Balaban</span>
                <span className="font-display font-semibold text-primary-gradient text-xs tracking-widest uppercase text-primary">Akademi</span>
              </div>
            </Link>

            <p className="text-body-md text-white/60 max-w-xs leading-relaxed">
              {academyInfo.tagline}. Çocuklar ve gençler için profesyonel taekwondo eğitimi.
            </p>

            {/* Social */}
            {settings.instagramLink && (
              <a
                href={settings.instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex items-center gap-2 text-white/50 hover:text-white transition-colors w-fit"
              >
                <Instagram className="w-5 h-5" />
                <span className="text-body-sm">@{settings.instagram}</span>
              </a>
            )}
          </div>

          {/* Quick links */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display font-semibold text-white text-title-md">
              Hızlı Bağlantılar
            </h3>
            <ul className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-body-md text-white/55 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display font-semibold text-white text-title-md">
              İletişim
            </h3>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href={settings.phoneLink}
                  className="flex items-start gap-2.5 text-body-md text-white/55 hover:text-white transition-colors group"
                >
                  <Phone className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                  <span>{settings.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={settings.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 text-body-md text-white/55 hover:text-green-400 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 mt-0.5 shrink-0 text-green-400" />
                  <span>WhatsApp ile yaz</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-body-md text-white/55">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <span>{settings.address}</span>
              </li>
            </ul>

            {/* CTA */}
            <a
              href="/iletisim"
              className={cn(
                'inline-flex items-center justify-center px-4 py-2.5 rounded-lg',
                'bg-primary text-white text-body-sm font-semibold',
                'hover:bg-primary-dark transition-colors',
                'w-fit mt-1'
              )}
            >
              Ücretsiz Deneme
            </a>
          </div>
        </div>

        {/* Bottom bar — color shift instead of 1px divider */}
        <div className="bg-white/5 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-body-sm text-white/35">
              © {currentYear} {academyInfo.name}. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/giris" className="text-body-sm text-white/35 hover:text-white/60 transition-colors">
                Giriş Yap
              </Link>
              <Link to="/kayit" className="text-body-sm text-white/35 hover:text-white/60 transition-colors">
                Kayıt Ol
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}
