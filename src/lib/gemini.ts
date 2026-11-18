import { ApiError, GoogleGenAI } from '@google/genai'
import {
  captionResponseSchema,
  type CaptionRequest,
  type CaptionResponse,
} from '@/lib/validations/captions'
import { PLATFORM_LABELS } from '@/lib/validations/post'

// gemini-2.5-flash is closed to new keys, so the current Flash model is used.
const MODELS = ['gemini-3.8-flash']

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

  let modelIndex = 0
  // One retry when the model returns JSON that doesn't match the schema.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODELS[modelIndex],
        contents: buildPrompt(input),
        config: {
          responseMimeType: 'application/json',
          temperature: 0.9,
          // No "thinking" step: captions are simple and it keeps the reply fast.
          thinkingConfig: { thinkingBudget: 0 },
        },
      })
      const parsed = captionResponseSchema.safeParse(
        JSON.parse(response.text ?? '{}'),
      )
      if (parsed.success) return parsed.data
    } catch (error) {
      if (error instanceof ApiError) {
        // Model not available for this key: switch to the fallback model.
        if (error.status === 404 && modelIndex < MODELS.length - 1) {
          modelIndex++
          attempt--
          continue
        }
        if (error.status === 429)
          throw new CaptionError('Too many requests. Wait a moment and try again.', 429)
        throw new CaptionError('The AI service is unavailable right now.', 502)
      }
      if (!(error instanceof SyntaxError)) throw error
    }
  }
  throw new CaptionError('The AI returned an unexpected answer. Try again.', 502)
}
