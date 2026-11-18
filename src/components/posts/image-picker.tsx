'use client'

import { useRef, useState } from 'react'
import imageCompression from 'browser-image-compression'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ACCEPT = ['image/jpeg', 'image/png', 'image/webp']

type Props = {
  /** Current image: a preview URL (signed or local) and its storage path. */
  previewUrl: string | null
  onChange: (value: { path: string; previewUrl: string } | null) => void
  onBusyChange?: (busy: boolean) => void
}

/** Optional post image: compressed in the browser, uploaded to the private bucket. */
export function ImagePicker({ previewUrl, onChange, onBusyChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    if (!ACCEPT.includes(file.type)) {
      setError('Only JPG, PNG or WebP images are allowed.')
      return
    }
    setUploading(true)
    onBusyChange?.(true)
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      })
      const body = new FormData()
      body.append('file', compressed, file.name)
      const res = await fetch('/api/upload', { method: 'POST', body })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Upload failed. Please try again.')
      onChange({ path: data.path, previewUrl: URL.createObjectURL(compressed) })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      onBusyChange?.(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Image (optional)</p>
      {previewUrl ? (
        <div className="relative w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element -- local blob or signed preview */}
          <img
            src={previewUrl}
            alt="Post image preview"
            className="h-28 w-28 rounded-lg border object-cover"
          />
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="bg-background absolute -top-2 -right-2 rounded-full"
            onClick={() => onChange(null)}
            aria-label="Remove image"
          >
            <X />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
          {uploading ? 'Uploading…' : 'Add image'}
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(',')}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  )
}
