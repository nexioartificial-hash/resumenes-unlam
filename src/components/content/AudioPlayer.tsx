'use client'

import { useRef, useState } from 'react'

interface AudioPlayerProps {
  url:      string
  duration?: number | null
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function AudioPlayer({ url, duration }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [total,   setTotal]   = useState(duration ?? 0)

  function togglePlay() {
    if (!audioRef.current) return
    playing ? audioRef.current.pause() : audioRef.current.play()
    setPlaying(!playing)
  }

  function handleTimeUpdate()     { if (audioRef.current) setCurrent(audioRef.current.currentTime) }
  function handleLoadedMetadata() { if (audioRef.current) setTotal(audioRef.current.duration) }
  function handleEnded()          { setPlaying(false); setCurrent(0) }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value)
    if (audioRef.current) audioRef.current.currentTime = val
    setCurrent(val)
  }

  const progress = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="rounded-2xl overflow-hidden my-4">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div className="bg-verde px-5 py-4 flex items-center gap-4">
        {/* Botón play */}
        <button
          onClick={togglePlay}
          className="w-12 h-12 bg-amarillo text-tinta rounded-full flex items-center justify-center shrink-0 hover:bg-amarillo/80 transition-colors font-bold shadow-sm text-base"
        >
          {playing ? '⏸' : '▶'}
        </button>

        {/* Barra de progreso */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between text-[10px] text-crema/50 mb-1.5 font-mono">
            <span>{formatTime(current)}</span>
            <span>{formatTime(total)}</span>
          </div>
          <div className="relative h-1.5 bg-crema/20 rounded-full">
            <div
              className="absolute top-0 left-0 h-1.5 bg-amarillo rounded-full transition-none"
              style={{ width: `${progress}%` }}
            />
            <input
              type="range"
              min={0}
              max={total || 100}
              value={current}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Estado */}
        <div className="shrink-0 text-right">
          <p className="text-crema/40 text-[9px] tracking-widest font-bold uppercase">Audio</p>
          <p className="text-crema text-xs font-bold">{playing ? 'EN CURSO' : 'PAUSADO'}</p>
        </div>
      </div>
    </div>
  )
}
