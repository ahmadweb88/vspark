'use server'

import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth'
import { getSettingsOrDefault, sendPostEmail } from '@/lib/email'
import { createClient } from '@/lib/supabase/server'
import { settingsSchema, type SettingsInput } from '@/lib/validations/settings'

export type SettingsResult = { error?: string } | undefined

export async function saveSettings(input: SettingsInput): Promise<SettingsResult> {
  const user = await getUser()
  if (!user) return { error: 'Your session has ended. Please log in again.' }

  const parsed = settingsSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.from('notification_settings').upsert({
    user_id: user.id,
    email: parsed.data.email,
    enabled: parsed.data.enabled,
    remind_minutes_before: parsed.data.remindMinutesBefore,
    subject_template: parsed.data.subjectTemplate,
    message_template: parsed.data.messageTemplate,
  })
  if (error) return { error: 'Could not save your settings. Please try again.' }

  revalidatePath('/settings')
}

/** Sends a sample email with the saved templates. */
export async function sendTestEmail(timeZone?: string): Promise<SettingsResult> {
  const user = await getUser()
  if (!user) return { error: 'Your session has ended. Please log in again.' }

  const supabase = await createClient()
  const settings = await getSettingsOrDefault(supabase, user)
  try {
    await sendPostEmail(
      settings.email,
      settings,
      {
        caption: 'This is a test caption from CaptionFlow ✨ #test',
        platform: 'instagram',
        scheduled_at: new Date(
          Date.now() + settings.remind_minutes_before * 60_000,
        ).toISOString(),
      },
      timeZone,
    )
  } catch (e) {
    console.error('test email failed', e)
    return { error: 'Could not send the email. Check the Gmail settings.' }
  }
}
