import Link from 'next/link'
import { cn } from '@/lib/utils'

/** Fill these from docs/req/03-design.md */
export const BRAND = {
  name: 'App',
  tagline: '', // '' for none
  initial: 'A', // used by the monogram style
}

/** light = for light backgrounds (dark text) · dark = for dark backgrounds (white text) */
type Tone = 'light' | 'dark'

/** Monogram tile (style B): two opposite rounded corners with the brand initial. */
export function LogoMark({
  tone = 'light',
  className,
}: {
  tone?: Tone
  className?: string
}) {
  // On dark backgrounds the tile turns accent and the letter dark: accent on white fails contrast.
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={cn('size-8 shrink-0', className)}
    >
      <path
        d="M4 16A12 12 0 0 1 16 4h20v20a12 12 0 0 1-12 12H4z"
        className={tone === 'dark' ? 'fill-primary' : 'fill-brand-dark'}
      />
      <text
        x="20"
        y="27.5"
        textAnchor="middle"
        fontSize="19"
        fontWeight="700"
        className={cn(
          'font-heading',
          tone === 'dark' ? 'fill-brand-dark' : 'fill-primary',
        )}
      >
        {BRAND.initial}
      </text>
    </svg>
  )
}

export function Logo({
  variant = 'full',
  tone = 'light',
  href = '/',
  className,
}: {
  variant?: 'full' | 'mark'
  tone?: Tone
  href?: string | null
  className?: string
}) {
  const content = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark tone={tone} />
      {variant === 'full' && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              'font-heading text-[1.375rem] font-bold tracking-tight',
              tone === 'dark' ? 'text-white' : 'text-brand-dark',
            )}
          >
            {BRAND.name}
          </span>
          {BRAND.tagline && (
            <span
              className={cn(
                'mt-1 text-[0.625rem] font-semibold tracking-[0.28em] uppercase',
                tone === 'dark' ? 'text-white/75' : 'text-muted-foreground',
              )}
            >
              {BRAND.tagline}
            </span>
          )}
        </span>
      )}
    </span>
  )

  if (!href) return content
  return (
    <Link
      href={href}
      aria-label={`${BRAND.name} home`}
      className="focus-visible:outline-ring rounded-md focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      {content}
    </Link>
  )
}
