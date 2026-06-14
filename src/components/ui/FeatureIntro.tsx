'use client'

import { useState } from 'react'

interface FeatureIntroProps {
  featureKey: string
  icon:       string
  title:      string
  description: string
  steps:      { icon: string; text: string }[]
  ctaLabel?:  string
}

export default function FeatureIntro({
  featureKey: _featureKey,
  icon,
  title,
  description,
  steps,
  ctaLabel = 'Entendido',
}: FeatureIntroProps) {
  const [visible, setVisible] = useState(true)

  function dismiss() {
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tinta/40 backdrop-blur-sm">
      <div className="bg-crema rounded-2xl shadow-xl max-w-md w-full p-6 flex flex-col gap-4 border border-tinta/10">
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <h2 className="text-lg font-display font-bold text-tinta">{title}</h2>
        </div>

        {/* Description */}
        <p className="text-sm text-tinta/70 leading-relaxed">{description}</p>

        {/* Steps */}
        <ul className="flex flex-col gap-2.5">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-tinta/80">
              <span className="mt-0.5 shrink-0">{step.icon}</span>
              <span>{step.text}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={dismiss}
          className="mt-2 w-full bg-verde text-crema font-semibold rounded-xl py-3 text-sm hover:bg-verde-claro transition-colors"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  )
}
