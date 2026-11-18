'use client'

import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Loader2, RotateCw, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  TONES,
  TONE_LABELS,
  captionRequestSchema,
  captionToText,
  type Caption,
  type CaptionRequest,
} from '@/lib/validations/captions'
import { PLATFORMS, PLATFORM_LABELS, type Platform } from '@/lib/validations/post'

const platformItems = PLATFORMS.map((p) => ({ value: p, label: PLATFORM_LABELS[p] }))
const toneItems = TONES.map((t) => ({ value: t, label: TONE_LABELS[t] }))

type Props = {
  onUse: (draft: { caption: string; platform: Platform }) => void
}

export function CaptionGenerator({ onUse }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [captions, setCaptions] = useState<Caption[]>([])
  const [lastRequest, setLastRequest] = useState<CaptionRequest | null>(null)

  const form = useForm<CaptionRequest>({
    resolver: zodResolver(captionRequestSchema),
    defaultValues: { prompt: '', platform: 'instagram', tone: 'friendly' },
  })

  async function generate(values: CaptionRequest) {
    setLoading(true)
    setError(null)
    setLastRequest(values)
    try {
      const res = await fetch('/api/captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Couldn’t generate captions.')
      setCaptions(data.captions)
    } catch (e) {
      setCaptions([])
      setError(e instanceof Error ? e.message : 'Couldn’t generate captions.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={form.handleSubmit(generate)}
        className="bg-card space-y-4 rounded-2xl border p-4"
        noValidate
      >
        <Controller
          control={form.control}
          name="prompt"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="prompt">Describe your post</FieldLabel>
              <Textarea
                {...field}
                id="prompt"
                rows={3}
                placeholder="e.g. Launching our new cold brew coffee this Friday, 20% off for the first week"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <Controller
            control={form.control}
            name="platform"
            render={({ field }) => (
              <Field>
                <FieldLabel>Platform</FieldLabel>
                <Select items={platformItems} value={field.value} onValueChange={(v) => field.onChange(v)}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platformItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="tone"
            render={({ field }) => (
              <Field>
                <FieldLabel>Tone</FieldLabel>
                <Select items={toneItems} value={field.value} onValueChange={(v) => field.onChange(v)}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {toneItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
        </div>
        <Button type="submit" className="h-11 w-full sm:w-auto" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
          Generate captions
        </Button>
      </form>

      {loading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Generating captions">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="border-destructive/40 bg-destructive/5 rounded-2xl border p-4">
          <p className="text-destructive flex items-center gap-2 text-sm font-semibold">
            <AlertCircle className="size-4" /> {error}
          </p>
          {lastRequest && (
            <Button variant="outline" size="sm" className="mt-3" onClick={() => generate(lastRequest)}>
              <RotateCw /> Retry
            </Button>
          )}
        </div>
      ) : captions.length > 0 ? (
        <ul className="space-y-3">
          {captions.map((caption, i) => (
            <li key={i} className="bg-card rounded-2xl border p-4">
              <p className="text-sm whitespace-pre-line">{caption.text}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {caption.hashtags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </Badge>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() =>
                  onUse({
                    caption: captionToText(caption),
                    platform: lastRequest?.platform ?? 'instagram',
                  })
                }
              >
                Use this caption
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
