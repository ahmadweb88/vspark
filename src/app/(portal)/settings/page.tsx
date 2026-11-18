import type { Metadata } from 'next'
import { PageHero } from '@/components/portal/page-hero'
import { requireUser } from '@/lib/auth'
import { getSettingsOrDefault } from '@/lib/email'
import { SettingsForm } from './settings-form'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const { user, supabase } = await requireUser()
  const settings = await getSettingsOrDefault(supabase, user)

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Settings"
        title="Email notifications"
        description="Choose where reminders go and write them your way."
      />
      <SettingsForm
        defaults={{
          email: settings.email,
          enabled: settings.enabled,
          remindMinutesBefore: settings.remind_minutes_before,
          subjectTemplate: settings.subject_template,
          messageTemplate: settings.message_template,
        }}
      />
    </div>
  )
}
