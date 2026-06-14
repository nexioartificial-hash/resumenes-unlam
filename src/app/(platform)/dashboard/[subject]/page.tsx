import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SubjectContent from './SubjectContent'

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ subject: string }>
}) {
  const { subject: slug } = await params
  const supabase = await createClient()

  const [{ data: { user } }, { data: subject }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('subjects').select('id, name, slug, color').eq('slug', slug).single(),
  ])

  if (!user) redirect('/login')
  if (!subject) redirect('/dashboard')

  const { data: access } = await supabase
    .from('user_subjects').select('expires_at')
    .eq('user_id', user.id).eq('subject_id', subject.id)
    .gt('expires_at', new Date().toISOString()).single()
  if (!access) redirect('/dashboard')

  const [modulesResult, contentResult] = await Promise.all([
    supabase.from('modules')
      .select('id, title, description, order_index')
      .eq('subject_id', subject.id)
      .eq('is_published', true)
      .order('order_index'),
    supabase.from('content_items')
      .select('id, title, body, type, audio_url, duration_seconds, order_index')
      .eq('subject_id', subject.id)
      .eq('is_published', true)
      .order('order_index'),
  ])

  const moduleItems  = modulesResult.data ?? []
  const contentItems = contentResult.data ?? []

  const [moduleProgress, contentProgress] = await Promise.all([
    supabase.from('module_progress').select('module_id')
      .eq('user_id', user.id)
      .in('module_id', moduleItems.map(m => m.id)),
    supabase.from('user_progress').select('content_item_id')
      .eq('user_id', user.id)
      .in('content_item_id', contentItems.map(i => i.id)),
  ])

  const completedModuleIds  = new Set((moduleProgress.data  ?? []).map(p => p.module_id))
  const completedContentIds = new Set((contentProgress.data ?? []).map(p => p.content_item_id))

  const modules = moduleItems.map(m => ({ ...m, completed: completedModuleIds.has(m.id) }))
  const content = contentItems
    .filter(item => item.type !== 'summary')
    .map(item => ({ ...item, completed: completedContentIds.has(item.id) }))

  return <SubjectContent subject={subject} modules={modules} content={content} />
}
