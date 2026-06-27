'use client'

import HamburgerButton from '@/components/layout/HamburgerButton'

export default function AdminMobileBar() {
  return (
    <header className="lg:hidden h-14 bg-crema border-b border-tinta/10 px-4 flex items-center justify-between gap-3 shrink-0">
      <HamburgerButton />
      <div className="flex items-center gap-2">
        <span className="text-verde font-display text-sm tracking-tight">RESÚMENES UNLAM</span>
        <span className="bg-amarillo text-tinta text-[9px] font-bold px-2 py-0.5 rounded tracking-[0.15em]">ADMIN</span>
      </div>
    </header>
  )
}
