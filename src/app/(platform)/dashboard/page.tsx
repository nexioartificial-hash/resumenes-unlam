import { createClient } from '@/lib/supabase/server'
import SubjectCard from '@/components/subjects/SubjectCard'
import LockedSubjectCard from '@/components/subjects/LockedSubjectCard'
import ComingSoonSubjectCard from '@/components/subjects/ComingSoonSubjectCard'

interface Subject {
  id:          string
  name:        string
  slug:        string
  color:       string
  order_index: number
  available:   boolean
  has_access:  boolean
  expires_at:  string | null
}

async function getSubjects(userId: string): Promise<Subject[]> {
  const supabase = await createClient()

  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .order('order_index')

  const { data: userSubjects } = await supabase
    .from('user_subjects')
    .select('subject_id, expires_at')
    .eq('user_id', userId)
    .gt('expires_at', new Date().toISOString())

  const accessMap = new Map(
    (userSubjects ?? []).map(us => [us.subject_id, us.expires_at])
  )

  return (subjects ?? []).map(s => ({
    ...s,
    available:  s.available ?? true,
    has_access: accessMap.has(s.id),
    expires_at: accessMap.get(s.id) ?? null,
  }))
}

async function getProgressMap(userId: string): Promise<Map<string, number>> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('user_subject_progress')
    .select('subject_id, progress_pct')
    .eq('user_id', userId)

  return new Map((data ?? []).map(r => [r.subject_id, r.progress_pct ?? 0]))
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  const [subjects, progressMap] = await Promise.all([
    getSubjects(user!.id),
    getProgressMap(user!.id),
  ])

  const mySubjects       = subjects.filter(s => s.has_access && s.available)
  const comingSoon       = subjects.filter(s => !s.available)
  const lockedSubjects   = subjects.filter(s => !s.has_access && s.available)

  return (
    <div>
      {/* Saludo */}
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-[0.3em] text-tinta/40 mb-1">BIENVENIDO</p>
        <h1 className="font-display text-verde leading-none" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
          {profile?.full_name ? `HOLA, ${profile.full_name.split(' ')[0].toUpperCase()}` : 'HOLA'}
        </h1>
        <p className="text-tinta/40 text-sm mt-2">
          Estas son tus materias del curso de ingreso UNLaM
        </p>
      </div>

      {/* Mis materias */}
      {mySubjects.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-px bg-tinta/20" />
            <h2 className="text-[10px] font-bold tracking-widest text-tinta/40">MIS MATERIAS</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mySubjects.map(subject => (
              <SubjectCard
                key={subject.id}
                name={subject.name}
                slug={subject.slug}
                color={subject.color}
                progress={progressMap.get(subject.id) ?? 0}
                expires_at={subject.expires_at!}
              />
            ))}
          </div>
        </section>
      )}

      {/* Próximamente */}
      {comingSoon.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-px bg-tinta/20" />
            <h2 className="text-[10px] font-bold tracking-widest text-tinta/40">PRÓXIMAMENTE</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {comingSoon.map(subject => (
              <ComingSoonSubjectCard
                key={subject.id}
                name={subject.name}
                color={subject.color}
              />
            ))}
          </div>
        </section>
      )}

      {/* Materias bloqueadas */}
      {lockedSubjects.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-px bg-tinta/20" />
            <h2 className="text-[10px] font-bold tracking-widest text-tinta/40">DISPONIBLES PARA COMPRAR</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {lockedSubjects.map(subject => (
              <LockedSubjectCard
                key={subject.id}
                name={subject.name}
                color={subject.color}
                slug={subject.slug}
              />
            ))}
          </div>
        </section>
      )}

      {/* Estado vacío */}
      {mySubjects.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📚</p>
          <h2 className="font-display text-verde text-2xl mb-2">
            TODAVÍA NO TENÉS MATERIAS
          </h2>
          <p className="text-tinta/50 text-sm mb-6">
            Escribinos por Instagram para comprar tu material de ingreso
          </p>
          <a
            href="https://instagram.com/resumenes.unlam"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-amarillo text-tinta font-bold px-6 py-3 rounded-xl tracking-wider hover:bg-amarillo/90 transition-colors"
          >
            IR A INSTAGRAM
          </a>
        </div>
      )}
    </div>
  )
}
