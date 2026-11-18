import { ApiError, GoogleGenAI } from '@google/genai'
import {
  captionResponseSchema,
  type CaptionRequest,
  type CaptionResponse,
} from '@/lib/validations/captions'
import { PLATFORM_LABELS } from '@/lib/validations/post'

// gemini-2.5-flash is closed to new keys. 3.8 Flash first; the lite models are
// the fallback when it is overloaded (Google returns 503 "high demand").
const MODELS = ['gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite']
const MODEL_TIMEOUT_MS = 15_000

export class CaptionError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
  }
}

function buildPrompt({ prompt, platform, tone }: CaptionRequest) {
  const limits = {
    instagram: 'up to 300 characters, 5–10 hashtags, emojis welcome',
    x: 'under 240 characters including hashtags, 1–3 hashtags',
    linkedin: '2–4 short sentences, professional, 3–5 hashtags',
  }
  return [
    `Write exactly 3 different ${PLATFORM_LABELS[platform]} captions in a ${tone} tone.`,
    `Rules: ${limits[platform]}. Put hashtags only in the "hashtags" array, without them in "text".`,
    'Reply with JSON only, in this shape: {"captions":[{"text":"...","hashtags":["#tag"]}]} with exactly 3 items.',
    `The post is about: ${prompt}`,
  ].join('\n')
}

export async function generateCaptions(
  input: CaptionRequest,
): Promise<CaptionResponse> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new CaptionError('The AI service is not configured.', 503)

  const ai = new GoogleGenAI({ apiKey })

  let lastStatus = 0
  // Try each model in turn: an overloaded (503), rate-limited (429), missing (404)
  // or slow model, or an answer that fails Zod, moves on to the next one.
  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: buildPrompt(input),
        config: {
          responseMimeType: 'application/json',
          temperature: 0.9,
          httpOptions: { timeout: MODEL_TIMEOUT_MS },
        },
      })
      const parsed = captionResponseSchema.safeParse(
        JSON.parse(response.text ?? '{}'),
      )
      if (parsed.success) return parsed.data
      console.warn(`gemini ${model}: answer failed validation`)
    } catch (error) {
      lastStatus = error instanceof ApiError ? error.status : 0
      console.warn(
        `gemini ${model} failed`,
        lastStatus || (error instanceof Error ? error.message : error),
      )
    }
  }
  if (lastStatus === 429)
    throw new CaptionError('Too many requests. Wait a moment and try again.', 429)
  throw new CaptionError('The AI service is busy right now. Try again.', 502)
}
