'use server'

import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { postSchema, type PostInput } from '@/lib/validations/post'
import type { Post } from '@/types/database'

export type PostResult = { post?: Post; error?: string }

const NOT_LOGGED_IN = { error: 'Your session has ended. Please log in again.' }

function toRow(input: PostInput) {
  return {
    caption: input.caption,
    platform: input.platform,
    status: input.status,
    scheduled_at: input.scheduledAt ? new Date(input.scheduledAt).toISOString() : null,
  }
}

export async function createPost(input: PostInput): Promise<PostResult> {
  const user = await getUser()
  if (!user) return NOT_LOGGED_IN

  const parsed = postSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .insert(toRow(parsed.data))
    .select()
    .single()
  if (error) return { error: 'Could not save the post. Please try again.' }

  revalidatePath('/dashboard')
  return { post: data }
}

export async function updatePost(
  id: string,
  input: PostInput,
): Promise<PostResult> {
  const user = await getUser()
  if (!user) return NOT_LOGGED_IN

  const parsed = postSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .update({ ...toRow(parsed.data), reminder_sent_at: null })
    .eq('id', id)
    .select()
    .single()
  if (error) return { error: 'Could not update the post. Please try again.' }

  revalidatePath('/dashboard')
  return { post: data }
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
