import type { Metadata } from 'next'
import { Inbox, UserRound } from 'lucide-react'
import { ListCard } from '@/components/portal/list-card'
import { PageHero } from '@/components/portal/page-hero'
import { SectionLabel } from '@/components/portal/section-label'
import { StatCard } from '@/components/portal/stat-card'
import { requireUser } from '@/lib/auth'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const { user, supabase } = await requireUser()
  const [{ data: profile }, profileCount] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('id', user.id),
  ])

  const fullName: string | undefined =
    profile?.full_name ?? user.user_metadata.full_name
  const firstName = fullName?.split(' ')[0] ?? 'there'

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Your account"
        title={`Welcome back, ${firstName}`}
        description="Here’s what’s in your account today."
      />

      {/* [PLACEHOLDER] Replace with real counts from the project's own tables. */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
        <StatCard
          icon={UserRound}
          label="Profile records"
          value={profileCount.error ? null : (profileCount.count ?? 0)}
        />
      </div>

      <SectionLabel>Recent activity</SectionLabel>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 3xl:grid-cols-3">
        {/* [PLACEHOLDER] Render ListCardRow items here once the app has data. */}
        <ListCard
          icon={Inbox}
          title="Recent items"
          empty={{
            title: 'Nothing here yet',
            description: 'Items you add will show up here, newest first.',
          }}
        />
      </div>
    </div>
  )
}
