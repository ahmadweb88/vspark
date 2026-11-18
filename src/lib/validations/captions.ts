import { z } from 'zod'
import { PLATFORMS } from '@/lib/validations/post'

export const TONES = ['friendly', 'professional', 'witty', 'inspirational'] as const
export type Tone = (typeof TONES)[number]

export const TONE_LABELS: Record<Tone, string> = {
  friendly: 'Friendly',
  professional: 'Professional',
  witty: 'Witty',
  inspirational: 'Inspirational',
}

/** Request body for POST /api/captions (same schema on the form). */
export const captionRequestSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(3, 'Describe your post in a few words.')
    .max(500, 'Keep the description under 500 characters.'),
  platform: z.enum(PLATFORMS),
  tone: z.enum(TONES),
})

export type CaptionRequest = z.infer<typeof captionRequestSchema>

const captionSchema = z.object({
  text: z.string().trim().min(1).max(2000),
  hashtags: z.array(z.string().trim().min(1)).min(1).max(15),
})

/** What Gemini must return, and what the route sends back. */
export const captionResponseSchema = z.object({
  captions: z.array(captionSchema).length(3),
})

export type Caption = z.infer<typeof captionSchema>
export type CaptionResponse = z.infer<typeof captionResponseSchema>

/** Caption text plus hashtags, ready to edit and save. */
export function captionToText(caption: Caption) {
  const tags = caption.hashtags
    .map((t) => (t.startsWith('#') ? t : `#${t}`).replace(/\s+/g, ''))
    .join(' ')
  return `${caption.text}\n\n${tags}`
}
