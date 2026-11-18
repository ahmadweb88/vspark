'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { SectionLabel } from '@/components/portal/section-label'
import { CaptionGenerator } from '@/components/posts/caption-generator'
import {
  DriveBadge,
  DriveConnectButton,
  DriveProvider,
  useDrive,
} from '@/components/posts/drive-connect'
import { PostDialog, type PostDraft } from '@/components/posts/post-dialog'
import { PostFeed } from '@/components/posts/post-feed'
import { setDriveFileId } from '@/app/(portal)/dashboard/actions'
import { deleteDriveFile, syncPostToDrive } from '@/lib/drive'
import type { Post } from '@/types/database'

/** The single main page: caption generator on one side, the post feed on the other. */
export function Studio({ posts }: { posts: Post[] }) {
  return (
    <DriveProvider>
      <StudioInner posts={posts} />
    </DriveProvider>
  )
}

function StudioInner({ posts }: { posts: Post[] }) {
  const { getToken } = useDrive()
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

  // Supabase is the source of truth; Drive is a best-effort backup.
  async function handleSaved(post: Post) {
    const token = getToken()
    if (!token) return
    try {
      const fileId = await syncPostToDrive(token, post)
      if (fileId !== post.drive_file_id) await setDriveFileId(post.id, fileId)
      toast.success('Synced to Drive')
    } catch {
      toast.error('Post saved, but Drive sync failed.')
    }
  }

  async function handleDeleted(post: Post) {
    if (!post.drive_file_id) return
    const token = getToken()
    if (!token) {
      toast.message('Connect Google Drive to remove its backup file too.')
      return
    }
    try {
      await deleteDriveFile(token, post.drive_file_id)
    } catch {
      toast.error('Post deleted, but the Drive file could not be removed.')
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="space-y-4">
        <SectionLabel>Generate</SectionLabel>
        <CaptionGenerator onUse={openNew} />
        <Button variant="ghost" onClick={() => openNew(null)}>
          <Plus /> Write a post yourself
        </Button>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionLabel>Your posts ({posts.length})</SectionLabel>
          <DriveConnectButton />
        </div>
        <PostFeed
          posts={posts}
          onEdit={openEdit}
          onDeleted={handleDeleted}
          renderBadges={(post) => <DriveBadge fileId={post.drive_file_id} />}
        />
      </section>

      <PostDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        post={editing}
        draft={draft}
        onSaved={handleSaved}
      />
    </div>
  )
}
