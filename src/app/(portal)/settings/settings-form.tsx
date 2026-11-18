'use client'

import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Clock, Loader2, Mail, Send } from 'lucide-react'
import { toast } from 'sonner'
import { FormTextField } from '@/components/form-text-field'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { settingsSchema, type SettingsInput } from '@/lib/validations/settings'
import { saveSettings, sendTestEmail } from './actions'

export function SettingsForm({ defaults }: { defaults: SettingsInput }) {
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaults,
  })

  async function onSubmit(values: SettingsInput) {
    setSaving(true)
    const result = await saveSettings(values)
    setSaving(false)
    if (result?.error) toast.error(result.error)
    else {
      toast.success('Settings saved')
      form.reset(values)
    }
  }

  async function onTest() {
    if (form.formState.isDirty) {
      toast.message('Save your changes first, then send a test email.')
      return
    }
    setTesting(true)
    const result = await sendTestEmail(
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    )
    setTesting(false)
    if (result?.error) toast.error(result.error)
    else toast.success(`Test email sent to ${form.getValues('email')}`)
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="bg-card max-w-2xl space-y-5 rounded-2xl border p-4 md:p-6"
      noValidate
    >
      <FormTextField
        control={form.control}
        name="email"
        label="Send emails to"
        type="email"
        icon={Mail}
        autoComplete="email"
      />

      <Controller
        control={form.control}
        name="enabled"
        render={({ field }) => (
          <label className="flex items-center gap-3 text-sm font-medium">
            <input
              type="checkbox"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              className="accent-primary size-5"
            />
            Send email notifications
          </label>
        )}
      />

      <Controller
        control={form.control}
        name="remindMinutesBefore"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="remindMinutesBefore">
              Remind me (minutes before)
            </FieldLabel>
            <div className="relative max-w-48">
              <Clock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                id="remindMinutesBefore"
                type="number"
                min={5}
                max={1440}
                className="h-11 pl-9"
                value={Number.isNaN(field.value) ? '' : field.value}
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                onBlur={field.onBlur}
                aria-invalid={fieldState.invalid}
              />
            </div>
            <FieldDescription>
              The daily check emails every post due in the next 24 hours.
            </FieldDescription>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <FormTextField control={form.control} name="subjectTemplate" label="Subject template" />

      <Controller
        control={form.control}
        name="messageTemplate"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="messageTemplate">Message template</FieldLabel>
            <Textarea
              {...field}
              id="messageTemplate"
              rows={5}
              aria-invalid={fieldState.invalid}
            />
            <FieldDescription>
              Placeholders: <code>{'{caption}'}</code> <code>{'{time}'}</code>{' '}
              <code>{'{platform}'}</code>
            </FieldDescription>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" className="h-11" disabled={saving}>
          {saving && <Loader2 className="animate-spin" />}
          Save settings
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={onTest}
          disabled={testing}
        >
          {testing ? <Loader2 className="animate-spin" /> : <Send />}
          Send test email
        </Button>
      </div>
    </form>
  )
}
