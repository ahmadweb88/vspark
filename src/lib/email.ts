import nodemailer, { type Transporter } from 'nodemailer'
import { formatInTimeZone } from '@/lib/time'
import { PLATFORM_LABELS, type Platform } from '@/lib/validations/post'
import {
  DEFAULT_MESSAGE,
  DEFAULT_SUBJECT,
} from '@/lib/validations/settings'
import type { NotificationSettings } from '@/types/database'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type PostFields = { caption: string; platform: string; scheduled_at: string | null }
type Templates = Pick<NotificationSettings, 'subject_template' | 'message_template'>

let transporter: Transporter | null = null

function getTransporter() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass) throw new Error('Email is not configured.')
  transporter ??= nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })
  return transporter
}

/** Replaces {caption}, {time} and {platform} in a template. */
export function renderTemplate(
  template: string,
  post: PostFields,
  timeZone = 'UTC',
) {
  const values: Record<string, string> = {
    caption: post.caption,
    platform: PLATFORM_LABELS[post.platform as Platform] ?? post.platform,
    time: post.scheduled_at
      ? formatInTimeZone(post.scheduled_at, timeZone)
      : 'no time set',
  }
  return template.replace(/\{(caption|time|platform)\}/g, (_, key) => values[key])
}

export async function sendPostEmail(
  to: string,
  templates: Templates,
  post: PostFields,
  timeZone?: string,
) {
  await getTransporter().sendMail({
    from: `CaptionFlow <${process.env.GMAIL_USER}>`,
    to,
    subject: renderTemplate(templates.subject_template, post, timeZone),
    text: renderTemplate(templates.message_template, post, timeZone),
  })
}

/** The user's saved settings, or defaults that send to their login email. */
export async function getSettingsOrDefault(
  supabase: SupabaseClient<Database>,
  user: User,
): Promise<NotificationSettings> {
  const { data } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()
  return (
    data ?? {
      user_id: user.id,
      email: user.email ?? '',
      enabled: true,
      remind_minutes_before: 60,
      subject_template: DEFAULT_SUBJECT,
      message_template: DEFAULT_MESSAGE,
      updated_at: new Date().toISOString(),
    }
  )
}
