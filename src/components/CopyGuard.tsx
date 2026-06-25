'use client'

import { useEffect } from 'react'

/**
 * Protección anti-copia del material premium.
 * Bloquea el menú contextual (clic derecho), copy, cut y arrastre de texto
 * en toda la plataforma, EXCEPTO dentro de inputs/textarea/contenteditable
 * (para no romper login, búsqueda ni el chat de IA).
 *
 * Nota: es un disuasivo del lado del cliente. No impide que un usuario técnico
 * lea el HTML con las DevTools; sí frena la copia casual (seleccionar + copiar
 * o clic derecho → copiar).
 */
export default function CopyGuard() {
  useEffect(() => {
    const isEditable = (target: EventTarget | null): boolean => {
      const el = target as HTMLElement | null
      if (!el || typeof el.closest !== 'function') return false
      return !!el.closest('input, textarea, [contenteditable="true"]')
    }

    const block = (e: Event) => {
      if (!isEditable(e.target)) e.preventDefault()
    }

    document.addEventListener('contextmenu', block)
    document.addEventListener('copy', block)
    document.addEventListener('cut', block)
    document.addEventListener('dragstart', block)

    return () => {
      document.removeEventListener('contextmenu', block)
      document.removeEventListener('copy', block)
      document.removeEventListener('cut', block)
      document.removeEventListener('dragstart', block)
    }
  }, [])

  return null
}
