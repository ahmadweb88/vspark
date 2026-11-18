import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Post } from '@/types/database'

/** Upcoming posts first (soonest at the top), then drafts and past posts, newest first. */
export async function listPosts(
  supabase: SupabaseClient<Database>,
): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error('Could not load your posts.')

  return sortPosts(data)
}

export function sortPosts(posts: Post[]): Post[] {
  const now = Date.now()
  const isUpcoming = (p: Post) =>
    p.scheduled_at !== null && Date.parse(p.scheduled_at) >= now
  const upcoming = posts
    .filter(isUpcoming)
    .sort((a, b) => Date.parse(a.scheduled_at!) - Date.parse(b.scheduled_at!))
  const rest = posts
    .filter((p) => !isUpcoming(p))
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
  return [...upcoming, ...rest]
}
