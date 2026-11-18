import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * One real count from the database. With `href` the whole card links to its list page
 * and lifts on hover; without it, the card stays still. `value` is null when the count
 * couldn't be read, so the card never shows a made-up number.
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon
  label: string
  value: number | null
  href?: string
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-4">
        <span className="bg-muted text-brand-dark grid size-12 shrink-0 place-items-center rounded-xl">
          <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span className="font-heading text-brand-dark text-4xl font-bold tabular-nums">
          {value ?? '—'}
        </span>
      </div>
      <p className="text-muted-foreground mt-6">
        {label}
        {value === null && <span className="sr-only"> (not available)</span>}
      </p>
    </>
  )
  const cardClass = 'bg-card block min-w-0 rounded-2xl border p-6'

  if (!href) return <div className={cardClass}>{body}</div>
  return (
    <Link
      href={href}
      className={cn(
        cardClass,
        'hover:shadow-raised focus-visible:outline-ring transition-[transform,box-shadow] duration-150 hover:-translate-y-1 focus-visible:outline-2',
      )}
    >
      {body}
    </Link>
  )
}
