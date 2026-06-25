import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import CopyGuard from '@/components/CopyGuard'

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  return (
    <div className="flex min-h-screen bg-crema">
      <CopyGuard />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header fullName={profile?.full_name} />
        <main className="flex-1 p-4 overflow-auto no-copy">
          {children}
        </main>
      </div>
    </div>
  )
}
