import { z } from 'zod'

export const DEFAULT_SUBJECT = 'Reminder: your {platform} post at {time}'
export const DEFAULT_MESSAGE =
  'Your post is scheduled for {time} on {platform}:\n\n{caption}'

/** Same schema on the settings form and in the server action. */
export const settingsSchema = z.object({
  email: z.email('Enter a valid email address.').max(254),
  enabled: z.boolean(),
  remindMinutesBefore: z
    .number('Enter a number of minutes.')
    .int('Use whole minutes.')
    .min(5, 'At least 5 minutes.')
    .max(1440, 'At most 1440 minutes (24 hours).'),
  subjectTemplate: z
    .string()
    .trim()
    .min(1, 'Write a subject.')
    .max(150, 'Keep the subject under 150 characters.'),
  messageTemplate: z
    .string()
    .trim()
    .min(1, 'Write a message.')
    .max(2000, 'Keep the message under 2000 characters.'),
})

export type SettingsInput = z.infer<typeof settingsSchema>
