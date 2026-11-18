'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionLabel } from '@/components/portal/section-label'
import { PostDialog, type PostDraft } from '@/components/posts/post-dialog'
import { PostFeed } from '@/components/posts/post-feed'
import type { Post } from '@/types/database'

/** The single main page: caption generator on one side, the post feed on the other. */
export function Studio({ posts }: { posts: Post[] }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Post | null>(null)
  const [draft, setDraft] = useState<PostDraft | null>(null)

  function openNew(next: PostDraft | null) {
    setEditing(null)
    setDraft(next)
    setDialogOpen(true)
  }

  function openEdit(post: Post) {
    setDraft(null)
    setEditing(post)
    setDialogOpen(true)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="space-y-4">
        <SectionLabel>Generate</SectionLabel>
        <Button variant="outline" onClick={() => openNew(null)}>
          <Plus /> Write a post yourself
        </Button>
      </section>

      <section className="space-y-4">
        <SectionLabel>Your posts ({posts.length})</SectionLabel>
        <PostFeed posts={posts} onEdit={openEdit} onDeleted={() => {}} />
      </section>

      <PostDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        post={editing}
        draft={draft}
        onSaved={() => {}}
      />
    </div>
  )
}
