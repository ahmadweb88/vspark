'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { CalendarClock, Pencil, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { deletePost } from '@/app/(portal)/dashboard/actions'
import { PLATFORM_LABELS, type Platform } from '@/lib/validations/post'
import type { Post } from '@/types/database'

type Props = {
  posts: Post[]
  onEdit: (post: Post) => void
  onDeleted: (post: Post) => void | Promise<void>
  /** Extra badges (Drive sync) rendered per post. */
  renderBadges?: (post: Post) => React.ReactNode
}

export function StatusBadge({ status }: { status: string }) {
  if (status === 'scheduled') return <Badge>Scheduled</Badge>
  if (status === 'sent')
    return (
      <Badge variant="outline" className="text-brand-success border-brand-success">
        Sent
      </Badge>
    )
  return <Badge variant="secondary">Draft</Badge>
}

export function PostFeed({ posts, onEdit, onDeleted, renderBadges }: Props) {
  const [query, setQuery] = useState('')
  const [toDelete, setToDelete] = useState<Post | null>(null)
  const [deleting, setDeleting] = useState(false)

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    return term ? posts.filter((p) => p.caption.toLowerCase().includes(term)) : posts
  }, [posts, query])

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    const result = await deletePost(toDelete.id)
    setDeleting(false)
    if (result.error || !result.post) {
      toast.error(result.error ?? 'Could not delete the post.')
      return
    }
    toast.success('Post deleted')
    setToDelete(null)
    await onDeleted(result.post)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your captions"
          aria-label="Search your captions"
          className="h-11 pl-9"
        />
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <p className="font-heading font-semibold">No posts yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Generate your first caption, then save it here.
          </p>
        </div>
      ) : visible.length === 0 ? (
        <p className="text-muted-foreground rounded-2xl border p-6 text-center text-sm">
          No posts match “{query}”.
        </p>
      ) : (
        <ul className="space-y-3">
          {visible.map((post) => (
            <li key={post.id} className="bg-card rounded-2xl border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={post.status} />
                <Badge variant="outline">
                  {PLATFORM_LABELS[post.platform as Platform] ?? post.platform}
                </Badge>
                {renderBadges?.(post)}
              </div>
              <p className="mt-3 line-clamp-4 text-sm whitespace-pre-line">
                {post.caption}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <CalendarClock className="size-3.5" />
                  {post.scheduled_at
                    ? format(new Date(post.scheduled_at), 'EEE d MMM yyyy, HH:mm')
                    : 'No time set'}
                </p>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(post)}>
                    <Pencil /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setToDelete(post)}
                  >
                    <Trash2 /> Delete
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AlertDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              The post and its Drive backup will be removed. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
