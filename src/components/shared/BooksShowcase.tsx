'use client'

import { CSSProperties, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface ShowcaseBook {
  name:  string
  color: string
  slug?: string
  pct?:  number
}

/* ── Book dimensions ─────────────────────────────── */
const W = 100   // cover width  (px)
const H = 152   // cover height (px)
const D = 24    // spine depth  (px)

/* ── Parse hex → "r,g,b" for rgba() ─────────────── */
function toRGB(hex: string): string {
  const c = hex.replace('#', '')
  if (c.length !== 6) return '15,63,38'
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  return isNaN(r) ? '15,63,38' : `${r},${g},${b}`
}

/* ═══════════════════════════════════════════════════
   Single 3D Book
══════════════════════════════════════════════════ */
function Book3D({
  book,
  onClick,
}: {
  book:     ShowcaseBook
  onClick?: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const rgb = toRGB(book.color)
  const col = book.color || 'var(--verde)'

  const face = (extra: CSSProperties): CSSProperties => ({
    position:           'absolute',
    backfaceVisibility: 'hidden',
    ...extra,
  })

  return (
    <div
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={book.name}
    >
      {/* ── Book body ── */}
      <div
        style={{
          position:       'relative',
          width:          W,
          height:         H,
          transformStyle: 'preserve-3d',
          transform:      hovered
            ? 'translateY(-24px) rotateY(-6deg)'
            : 'rotateY(-30deg)',
          transition:     'transform 0.5s cubic-bezier(0.34,1.3,0.64,1), filter 0.35s ease',
          filter:         hovered
            ? `drop-shadow(0 32px 40px rgba(${rgb},0.55))
               drop-shadow(0 12px 18px rgba(0,0,0,0.18))`
            : `drop-shadow(0 10px 22px rgba(${rgb},0.32))
               drop-shadow(0 4px 8px  rgba(0,0,0,0.10))`,
        }}
      >

        {/* ──────────────────────────────────────────────
            1. TOP FACE  (page edges visible from above)
        ─────────────────────────────────────────────── */}
        <div
          style={face({
            top:             0,
            left:            0,
            width:           W,
            height:          D,
            transformOrigin: 'top center',
            transform:       'rotateX(-90deg)',
            background:      `
              repeating-linear-gradient(
                to right,
                #faf7f2 0px, #faf7f2 1.5px,
                #d8cec0 1.5px, #d8cec0 2.5px
              )
            `,
          })}
        />

        {/* ──────────────────────────────────────────────
            2. SPINE  (left face — hardcover binding)
        ─────────────────────────────────────────────── */}
        <div
          style={face({
            top:             0,
            left:            -D,
            width:           D,
            height:          H,
            transformOrigin: 'right center',
            transform:       'rotateY(90deg)',
            backgroundColor: col,
            backgroundImage: `
              linear-gradient(
                to right,
                rgba(0,0,0,0.38) 0%,
                rgba(0,0,0,0.10) 35%,
                rgba(255,255,255,0.06) 60%,
                rgba(0,0,0,0.22) 100%
              )
            `,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            overflow:        'hidden',
          })}
        >
          {/* Spine title, rotated bottom→top */}
          <p style={{
            fontFamily:    'Syne, sans-serif',
            fontSize:      7.5,
            fontWeight:    800,
            color:         'rgba(255,255,255,0.82)',
            letterSpacing: '0.18em',
            transform:     'rotate(90deg)',
            whiteSpace:    'nowrap',
            maxWidth:      H - 16,
            overflow:      'hidden',
            textOverflow:  'ellipsis',
            userSelect:    'none',
            textTransform: 'uppercase',
          }}>
            {book.name}
          </p>
        </div>

        {/* ──────────────────────────────────────────────
            3. PAGES  (right face — paper edge texture)
        ─────────────────────────────────────────────── */}
        <div
          style={face({
            top:             2,
            right:           -D,
            width:           D,
            height:          H - 4,
            transformOrigin: 'left center',
            transform:       'rotateY(-90deg)',
            background:      `
              repeating-linear-gradient(
                to bottom,
                #faf7f1 0px, #faf7f1 1.5px,
                #cdc3b2 1.5px, #cdc3b2 2px
              )
            `,
          })}
        />

        {/* ──────────────────────────────────────────────
            4. COVER  (front face — main visual)
        ─────────────────────────────────────────────── */}
        <div
          style={face({
            inset:           0,
            backgroundColor: col,
            overflow:        'hidden',
          })}
        >
          {/* Lighting — bright highlight top-left + shadow bottom */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `
              linear-gradient(145deg, rgba(255,255,255,0.22) 0%, transparent 45%),
              linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.22) 100%)
            `,
          }} />

          {/* ── Header band ── */}
          <div style={{
            position:        'absolute',
            top:             0, left: 0, right: 0,
            height:          H * 0.27,
            backgroundColor: 'rgba(0,0,0,0.20)',
            display:         'flex',
            flexDirection:   'column',
            alignItems:      'center',
            justifyContent:  'center',
            gap:             2,
          }}>
            {/* Small publisher/uni mark */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 2L2 7l10 5 10-5-10-5z"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <p style={{
              fontFamily:    'DM Sans, sans-serif',
              fontSize:      6.5,
              fontWeight:    600,
              color:         'rgba(255,255,255,0.55)',
              letterSpacing: '0.25em',
              userSelect:    'none',
            }}>
              UNLAM
            </p>
          </div>

          {/* Divider line */}
          <div style={{
            position:        'absolute',
            top:             H * 0.27,
            left:            10, right: 10,
            height:          1,
            backgroundColor: 'rgba(255,255,255,0.25)',
          }} />

          {/* ── Subject name ── */}
          <div style={{
            position: 'absolute',
            top:      H * 0.27 + 1,
            left:     0, right: 0,
            bottom:   24,
            display:  'flex',
            alignItems:     'center',
            justifyContent: 'center',
            padding:  '10px 10px 4px',
          }}>
            <p style={{
              fontFamily:    'Syne, sans-serif',
              fontSize:      11.5,
              fontWeight:    800,
              color:         'rgba(255,255,255,0.96)',
              textAlign:     'center',
              lineHeight:    1.25,
              letterSpacing: '0.04em',
              userSelect:    'none',
              textTransform: 'uppercase',
              wordBreak:     'break-word',
            }}>
              {book.name}
            </p>
          </div>

          {/* ── Footer band ── */}
          <div style={{
            position:        'absolute',
            bottom:          0, left: 0, right: 0,
            height:          24,
            backgroundColor: 'rgba(0,0,0,0.18)',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'space-between',
            padding:         '0 8px',
          }}>
            <p style={{
              fontFamily:    'DM Sans, sans-serif',
              fontSize:      6,
              fontWeight:    500,
              color:         'rgba(255,255,255,0.40)',
              letterSpacing: '0.12em',
              userSelect:    'none',
            }}>
              INGRESO
            </p>
            {book.pct !== undefined && (
              <p style={{
                fontFamily:    'Syne, sans-serif',
                fontSize:      9,
                fontWeight:    800,
                color:         book.pct >= 100
                  ? 'var(--amarillo)'
                  : 'rgba(255,255,255,0.72)',
                letterSpacing: '0.06em',
                userSelect:    'none',
              }}>
                {book.pct}%
              </p>
            )}
          </div>

          {/* Left edge inner highlight */}
          <div style={{
            position:        'absolute',
            top: 0, bottom: 0, left: 0,
            width:           2,
            backgroundColor: 'rgba(255,255,255,0.18)',
          }} />
          {/* Top edge inner highlight */}
          <div style={{
            position:        'absolute',
            top: 0, left: 0, right: 0,
            height:          1,
            backgroundColor: 'rgba(255,255,255,0.28)',
          }} />
        </div>

      </div>

      {/* ── Ground shadow ── */}
      <div
        style={{
          width:       W * 0.72,
          height:      10,
          margin:      '6px auto 0',
          background:  `radial-gradient(ellipse at center, rgba(${rgb},0.35) 0%, transparent 72%)`,
          filter:      'blur(5px)',
          opacity:     hovered ? 0.55 : 1,
          transition:  'opacity 0.4s',
        }}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   Infinite bookshelf
══════════════════════════════════════════════════ */
export default function BooksShowcase({ books }: { books: ShowcaseBook[] }) {
  const router  = useRouter()
  const [paused, setPaused] = useState(false)

  if (!books.length) return null

  const doubled  = [...books, ...books]
  const duration = Math.max(20, books.length * 4.5)

  return (
    <section
      className="relative w-full overflow-hidden select-none py-4"
      style={{ perspective: '1200px', perspectiveOrigin: '50% -5%' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Mis materias"
    >
      {/* Fade — left edge */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 z-10 pointer-events-none w-32"
        style={{ background: 'linear-gradient(to right, var(--crema) 15%, transparent)' }}
      />
      {/* Fade — right edge */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 z-10 pointer-events-none w-32"
        style={{ background: 'linear-gradient(to left, var(--crema) 15%, transparent)' }}
      />

      {/* Slight camera tilt (the "shelf" look from slightly above) */}
      <div style={{ transform: 'rotateX(6deg)', transformStyle: 'preserve-3d' }}>
        {/* Scrolling row */}
        <div
          style={{
            display:            'flex',
            gap:                20,
            width:              'max-content',
            padding:            '16px 48px 24px',
            animation:          `books-scroll ${duration}s linear infinite`,
            animationPlayState: paused ? 'paused' : 'running',
          }}
        >
          {doubled.map((book, i) => (
            <Book3D
              key={`${book.slug ?? book.name}-${i}`}
              book={book}
              onClick={book.slug ? () => router.push(`/dashboard/${book.slug}`) : undefined}
            />
          ))}
        </div>
      </div>

      {/* Shelf surface */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom:     28,
          height:     1,
          background: 'linear-gradient(to right, transparent, rgba(10,10,10,0.07) 15%, rgba(10,10,10,0.07) 85%, transparent)',
        }}
      />
    </section>
  )
}
