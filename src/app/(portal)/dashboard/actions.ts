'use server'

import { revalidatePath } from 'next/cache'
import type { User } from '@supabase/supabase-js'
import { getUser } from '@/lib/auth'
import { getSettingsOrDefault, sendPostEmail } from '@/lib/email'
import { isOwnPath, removeFiles } from '@/lib/storage'
import { createClient } from '@/lib/supabase/server'
import { postSchema, type PostInput } from '@/lib/validations/post'
import type { Post } from '@/types/database'

export type PostResult = { post?: Post; error?: string; emailFailed?: boolean }

const NOT_LOGGED_IN = { error: 'Your session has ended. Please log in again.' }

/** Emails the user right away when a post becomes scheduled or its time changes. */
async function notifyScheduled(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: User,
  post: Post,
  timeZone?: string,
) {
  const settings = await getSettingsOrDefault(supabase, user)
  if (!settings.enabled || !settings.email) return true
  try {
    await sendPostEmail(settings.email, settings, post, timeZone)
    return true
  } catch (e) {
    console.error('schedule email failed', e)
    return false
  }
}

function toRow(input: PostInput) {
  return {
    caption: input.caption,
    platform: input.platform,
    status: input.status,
    scheduled_at: input.scheduledAt ? new Date(input.scheduledAt).toISOString() : null,
    image_path: input.imagePath ?? null,
  }
}

const BAD_IMAGE = { error: 'That image can’t be used. Upload it again.' }

export async function createPost(
  input: PostInput,
  timeZone?: string,
): Promise<PostResult> {
  const user = await getUser()
  if (!user) return NOT_LOGGED_IN

  const parsed = postSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  if (parsed.data.imagePath && !isOwnPath(parsed.data.imagePath, user.id))
    return BAD_IMAGE

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .insert(toRow(parsed.data))
    .select()
    .single()
  if (error) return { error: 'Could not save the post. Please try again.' }

  const emailed =
    data.status !== 'scheduled' ||
    (await notifyScheduled(supabase, user, data, timeZone))

  revalidatePath('/dashboard')
  return { post: data, emailFailed: !emailed }
}

export async function updatePost(
  id: string,
  input: PostInput,
  timeZone?: string,
): Promise<PostResult> {
  const user = await getUser()
  if (!user) return NOT_LOGGED_IN

  const parsed = postSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  if (parsed.data.imagePath && !isOwnPath(parsed.data.imagePath, user.id))
    return BAD_IMAGE

  const supabase = await createClient()
  const { data: before } = await supabase
    .from('posts')
    .select('status, scheduled_at, image_path')
    .eq('id', id)
    .maybeSingle()
  if (!before) return { error: 'This post no longer exists.' }

  const row = toRow(parsed.data)
  const timeChanged =
    before.status !== row.status ||
    (before.scheduled_at &&
      Date.parse(before.scheduled_at)) !==
      (row.scheduled_at && Date.parse(row.scheduled_at))

  const { data, error } = await supabase
    .from('posts')
    .update(timeChanged ? { ...row, reminder_sent_at: null } : row)
    .eq('id', id)
    .select()
    .single()
  if (error) return { error: 'Could not update the post. Please try again.' }

  // Image replaced or removed: delete the old file so nothing is orphaned.
  if (before.image_path && before.image_path !== data.image_path)
    await removeFiles(supabase, [before.image_path])

  const emailed =
    !timeChanged ||
    data.status !== 'scheduled' ||
    (await notifyScheduled(supabase, user, data, timeZone))

  revalidatePath('/dashboard')
  return { post: data, emailFailed: !emailed }
}

export async function deletePost(id: string): Promise<PostResult> {
  const user = await getUser()
  if (!user) return NOT_LOGGED_IN

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)
    .select()
    .single()
  if (error) return { error: 'Could not delete the post. Please try again.' }

  await removeFiles(supabase, [data.image_path])
  revalidatePath('/dashboard')
  return { post: data }
}

/** Called from the browser after the Drive file is created. */
export async function setDriveFileId(
  id: string,
  driveFileId: string | null,
): Promise<PostResult> {
  const user = await getUser()
  if (!user) return NOT_LOGGED_IN

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .update({ drive_file_id: driveFileId })
    .eq('id', id)
    .select()
    .single()
  if (error) return { error: 'Could not save the Drive link.' }

  revalidatePath('/dashboard')
  return { post: data }
}
