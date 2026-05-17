'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { FormEvent } from 'react'

type Tab = 'chat' | 'exam'

interface ChatMessage {
  id:      string
  role:    'user' | 'assistant'
  content: string
}

interface ExamQuestion {
  question: string
  options:  string[]
  source:   string
  token:    string
}

interface ExamResult {
  is_correct:    boolean
  correct_index: number
  explanation:   string
}

type ExamState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'question'; data: ExamQuestion; selected: number | null }
  | { phase: 'answered'; data: ExamQuestion; selected: number; result: ExamResult }

export default function AIPage() {
  const params = useParams()
  const router = useRouter()
  const slug   = params.subject as string

  const [tab,         setTab]         = useState<Tab>('chat')
  const [examState,   setExamState]   = useState<ExamState>({ phase: 'idle' })
  const [subjectName, setSubjectName] = useState('')

  // Chat state
  const [messages,  setMessages]  = useState<ChatMessage[]>([])
  const [input,     setInput]     = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/subjects/my')
      .then(r => r.json())
      .then((subjects: { subject: { name: string; slug: string } }[]) => {
        const found = subjects.find(s => s.subject.slug === slug)
        if (found) setSubjectName(found.subject.name)
      })
      .catch(() => {})
  }, [slug])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── CHAT STREAMING ──────────────────────────────────────────────
  async function sendMessage(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || chatLoading) return

    const userMsg: ChatMessage  = { id: Date.now().toString(), role: 'user', content: text }
    const history               = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setChatLoading(true)

    const assistantId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }])

    try {
      const res = await fetch(`/api/subjects/${slug}/ai/chat`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          messages: history.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok || !res.body) throw new Error('stream error')

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: m.content + chunk } : m
        ))
      }
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: 'Error al obtener respuesta. Verificá la clave de Groq en .env.local.' } : m
      ))
    }

    setChatLoading(false)
  }

  // ── EXAM ────────────────────────────────────────────────────────
  async function generateQuestion() {
    setExamState({ phase: 'loading' })
    const res  = await fetch(`/api/subjects/${slug}/ai/exam/generate`, { method: 'POST' })
    const data = await res.json()
    if (!res.ok || data.error) {
      setExamState({ phase: 'idle' })
      alert(data.error ?? 'Error al generar la pregunta')
      return
    }
    setExamState({ phase: 'question', data, selected: null })
  }

  async function evaluateAnswer() {
    if (examState.phase !== 'question' || examState.selected === null) return
    const { data, selected } = examState
    const res    = await fetch(`/api/subjects/${slug}/ai/exam/evaluate`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ question: data.question, selected_index: selected, token: data.token }),
    })
    const result = await res.json()
    setExamState({ phase: 'answered', data, selected, result })
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-tinta/5 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/dashboard/${slug}`)}
            className="text-tinta/40 hover:text-tinta transition-colors text-sm"
          >
            ← Volver
          </button>
          <div className="h-4 w-px bg-tinta/20" />
          <div className="flex-1">
            <p className="text-[10px] font-bold tracking-widest text-tinta/40">ASISTENTE IA</p>
            <h1 className="font-display text-verde text-lg leading-tight">
              {subjectName ? subjectName.toUpperCase() : '...'}
            </h1>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 bg-tinta/5 rounded-lg p-1">
            <button
              onClick={() => setTab('chat')}
              className={`text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${
                tab === 'chat' ? 'bg-white text-verde shadow-sm' : 'text-tinta/50 hover:text-tinta'
              }`}
            >
              💬 Chat
            </button>
            <button
              onClick={() => setTab('exam')}
              className={`text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${
                tab === 'exam' ? 'bg-white text-verde shadow-sm' : 'text-tinta/50 hover:text-tinta'
              }`}
            >
              📝 Examen
            </button>
          </div>
        </div>
      </div>

      {/* ── TAB CHAT ─────────────────────────────────────────────── */}
      {tab === 'chat' && (
        <div className="flex flex-col flex-1 min-h-0 gap-4">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {messages.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-tinta/5">
                <p className="text-3xl mb-3">🤖</p>
                <p className="font-display text-verde text-xl mb-1">ASISTENTE DE ESTUDIO</p>
                <p className="text-tinta/50 text-sm">
                  Haceme cualquier pregunta sobre {subjectName || 'la materia'} y te ayudo a entender el material.
                </p>
              </div>
            )}

            {messages.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    m.role === 'user'
                      ? 'bg-amarillo text-tinta rounded-br-sm'
                      : 'bg-white border border-tinta/10 text-tinta rounded-bl-sm shadow-sm'
                  }`}
                >
                  {m.role === 'user' ? (
                    <p className="font-medium">{m.content}</p>
                  ) : (
                    <div className="prose prose-sm max-w-none prose-headings:font-display prose-headings:text-verde">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.content || '...'}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {chatLoading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex justify-start">
                <div className="bg-white border border-tinta/10 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 bg-verde/50 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-verde/50 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-verde/50 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="shrink-0">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Escribí tu pregunta..."
                disabled={chatLoading}
                className="flex-1 bg-white border border-tinta/10 rounded-xl px-4 py-3 text-sm text-tinta placeholder:text-tinta/30 focus:outline-none focus:border-verde/40 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={chatLoading || !input.trim()}
                className="bg-verde text-crema font-bold px-5 py-3 rounded-xl text-sm tracking-wider hover:bg-verde-claro transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                ENVIAR
              </button>
            </form>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="text-tinta/30 text-xs hover:text-tinta/60 mt-2 transition-colors"
              >
                Limpiar conversación
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── TAB EXAMEN ───────────────────────────────────────────── */}
      {tab === 'exam' && (
        <div className="flex-1 overflow-y-auto">

          {examState.phase === 'idle' && (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-tinta/5">
              <p className="text-4xl mb-4">📝</p>
              <p className="font-display text-verde text-2xl mb-2">MODO EXAMEN</p>
              <p className="text-tinta/50 text-sm mb-6 max-w-sm mx-auto">
                La IA genera una pregunta basada en el material de la materia. Respondé y recibí feedback con explicación.
              </p>
              <button
                onClick={generateQuestion}
                className="bg-amarillo text-tinta font-bold px-8 py-3 rounded-lg tracking-wider hover:bg-amarillo/80 transition-colors"
              >
                GENERAR PREGUNTA
              </button>
            </div>
          )}

          {examState.phase === 'loading' && (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-tinta/5">
              <div className="flex gap-1 justify-center mb-4">
                <span className="w-2 h-2 bg-verde rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-verde rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-verde rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
              <p className="text-tinta/50 text-sm">Generando pregunta con IA...</p>
            </div>
          )}

          {(examState.phase === 'question' || examState.phase === 'answered') && (
            <div className="space-y-4">
              <p className="text-[10px] font-bold tracking-widest text-tinta/40 px-1">
                BASADO EN: {examState.data.source.toUpperCase()}
              </p>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-tinta/5">
                <p className="font-medium text-tinta text-base leading-relaxed mb-6">
                  {examState.data.question}
                </p>

                <div className="space-y-3">
                  {examState.data.options.map((opt, i) => {
                    const isSelected = examState.selected === i
                    const isCorrect  = examState.phase === 'answered' && examState.result.correct_index === i
                    const isWrong    = examState.phase === 'answered' && isSelected && !examState.result.is_correct

                    let cls = 'border-tinta/10 text-tinta/70 hover:border-verde/40'
                    if (examState.phase === 'question' && isSelected)
                      cls = 'border-verde bg-verde/10 text-verde font-bold'
                    if (examState.phase === 'answered') {
                      if (isCorrect)      cls = 'border-verde bg-verde/10 text-verde font-bold'
                      else if (isWrong)   cls = 'border-rojo bg-rojo/10 text-rojo font-bold'
                      else                cls = 'border-tinta/10 text-tinta/40'
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => {
                          if (examState.phase === 'question')
                            setExamState({ ...examState, selected: i })
                        }}
                        disabled={examState.phase === 'answered'}
                        className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm ${cls} disabled:cursor-default`}
                      >
                        <span className="font-bold mr-3 text-tinta/40">
                          {String.fromCharCode(65 + i)})
                        </span>
                        {opt}
                        {examState.phase === 'answered' && isCorrect && <span className="ml-2">✅</span>}
                        {examState.phase === 'answered' && isWrong   && <span className="ml-2">❌</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {examState.phase === 'answered' && (
                <div className={`rounded-2xl p-5 border ${examState.result.is_correct ? 'bg-verde/5 border-verde/20' : 'bg-rojo/5 border-rojo/20'}`}>
                  <p className={`font-display text-xl mb-2 ${examState.result.is_correct ? 'text-verde' : 'text-rojo'}`}>
                    {examState.result.is_correct ? '¡CORRECTO!' : 'INCORRECTO'}
                  </p>
                  <p className="text-sm text-tinta/70 leading-relaxed">{examState.result.explanation}</p>
                </div>
              )}

              <div className="flex gap-3 pb-4">
                {examState.phase === 'question' && (
                  <button
                    onClick={evaluateAnswer}
                    disabled={examState.selected === null}
                    className="flex-1 bg-amarillo text-tinta font-bold py-3 rounded-lg tracking-wider hover:bg-amarillo/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    CONFIRMAR RESPUESTA
                  </button>
                )}
                {examState.phase === 'answered' && (
                  <button
                    onClick={generateQuestion}
                    className="flex-1 bg-verde text-crema font-bold py-3 rounded-lg tracking-wider hover:bg-verde-claro transition-colors"
                  >
                    SIGUIENTE PREGUNTA →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
