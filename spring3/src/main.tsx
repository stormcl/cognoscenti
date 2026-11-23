import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { appBasePath, installPublicBase } from './appBase'
import { applyTheme, readTheme } from './theme'
import './index.css'
import App from './App.tsx'

installPublicBase()
applyTheme(readTheme())

const base = appBasePath()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={base || undefined}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
