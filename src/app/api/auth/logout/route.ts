import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const admin = createAdminClient()
    await admin.from('user_sessions').delete().eq('user_id', user.id)
    await supabase.auth.signOut()
  }

  const response = NextResponse.json({ success: true })
  response.cookies.delete('session_token')
  return response
}
