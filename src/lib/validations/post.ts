import { z } from 'zod'

export const PLATFORMS = ['instagram', 'x', 'linkedin'] as const
export const POST_STATUSES = ['draft', 'scheduled', 'sent'] as const

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: 'Instagram',
  x: 'X',
  linkedin: 'LinkedIn',
}

export type Platform = (typeof PLATFORMS)[number]
export type PostStatus = (typeof POST_STATUSES)[number]

/** Same schema on the client form and in the server actions. */
export const postSchema = z
  .object({
    caption: z
      .string()
      .trim()
      .min(1, 'Write a caption first.')
      .max(2200, 'Captions can be up to 2200 characters.'),
    platform: z.enum(PLATFORMS, 'Pick a platform.'),
    status: z.enum(['draft', 'scheduled']),
    // ISO string from the browser (local time converted with toISOString)
    scheduledAt: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.status !== 'scheduled') return
    const time = value.scheduledAt ? Date.parse(value.scheduledAt) : NaN
    if (Number.isNaN(time)) {
      ctx.addIssue({
        code: 'custom',
        path: ['scheduledAt'],
        message: 'Pick a date and time to schedule.',
      })
    } else if (time < Date.now() - 60_000) {
      ctx.addIssue({
        code: 'custom',
        path: ['scheduledAt'],
        message: 'Pick a time in the future.',
      })
    }
  })

export type PostInput = z.infer<typeof postSchema>
