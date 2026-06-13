# Sprint 1: Modo Repaso + Predictor de Nota

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar Modo Repaso Inteligente (flip cards priorizando preguntas falladas) y Predictor de Nota (probabilidad de aprobar + evolución + módulos débiles) a la plataforma.

**Architecture:** Dos APIs nuevas que leen `quiz_attempts.answers` (JSONB ya existente con resultados por pregunta). El Repaso es una página independiente; el Predictor es un tab nuevo en SubjectContent. Sin tablas nuevas en Supabase.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS 4, Supabase REST, SVG puro para gráficos.

---

## Archivos a crear/modificar

| Acción | Archivo |
|--------|---------|
| Crear | `src/app/api/subjects/[slug]/repaso/route.ts` |
| Crear | `src/app/(platform)/dashboard/[subject]/repaso/page.tsx` |
| Crear | `src/app/api/subjects/[slug]/predictor/route.ts` |
| Crear | `src/components/subject/PredictorPanel.tsx` |
| Modificar | `src/app/(platform)/dashboard/[subject]/SubjectContent.tsx` |

---

## Task 1: API de Repaso

**Files:**
- Crear: `src/app/api/subjects/[slug]/repaso/route.ts`

- [ ] **Crear el archivo con el handler GET**

```ts
// src/app/api/subjects/[slug]/repaso/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type AttemptAnswer = {
  question_id:    string
  question:       string
  selected_index: number
  correct_index:  number
  is_correct:     boolean
  options:        string[]
  explanation:    string | null
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase  = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: subject } = await supabase
    .from('subjects').select('id').eq('slug', slug).single()
  if (!subject) return NextResponse.json({ error: 'Materia no encontrada' }, { status: 404 })

  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('answers')
    .eq('user_id', user.id)
    .eq('subject_id', subject.id)

  // Sin intentos previos → preguntas aleatorias como fallback
  if (!attempts || attempts.length === 0) {
    const { data: qs } = await supabase
      .from('quiz_questions')
      .select('id, question, options, explanation')
      .eq('subject_id', subject.id)
      .eq('is_published', true)
      .limit(20)
    if (!qs) return NextResponse.json({ questions: [] })
    return NextResponse.json({
      questions: qs.map(q => {
        const opts = q.options as { text: string; is_correct: boolean }[]
        return {
          id:            q.id,
          question:      q.question,
          options:       opts.map(o => o.text),
          correct_index: opts.findIndex(o => o.is_correct),
          explanation:   q.explanation,
          failure_rate:  null,
          times_seen:    0,
        }
      }),
    })
  }

  // Agregar estadísticas por pregunta
  const stats = new Map<string, { wrong: number; total: number; data: AttemptAnswer }>()

  for (const attempt of attempts) {
    const answers = attempt.answers as AttemptAnswer[]
    if (!Array.isArray(answers)) continue
    for (const a of answers) {
      const s = stats.get(a.question_id)
      if (s) {
        s.total++
        if (!a.is_correct) s.wrong++
      } else {
        stats.set(a.question_id, { wrong: a.is_correct ? 0 : 1, total: 1, data: a })
      }
    }
  }

  const questions = Array.from(stats.entries())
    .sort(([, a], [, b]) => (b.wrong / b.total) - (a.wrong / a.total))
    .slice(0, 20)
    .map(([id, s]) => ({
      id,
      question:      s.data.question,
      options:       s.data.options,
      correct_index: s.data.correct_index,
      explanation:   s.data.explanation,
      failure_rate:  s.wrong / s.total,
      times_seen:    s.total,
    }))

  return NextResponse.json({ questions })
}
```

- [ ] **Verificar manualmente**

Abrir en el browser: `http://localhost:3000/api/subjects/filosofia/repaso`
Esperado: JSON con array `questions` ordenado por `failure_rate` DESC (o preguntas aleatorias si el usuario no tiene intentos).

- [ ] **Commit**

```bash
git add src/app/api/subjects/[slug]/repaso/route.ts
git commit -m "feat: GET /api/subjects/[slug]/repaso — preguntas ordenadas por tasa de error"
```

---

## Task 2: Página Modo Repaso

**Files:**
- Crear: `src/app/(platform)/dashboard/[subject]/repaso/page.tsx`

- [ ] **Crear la página con sus tres pantallas**

```tsx
// src/app/(platform)/dashboard/[subject]/repaso/page.tsx
'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface RepasoQuestion {
  id:            string
  question:      string
  options:       string[]
  correct_index: number
  explanation:   string | null
  failure_rate:  number | null
  times_seen:    number
}

type Screen = 'start' | 'card' | 'results'

export default function RepasoPage() {
  const params = useParams()
  const router = useRouter()
  const slug   = params.subject as string

  const [screen,        setScreen]        = useState<Screen>('start')
  const [questions,     setQuestions]     = useState<RepasoQuestion[]>([])
  const [currentIndex,  setCurrentIndex]  = useState(0)
  const [flipped,       setFlipped]       = useState(false)
  const [known,         setKnown]         = useState(0)
  const [loading,       setLoading]       = useState(false)
  const [noQuestions,   setNoQuestions]   = useState(false)

  async function start() {
    setLoading(true)
    const res  = await fetch(`/api/subjects/${slug}/repaso`)
    const data = await res.json()
    setLoading(false)
    if (!data.questions?.length) { setNoQuestions(true); return }
    setQuestions(data.questions)
    setCurrentIndex(0)
    setFlipped(false)
    setKnown(0)
    setNoQuestions(false)
    setScreen('card')
  }

  function answer(didKnow: boolean) {
    if (didKnow) setKnown(k => k + 1)
    const next = currentIndex + 1
    if (next >= questions.length) {
      setScreen('results')
    } else {
      setCurrentIndex(next)
      setFlipped(false)
    }
  }

  const q = questions[currentIndex]

  // ── INICIO ──────────────────────────────────────────────────────────────────
  if (screen === 'start') return (
    <div className="max-w-lg mx-auto">
      <button onClick={() => router.back()} className="text-tinta/40 hover:text-tinta text-sm mb-6 block">
        ← Volver
      </button>
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-tinta/5">
        <span className="text-[10px] font-bold tracking-widest text-tinta/40">ESTUDIO</span>
        <h1 className="font-display text-verde text-3xl mt-1 mb-2">REPASO INTELIGENTE</h1>
        <p className="text-tinta/50 text-sm mb-8">
          Las preguntas que más te costaron en tus simulacros anteriores, primero.
        </p>

        {noQuestions ? (
          <p className="text-tinta/50 text-sm bg-tinta/5 rounded-lg p-4">
            No hay preguntas disponibles para repasar.
          </p>
        ) : (
          <button
            onClick={start}
            disabled={loading}
            className="w-full bg-amarillo text-tinta font-bold py-3.5 rounded-lg tracking-wider hover:bg-amarillo/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'CARGANDO...' : 'INICIAR REPASO'}
          </button>
        )}
      </div>
    </div>
  )

  // ── CARD ─────────────────────────────────────────────────────────────────────
  if (screen === 'card' && q) return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => router.back()} className="text-tinta/40 hover:text-tinta text-sm">
          ← Salir
        </button>
        <span className="text-xs font-bold text-tinta/40 tracking-wider">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="flex gap-0.5 mb-5">
        {questions.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
            i < currentIndex ? 'bg-verde' : i === currentIndex ? 'bg-amarillo' : 'bg-tinta/10'
          }`} />
        ))}
      </div>

      {/* Flip card */}
      <div
        style={{ perspective: '1000px', cursor: flipped ? 'default' : 'pointer', minHeight: '240px' }}
        onClick={() => !flipped && setFlipped(true)}
        className="mb-4"
      >
        <div style={{
          position:        'relative',
          transformStyle:  'preserve-3d',
          transition:      'transform 0.5s',
          transform:       flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          minHeight:       '240px',
        }}>
          {/* Frente */}
          <div
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            className="absolute inset-0 bg-white rounded-2xl p-8 shadow-sm border border-tinta/5 flex flex-col justify-between"
          >
            <p className="text-[10px] font-bold tracking-widest text-tinta/30">
              PREGUNTA — tocá para ver la respuesta
            </p>
            <p className="text-tinta font-medium text-lg leading-relaxed">{q.question}</p>
            {q.failure_rate !== null && (
              <p className="text-[10px] text-rojo/60">
                Fallada el {Math.round(q.failure_rate * 100)}% de las veces ({q.times_seen} intentos)
              </p>
            )}
          </div>
          {/* Dorso */}
          <div
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            className="absolute inset-0 bg-white rounded-2xl p-8 shadow-sm border border-verde/20 flex flex-col gap-4"
          >
            <p className="text-[10px] font-bold tracking-widest text-verde/60">RESPUESTA CORRECTA</p>
            <p className="text-verde font-bold text-base">{q.options[q.correct_index]}</p>
            {q.explanation && (
              <p className="text-tinta/60 text-sm leading-relaxed border-t border-tinta/10 pt-3">
                {q.explanation}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Botones — solo visibles tras voltear */}
      {flipped && (
        <div className="flex gap-3">
          <button
            onClick={() => answer(false)}
            className="flex-1 bg-rojo/10 text-rojo font-bold py-3.5 rounded-lg tracking-wider hover:bg-rojo/20 transition-colors"
          >
            NO LO SABÍA
          </button>
          <button
            onClick={() => answer(true)}
            className="flex-1 bg-verde/10 text-verde font-bold py-3.5 rounded-lg tracking-wider hover:bg-verde/20 transition-colors"
          >
            LO SABÍA ✓
          </button>
        </div>
      )}
    </div>
  )

  // ── RESULTADOS ────────────────────────────────────────────────────────────────
  if (screen === 'results') {
    const pct = Math.round((known / questions.length) * 100)
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-tinta/5 text-center">
          <span className="text-[10px] font-bold tracking-widest text-tinta/40">RESULTADO</span>
          <p className="text-8xl font-display text-tinta leading-none mt-4 mb-1">
            {pct}<span className="text-4xl text-tinta/40">%</span>
          </p>
          <p className="text-xs font-bold tracking-widest text-tinta/30 mb-8">
            DOMINASTE {known} DE {questions.length}
          </p>
          <div className="flex gap-3">
            <button
              onClick={start}
              className="flex-1 bg-amarillo text-tinta font-bold py-3 rounded-lg tracking-wider hover:bg-amarillo/90 transition-colors"
            >
              REPETIR
            </button>
            <button
              onClick={() => router.back()}
              className="flex-1 bg-tinta/10 text-tinta font-bold py-3 rounded-lg tracking-wider hover:bg-tinta/20 transition-colors"
            >
              VOLVER
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
```

- [ ] **Verificar en el browser**

Navegar a `http://localhost:3000/dashboard/filosofia/repaso`
- Pantalla inicio visible ✓
- Click INICIAR → cards cargan ✓
- Click en card → voltea con animación ✓
- Botones NO LO SABÍA / LO SABÍA → avanzan a siguiente card ✓
- Al terminar → pantalla de resultados con porcentaje ✓

- [ ] **Commit**

```bash
git add src/app/(platform)/dashboard/[subject]/repaso/page.tsx
git commit -m "feat: página Repaso Inteligente con flip cards"
```

---

## Task 3: Botón REPASO en SubjectContent

**Files:**
- Modificar: `src/app/(platform)/dashboard/[subject]/SubjectContent.tsx` (líneas 70-82)

- [ ] **Agregar el botón REPASO → en el header**

Ubicar el bloque de botones en el header (actualmente QUIZ → e IA →) y agregar REPASO → entre ellos:

```tsx
// Reemplazar este bloque (líneas 70-82 aprox):
          <button
            onClick={() => router.push(`/dashboard/${slug}/quiz`)}
            className="bg-amarillo text-tinta text-xs font-bold px-4 py-2 rounded-lg tracking-wider hover:bg-amarillo/80 transition-colors shrink-0"
          >
            QUIZ →
          </button>
          <button
            onClick={() => router.push(`/dashboard/${slug}/ai`)}
            className="bg-verde text-crema text-xs font-bold px-4 py-2 rounded-lg tracking-wider hover:bg-verde-claro transition-colors shrink-0"
          >
            IA →
          </button>

// Por este bloque:
          <button
            onClick={() => router.push(`/dashboard/${slug}/quiz`)}
            className="bg-amarillo text-tinta text-xs font-bold px-4 py-2 rounded-lg tracking-wider hover:bg-amarillo/80 transition-colors shrink-0"
          >
            QUIZ →
          </button>
          <button
            onClick={() => router.push(`/dashboard/${slug}/repaso`)}
            className="bg-tinta/10 text-tinta text-xs font-bold px-4 py-2 rounded-lg tracking-wider hover:bg-tinta/20 transition-colors shrink-0 border border-tinta/10"
          >
            REPASO →
          </button>
          <button
            onClick={() => router.push(`/dashboard/${slug}/ai`)}
            className="bg-verde text-crema text-xs font-bold px-4 py-2 rounded-lg tracking-wider hover:bg-verde-claro transition-colors shrink-0"
          >
            IA →
          </button>
```

- [ ] **Verificar en el browser**

Navegar a `http://localhost:3000/dashboard/filosofia`
- Botón REPASO → visible en el header entre QUIZ y IA ✓
- Click en REPASO → navega a la página de repaso ✓

- [ ] **Commit**

```bash
git add src/app/(platform)/dashboard/[subject]/SubjectContent.tsx
git commit -m "feat: agregar botón REPASO en header de materia"
```

---

## Task 4: API del Predictor

**Files:**
- Crear: `src/app/api/subjects/[slug]/predictor/route.ts`

- [ ] **Crear el handler GET**

```ts
// src/app/api/subjects/[slug]/predictor/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type AttemptAnswer = {
  question_id: string
  is_correct:  boolean
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase  = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: subject } = await supabase
    .from('subjects').select('id').eq('slug', slug).single()
  if (!subject) return NextResponse.json({ error: 'Materia no encontrada' }, { status: 404 })

  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('score, total, attempted_at, answers')
    .eq('user_id', user.id)
    .eq('subject_id', subject.id)
    .order('attempted_at', { ascending: true })

  if (!attempts || attempts.length === 0) {
    return NextResponse.json({ no_data: true })
  }

  // Historia
  const history = attempts.map(a => ({
    pct:          Math.round((a.score / a.total) * 100),
    attempted_at: a.attempted_at,
  }))

  // Promedio ponderado (últimos 3: pesos 0.5 / 0.3 / 0.2)
  const last3   = attempts.slice(-3).reverse()
  const weights = [0.5, 0.3, 0.2]
  let wSum = 0, wScore = 0
  last3.forEach((a, i) => {
    const w = weights[i] ?? 0
    wScore += (a.score / a.total) * 100 * w
    wSum   += w
  })
  const probability = Math.round(wScore / wSum)

  // Tendencia
  let trend: 'up' | 'stable' | 'down' = 'stable'
  if (attempts.length >= 2) {
    const last = attempts[attempts.length - 1]
    const prev = attempts[attempts.length - 2]
    const diff = (last.score / last.total) - (prev.score / prev.total)
    if (diff > 0.05)       trend = 'up'
    else if (diff < -0.05) trend = 'down'
  }

  // Módulos débiles: desempaquetar answers de los últimos 3 intentos
  const qFailures = new Map<string, { wrong: number; total: number }>()
  for (const attempt of attempts.slice(-3)) {
    const answers = attempt.answers as AttemptAnswer[]
    if (!Array.isArray(answers)) continue
    for (const a of answers) {
      const s = qFailures.get(a.question_id) ?? { wrong: 0, total: 0 }
      s.total++
      if (!a.is_correct) s.wrong++
      qFailures.set(a.question_id, s)
    }
  }

  const questionIds = Array.from(qFailures.keys())
  const { data: qData } = await supabase
    .from('quiz_questions')
    .select('id, module_id')
    .in('id', questionIds)

  const mFailures = new Map<string, { wrong: number; total: number }>()
  for (const q of (qData ?? [])) {
    if (!q.module_id) continue
    const qf = qFailures.get(q.id)!
    const mf = mFailures.get(q.module_id) ?? { wrong: 0, total: 0 }
    mf.wrong += qf.wrong
    mf.total += qf.total
    mFailures.set(q.module_id, mf)
  }

  const moduleIds = Array.from(mFailures.keys())
  const { data: modules } = await supabase
    .from('modules').select('id, title').in('id', moduleIds)

  const weak_modules = (modules ?? [])
    .map(m => ({
      module_id:    m.id,
      title:        m.title,
      failure_rate: mFailures.has(m.id)
        ? mFailures.get(m.id)!.wrong / mFailures.get(m.id)!.total
        : 0,
    }))
    .filter(m => m.failure_rate > 0)
    .sort((a, b) => b.failure_rate - a.failure_rate)
    .slice(0, 3)

  return NextResponse.json({ probability, trend, history, weak_modules })
}
```

- [ ] **Verificar manualmente**

`http://localhost:3000/api/subjects/filosofia/predictor`

Si el usuario no tiene simulacros: `{ "no_data": true }` ✓
Si tiene simulacros: objeto con `probability`, `trend`, `history[]`, `weak_modules[]` ✓

- [ ] **Commit**

```bash
git add src/app/api/subjects/[slug]/predictor/route.ts
git commit -m "feat: GET /api/subjects/[slug]/predictor — probabilidad, tendencia y módulos débiles"
```

---

## Task 5: PredictorPanel component

**Files:**
- Crear: `src/components/subject/PredictorPanel.tsx`

- [ ] **Crear el componente con gauge SVG, gráfico de evolución y módulos débiles**

```tsx
// src/components/subject/PredictorPanel.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface PredictorData {
  no_data?:     boolean
  probability:  number
  trend:        'up' | 'stable' | 'down'
  history:      { pct: number; attempted_at: string }[]
  weak_modules: { module_id: string; title: string; failure_rate: number }[]
}

const TREND_LABEL = { up: '↑ Mejorando', stable: '→ Estable', down: '↓ Bajando' } as const
const TREND_COLOR = {
  up:     'text-verde bg-verde/10',
  stable: 'text-tinta/50 bg-tinta/10',
  down:   'text-rojo bg-rojo/10',
} as const

function Gauge({ probability }: { probability: number }) {
  const r   = 70
  const cx  = 100
  const cy  = 105

  // Arco de 240° comenzando desde 150° (abajo-izquierda), sentido horario
  const toRad   = (deg: number) => (deg * Math.PI) / 180
  const start   = 150
  const sweep   = 240
  const end     = start + sweep

  const sx = cx + r * Math.cos(toRad(start))
  const sy = cy + r * Math.sin(toRad(start))
  const ex = cx + r * Math.cos(toRad(end))
  const ey = cy + r * Math.sin(toRad(end))

  const arcPath = `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 1 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`

  const circumference = 2 * Math.PI * r
  const arcLen        = (sweep / 360) * circumference
  const filled        = (probability / 100) * arcLen

  const color = probability >= 60 ? '#22c55e' : probability >= 40 ? '#eab308' : '#ef4444'

  return (
    <svg width="200" height="180" viewBox="0 0 200 180" className="mx-auto">
      {/* Track */}
      <path d={arcPath} fill="none" stroke="#f3f4f6" strokeWidth="14" strokeLinecap="round" />
      {/* Fill */}
      <path
        d={arcPath}
        fill="none"
        stroke={color}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${filled.toFixed(2)} ${circumference.toFixed(2)}`}
      />
      {/* Porcentaje */}
      <text x="100" y="100" textAnchor="middle"
        style={{ fontSize: 38, fontWeight: 800, fill: '#111827', fontFamily: 'inherit' }}>
        {probability}%
      </text>
      <text x="100" y="122" textAnchor="middle"
        style={{ fontSize: 9, fill: '#9ca3af', letterSpacing: 2 }}>
        PROB. DE APROBAR
      </text>
    </svg>
  )
}

function LineChart({ history }: { history: { pct: number; attempted_at: string }[] }) {
  if (history.length < 2) return null
  const W = 300, H = 90, PAD = 20
  const iW = W - PAD * 2
  const iH = H - PAD * 2
  const pts = history.map((h, i) => ({
    x:   PAD + (i / (history.length - 1)) * iW,
    y:   PAD + (1 - h.pct / 100) * iH,
    pct: h.pct,
  }))
  const poly = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const y60  = PAD + (1 - 0.6) * iH

  return (
    <div>
      <p className="text-[10px] font-bold tracking-widest text-tinta/40 mb-3">EVOLUCIÓN DE SIMULACROS</p>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* Línea 60% */}
        <line x1={PAD} y1={y60} x2={W - PAD} y2={y60}
          stroke="#d1d5db" strokeWidth="1" strokeDasharray="4 3" />
        <text x={W - PAD + 3} y={y60 + 4} style={{ fontSize: 8, fill: '#9ca3af' }}>60%</text>
        {/* Línea de progreso */}
        <polyline points={poly} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {/* Puntos */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4}
            fill={p.pct >= 60 ? '#22c55e' : '#ef4444'}
            stroke="white" strokeWidth="2" />
        ))}
      </svg>
    </div>
  )
}

export default function PredictorPanel({ slug }: { slug: string }) {
  const router         = useRouter()
  const [data, setData] = useState<PredictorData | null>(null)

  useEffect(() => {
    fetch(`/api/subjects/${slug}/predictor`)
      .then(r => r.json())
      .then(setData)
  }, [slug])

  if (!data) return (
    <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-tinta/5">
      <p className="text-tinta/30 text-sm">Cargando predictor...</p>
    </div>
  )

  if (data.no_data) return (
    <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-tinta/5">
      <p className="text-4xl mb-3">📊</p>
      <p className="font-bold text-tinta mb-1">Sin datos todavía</p>
      <p className="text-tinta/50 text-sm mb-4">
        Hacé al menos un simulacro para ver tu predicción de nota.
      </p>
      <button
        onClick={() => router.push(`/dashboard/${slug}/quiz`)}
        className="bg-amarillo text-tinta text-xs font-bold px-5 py-2.5 rounded-lg tracking-wider hover:bg-amarillo/90 transition-colors"
      >
        IR AL SIMULACRO →
      </button>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Gauge + tendencia */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-tinta/5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold tracking-widest text-tinta/40">PREDICTOR</span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${TREND_COLOR[data.trend]}`}>
            {TREND_LABEL[data.trend]}
          </span>
        </div>
        <Gauge probability={data.probability} />
      </div>

      {/* Evolución */}
      {data.history.length >= 2 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-tinta/5">
          <LineChart history={data.history} />
        </div>
      )}

      {/* Módulos débiles */}
      {data.weak_modules.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-tinta/5">
          <p className="text-[10px] font-bold tracking-widest text-tinta/40 mb-4">MÓDULOS A REFORZAR</p>
          <div className="space-y-4">
            {data.weak_modules.map(m => (
              <div key={m.module_id}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-tinta">{m.title}</span>
                  <span className="text-xs text-rojo font-bold">
                    {Math.round(m.failure_rate * 100)}% error
                  </span>
                </div>
                <div className="w-full bg-tinta/10 rounded-full h-1.5">
                  <div
                    className="bg-rojo h-1.5 rounded-full"
                    style={{ width: `${Math.round(m.failure_rate * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push(`/dashboard/${slug}/repaso`)}
            className="mt-5 w-full bg-tinta/5 border border-tinta/10 text-tinta text-xs font-bold py-2.5 rounded-lg tracking-wider hover:bg-tinta/10 transition-colors"
          >
            REPASAR ESTAS PREGUNTAS →
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Commit**

```bash
git add src/components/subject/PredictorPanel.tsx
git commit -m "feat: PredictorPanel — gauge SVG, gráfico de evolución y módulos débiles"
```

---

## Task 6: Tab Predictor en SubjectContent

**Files:**
- Modificar: `src/app/(platform)/dashboard/[subject]/SubjectContent.tsx`

- [ ] **Agregar import de PredictorPanel y el tipo 'predictor' al Tab**

Al inicio del archivo, agregar el import:

```tsx
import PredictorPanel from '@/components/subject/PredictorPanel'
```

Cambiar la definición del tipo `Tab`:

```tsx
// Antes:
type Tab = 'modulos' | 'material'

// Después:
type Tab = 'modulos' | 'material' | 'predictor'
```

- [ ] **Agregar el botón del tab Predictor**

Ubicar el bloque de tabs (líneas ~92-115) y agregar el botón de predictor:

```tsx
        {/* Agregar después del tab de MATERIAL DE APOYO */}
        <button
          onClick={() => setTab('predictor')}
          className={`text-xs font-bold px-4 py-2 rounded-lg tracking-wider transition-colors ${
            tab === 'predictor'
              ? 'bg-verde text-crema'
              : 'bg-white text-tinta/50 hover:bg-tinta/5 border border-tinta/10'
          }`}
        >
          📊 PREDICTOR
        </button>
```

- [ ] **Agregar el render del panel Predictor**

Al final de los bloques condicionales de tabs (después del bloque `{tab === 'material' && ...}`):

```tsx
      {/* Predictor de nota */}
      {tab === 'predictor' && (
        <div className="flex-1">
          <PredictorPanel slug={slug} />
        </div>
      )}
```

- [ ] **Verificar en el browser**

Navegar a `http://localhost:3000/dashboard/filosofia`
- Tab "📊 PREDICTOR" visible junto a MÓDULOS y MATERIAL DE APOYO ✓
- Click en tab → muestra "Sin datos todavía" con botón al simulacro (si no hay intentos) ✓
- Después de hacer un simulacro → volver al tab y ver gauge con probabilidad ✓
- Con 2+ simulacros → gráfico de evolución visible ✓

- [ ] **Commit final del Sprint 1**

```bash
git add src/app/(platform)/dashboard/[subject]/SubjectContent.tsx
git commit -m "feat: tab Predictor de Nota en página de materia"
```
