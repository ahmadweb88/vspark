import type { Metadata } from 'next'
import { PageHero } from '@/components/portal/page-hero'
import { Studio } from '@/components/posts/studio'
import { requireUser } from '@/lib/auth'
import { listPosts } from '@/lib/posts'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const { supabase } = await requireUser()
  const posts = await listPosts(supabase)
  const upcoming = posts.filter((p) => p.status === 'scheduled').length

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="CaptionFlow"
        title="Describe your post, pick a caption"
        description={`${upcoming} scheduled ${upcoming === 1 ? 'post' : 'posts'}. Generate captions with AI, schedule them and get a reminder by email.`}
      />
      <Studio posts={posts} />
    </div>
  )
}
