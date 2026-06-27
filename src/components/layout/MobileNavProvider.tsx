'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface MobileNavCtx {
  open:   boolean
  toggle: () => void
  close:  () => void
}

const Ctx = createContext<MobileNavCtx | null>(null)

export function useMobileNav(): MobileNavCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useMobileNav debe usarse dentro de <MobileNavProvider>')
  return ctx
}

export default function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const toggle = useCallback(() => setOpen(o => !o), [])
  const close  = useCallback(() => setOpen(false), [])

  // Cerrar al cambiar de ruta
  useEffect(() => { setOpen(false) }, [pathname])

  // Bloquear scroll del body mientras el drawer está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return <Ctx.Provider value={{ open, toggle, close }}>{children}</Ctx.Provider>
}
