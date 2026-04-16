import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import { Providers } from './app/providers'
import { initCapacitor } from './lib/capacitor'

// Initialize Capacitor native plugins (no-op on web)
void initCapacitor()

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <Providers />
  </StrictMode>
)
