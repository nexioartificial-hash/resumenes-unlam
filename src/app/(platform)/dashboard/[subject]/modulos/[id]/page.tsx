import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ModuleContent from './ModuleContent'

export default async function ModulePage({
  params,
}: {
  params: Promise<{ subject: string; id: string }>
}) {
  const { subject: slug, id: moduleId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: subject } = await supabase
    .from('subjects').select('id').eq('slug', slug).single()
  if (!subject) redirect('/dashboard')

  const { data: access } = await supabase
    .from('user_subjects').select('id')
    .eq('user_id', user.id).eq('subject_id', subject.id)
    .gt('expires_at', new Date().toISOString()).single()
  if (!access) redirect('/dashboard')

  const { data: module_ } = await supabase
    .from('modules').select('id, title, body, order_index')
    .eq('id', moduleId).eq('subject_id', subject.id).single()
  if (!module_) redirect(`/dashboard/${slug}`)

  const { data: progress } = await supabase
    .from('module_progress').select('id')
    .eq('user_id', user.id).eq('module_id', moduleId)
    .single()

  return (
    <ModuleContent
      slug={slug}
      moduleId={moduleId}
      initialTitle={module_.title}
      initialBody={module_.body ?? ''}
      initialCompleted={!!progress}
    />
  )
}
