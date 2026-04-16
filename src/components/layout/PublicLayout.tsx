import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'

/**
 * Wraps all public (non-authenticated) pages.
 * Renders Header → page content → Footer.
 * <Outlet /> renders the matched child route.
 */
export function PublicLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
