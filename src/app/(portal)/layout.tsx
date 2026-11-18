import { Sidebar } from '@/components/portal/sidebar'
import { Topbar } from '@/components/portal/topbar'
import { requireUser } from '@/lib/auth'

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, supabase } = await requireUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()

  const email = user.email ?? ''
  const name: string =
    profile?.full_name ?? user.user_metadata.full_name ?? email

  return (
    <div className="bg-muted flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* [PLACEHOLDER] Replace "Member" with the user's real role if the app has roles. */}
        <Topbar name={name} email={email} role="Member" />
        <main id="main" className="container-app flex-1 py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
