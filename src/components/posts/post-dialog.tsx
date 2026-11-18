'use client'

import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ImagePicker } from '@/components/posts/image-picker'
import { createPost, updatePost } from '@/app/(portal)/dashboard/actions'
import {
  PLATFORMS,
  PLATFORM_LABELS,
  postSchema,
  type Platform,
  type PostInput,
} from '@/lib/validations/post'
import type { Post } from '@/types/database'

export type PostDraft = { caption: string; platform: Platform }

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Editing an existing post, or starting from a generated caption. */
  post?: Post | null
  draft?: PostDraft | null
  /** Signed URLs for existing images, keyed by storage path. */
  imageUrls?: Record<string, string>
  onSaved: (post: Post) => void | Promise<void>
}

const platformItems = PLATFORMS.map((p) => ({ value: p, label: PLATFORM_LABELS[p] }))
const statusItems = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'draft', label: 'Draft' },
]

// datetime-local needs "yyyy-MM-ddTHH:mm" in the browser's local time
function toLocalInput(iso: string | null | undefined) {
  return iso ? format(new Date(iso), "yyyy-MM-dd'T'HH:mm") : ''
}

function defaults(post?: Post | null, draft?: PostDraft | null): PostInput {
  if (post) {
    return {
      caption: post.caption,
      platform: post.platform as Platform,
      status: post.status === 'draft' ? 'draft' : 'scheduled',
      scheduledAt: toLocalInput(post.scheduled_at),
      imagePath: post.image_path,
    }
  }
  return {
    caption: draft?.caption ?? '',
    platform: draft?.platform ?? 'instagram',
    status: 'scheduled',
    scheduledAt: toLocalInput(new Date(Date.now() + 60 * 60 * 1000).toISOString()),
    imagePath: null,
  }
}

export function PostDialog({
  open,
  onOpenChange,
  post,
  draft,
  imageUrls = {},
  onSaved,
}: Props) {
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  // Preview of a just-uploaded image, matched to its path
  const [localPreview, setLocalPreview] = useState<{ path: string; url: string } | null>(null)
  const form = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: defaults(post, draft),
  })

  useEffect(() => {
    if (open) form.reset(defaults(post, draft))
  }, [open, post, draft, form])

  async function onSubmit(values: PostInput) {
    setSaving(true)
    const input = {
      ...values,
      scheduledAt: values.scheduledAt
        ? new Date(values.scheduledAt).toISOString()
        : undefined,
    }
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const result = post
      ? await updatePost(post.id, input, timeZone)
      : await createPost(input, timeZone)
    if (result.error || !result.post) {
      toast.error(result.error ?? 'Could not save the post.')
      setSaving(false)
      return
    }
    toast.success(post ? 'Post updated' : 'Post saved')
    if (result.emailFailed) toast.error('Post saved, but the email could not be sent.')
    await onSaved(result.post)
    setSaving(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{post ? 'Edit post' : 'Save post'}</DialogTitle>
          <DialogDescription>
            Edit the caption, then pick when it should go out.
          </DialogDescription>
        </DialogHeader>

        <form
          id="post-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4"
          noValidate
        >
          <Controller
            control={form.control}
            name="caption"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="caption">Caption</FieldLabel>
                <Textarea
                  {...field}
                  id="caption"
                  rows={6}
                  className="max-h-64"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="platform"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Platform</FieldLabel>
                  <Select
                    items={platformItems}
                    value={field.value}
                    onValueChange={(v) => field.onChange(v)}
                  >
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {platformItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <Select
                    items={statusItems}
                    value={field.value}
                    onValueChange={(v) => field.onChange(v)}
                  >
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>

          <Controller
            control={form.control}
            name="scheduledAt"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="scheduledAt">Date and time</FieldLabel>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  id="scheduledAt"
                  type="datetime-local"
                  className="h-11"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="imagePath"
            render={({ field }) => (
              <ImagePicker
                previewUrl={
                  !field.value
                    ? null
                    : localPreview?.path === field.value
                      ? localPreview.url
                      : (imageUrls[field.value] ?? null)
                }
                onBusyChange={setUploading}
                onChange={(value) => {
                  field.onChange(value?.path ?? null)
                  setLocalPreview(
                    value ? { path: value.path, url: value.previewUrl } : null,
                  )
                }}
              />
            )}
          />
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="post-form" disabled={saving || uploading}>
            {saving && <Loader2 className="animate-spin" />}
            {post ? 'Save changes' : 'Save post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
