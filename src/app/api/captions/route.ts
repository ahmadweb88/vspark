import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { CaptionError, generateCaptions } from '@/lib/gemini'
import { captionRequestSchema } from '@/lib/validations/captions'

export async function POST(request: Request) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Please log in again.' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = captionRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    )
  }

  try {
    const result = await generateCaptions(parsed.data)
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof CaptionError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('captions route failed', error)
    return NextResponse.json(
      { error: 'Couldn’t generate captions. Try again.' },
      { status: 500 },
    )
  }
}
