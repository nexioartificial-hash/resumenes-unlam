import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'
import AdminMobileBar from '@/components/admin/AdminMobileBar'
import MobileNavProvider from '@/components/layout/MobileNavProvider'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, full_name')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/dashboard')

  return (
    <MobileNavProvider>
      <div className="flex min-h-screen bg-crema">
        <AdminNav />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminMobileBar />
          <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </MobileNavProvider>
  )
}
