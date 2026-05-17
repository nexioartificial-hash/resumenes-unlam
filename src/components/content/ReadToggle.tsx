'use client'

import { useState } from 'react'

interface ReadToggleProps {
  contentItemId:    string
  initialCompleted: boolean
  onToggle?:        (completed: boolean) => void
}

export default function ReadToggle({ contentItemId, initialCompleted, onToggle }: ReadToggleProps) {
  const [completed, setCompleted] = useState(initialCompleted)
  const [loading,   setLoading]   = useState(false)

  async function toggle() {
    setLoading(true)
    const method = completed ? 'DELETE' : 'POST'
    const url    = completed
      ? `/api/progress?content_item_id=${contentItemId}`
      : '/api/progress'

    await fetch(url, {
      method,
      headers: completed ? undefined : { 'Content-Type': 'application/json' },
      body:    completed ? undefined : JSON.stringify({ content_item_id: contentItemId }),
    })

    setCompleted(!completed)
    onToggle?.(!completed)
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold tracking-wider transition-all shrink-0 disabled:opacity-50 ${
        completed
          ? 'bg-verde text-crema'
          : 'border-2 border-tinta/15 text-tinta/50 hover:border-verde hover:text-verde bg-transparent'
      }`}
    >
      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
        completed ? 'bg-crema border-crema' : 'border-current'
      }`}>
        {completed && <span className="text-verde leading-none" style={{ fontSize: 9 }}>✓</span>}
      </span>
      {completed ? 'LEÍDO' : 'MARCAR'}
    </button>
  )
}
