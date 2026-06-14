'use client'

import { useEffect, useState } from 'react'

interface SubjectAccess { name: string; slug: string; expires_at: string }
interface UserRow {
  id:                 string
  email:              string
  full_name:          string
  instagram_username: string | null
  is_admin:           boolean
  must_change_pass:   boolean
  subjects:           SubjectAccess[]
}
interface Subject { id: string; name: string; slug: string }

export default function AdminUsersPage() {
  const [users,     setUsers]     = useState<UserRow[]>([])
  const [subjects,  setSubjects]  = useState<Subject[]>([])
  const [search,    setSearch]    = useState('')
  const [expanded,  setExpanded]  = useState<string | null>(null)
  const [granting,  setGranting]  = useState<{ userId: string; subjectId: string } | null>(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/users').then(r => r.json()),
      fetch('/api/admin/subjects').then(r => r.json()),
    ]).then(([u, s]) => { setUsers(u); setSubjects(s); setLoading(false) })
  }, [])

  async function grantAccess(userId: string, subjectId: string) {
    setGranting({ userId, subjectId })
    const res = await fetch('/api/admin/users', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ user_id: userId, subject_id: subjectId }),
    })
    if (res.ok) {
      const sub = subjects.find(s => s.id === subjectId)!
      const exp = new Date(); exp.setFullYear(exp.getFullYear() + 1)
      setUsers(prev => prev.map(u => u.id === userId
        ? { ...u, subjects: [...u.subjects.filter(s => s.slug !== sub.slug), { name: sub.name, slug: sub.slug, expires_at: exp.toISOString() }] }
        : u
      ))
    }
    setGranting(null)
  }

  async function revokeAccess(userId: string, subjectId: string) {
    if (!confirm('¿Quitar el acceso a esta materia?')) return
    const res = await fetch(`/api/admin/users?user_id=${userId}&subject_id=${subjectId}`, { method: 'DELETE' })
    if (res.ok) {
      const sub = subjects.find(s => s.id === subjectId)!
      setUsers(prev => prev.map(u => u.id === userId
        ? { ...u, subjects: u.subjects.filter(s => s.slug !== sub.slug) }
        : u
      ))
    }
  }

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.instagram_username ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <p className="text-tinta/40 text-[10px] font-bold tracking-widest">ADMIN</p>
        <h1 className="font-display text-verde text-3xl mt-1">USUARIOS</h1>
      </div>

      <div className="mb-5">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, email o instagram..."
          className="w-full max-w-md bg-white border border-tinta/15 rounded-xl px-4 py-2.5 text-sm text-tinta placeholder:text-tinta/30 focus:outline-none focus:ring-2 focus:ring-verde/30"
        />
        <p className="text-tinta/30 text-xs mt-2">{filtered.length} usuario{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <p className="text-tinta/30 text-sm">Cargando...</p>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && <div className="text-center py-12 text-tinta/30 text-sm">Sin usuarios</div>}
          {filtered.map(u => {
            const isExpanded = expanded === u.id
            const daysLeft = (exp: string) => Math.ceil((new Date(exp).getTime() - Date.now()) / 86400000)

            return (
              <div key={u.id} className="bg-white border border-tinta/10 rounded-2xl overflow-hidden hover:border-tinta/15 transition-all duration-200">
                {/* Fila principal */}
                <div
                  className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-tinta/5 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : u.id)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-verde/10 border border-verde/20 flex items-center justify-center text-verde font-bold text-sm shrink-0">
                      {u.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-tinta font-bold text-sm">{u.full_name}</p>
                        {u.is_admin && <span className="bg-amarillo text-tinta text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider">ADMIN</span>}
                        {u.must_change_pass && <span className="bg-tinta/10 text-tinta/50 text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider">TEMP PASS</span>}
                      </div>
                      <p className="text-tinta/40 text-xs">{u.email}{u.instagram_username ? ` · ${u.instagram_username}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs text-tinta/40">
                      {u.subjects.length} materia{u.subjects.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-tinta/30 text-sm">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Detalle expandido */}
                {isExpanded && (
                  <div className="border-t border-tinta/5 px-5 py-4">
                    <p className="text-[10px] font-bold tracking-widest text-tinta/40 mb-3">MATERIAS CON ACCESO</p>

                    <div className="space-y-2 mb-4">
                      {u.subjects.length === 0 && (
                        <p className="text-tinta/30 text-xs">Sin materias asignadas</p>
                      )}
                      {u.subjects.map(s => {
                        const sub = subjects.find(x => x.slug === s.slug)
                        return (
                          <div key={s.slug} className="flex items-center justify-between bg-crema/50 rounded-xl px-3 py-2">
                            <div>
                              <p className="text-tinta text-xs font-bold">{s.name}</p>
                              <p className="text-tinta/40 text-[10px]">Vence en {daysLeft(s.expires_at)} días</p>
                            </div>
                            {sub && (
                              <button
                                onClick={() => revokeAccess(u.id, sub.id)}
                                className="text-[10px] font-bold text-tinta/30 hover:text-rojo transition-colors"
                              >
                                QUITAR
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Agregar acceso */}
                    <p className="text-[10px] font-bold tracking-widest text-tinta/40 mb-2">AGREGAR ACCESO</p>
                    <div className="flex flex-wrap gap-2">
                      {subjects
                        .filter(s => !u.subjects.some(us => us.slug === s.slug))
                        .map(s => (
                          <button
                            key={s.id}
                            onClick={() => grantAccess(u.id, s.id)}
                            disabled={granting?.userId === u.id && granting?.subjectId === s.id}
                            className="text-[10px] font-bold px-3 py-1.5 rounded-xl bg-verde/20 text-verde hover:bg-verde/30 transition-colors disabled:opacity-50 tracking-wider"
                          >
                            + {s.name.toUpperCase()}
                          </button>
                        ))
                      }
                      {subjects.every(s => u.subjects.some(us => us.slug === s.slug)) && (
                        <p className="text-tinta/30 text-xs">Acceso a todas las materias</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
