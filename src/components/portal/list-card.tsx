import { Children } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowRight, type LucideIcon } from 'lucide-react'

type EmptyState = {
  title: string
  description: string
  action?: React.ReactNode
}

/** A white card with a header row and either rows (ListCardRow) or its empty state. */
export function ListCard({
  icon: Icon,
  title,
  href,
  empty,
  children,
}: {
  icon: LucideIcon
  title: string
  href?: string
  empty: EmptyState
  children?: React.ReactNode
}) {
  const hasRows = Children.count(children) > 0

  return (
    <section className="bg-card min-w-0 rounded-2xl border">
      <div className="flex items-center gap-3 border-b px-5 py-3">
        <span className="bg-brand-dark grid size-9 shrink-0 place-items-center rounded-full text-white">
          <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <h3 className="font-heading min-w-0 flex-1 truncate font-semibold">
          {title}
        </h3>
        {href && hasRows && (
          <Link
            href={href}
            className="text-brand-link inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline"
          >
            View all
            <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
          </Link>
        )}
      </div>

      {hasRows ? (
        <ul className="divide-y">{children}</ul>
      ) : (
        <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
          <Icon
            className="text-muted-foreground size-6"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <p className="font-semibold">{empty.title}</p>
          <p className="text-muted-foreground max-w-xs text-sm">
            {empty.description}
          </p>
          {empty.action && <div className="mt-2">{empty.action}</div>}
        </div>
      )}
    </section>
  )
}

/** One row: initial avatar, name, sub-line and date on the right. */
export function ListCardRow({
  name,
  subtitle,
  date,
}: {
  name: string
  subtitle?: string
  date?: Date | string
}) {
  return (
    <li className="flex items-center gap-3 px-5 py-3">
      <span className="bg-muted text-brand-dark grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold">
        {name.charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold" title={name}>
          {name}
        </p>
        {subtitle && (
          <p className="text-muted-foreground truncate text-sm">{subtitle}</p>
        )}
      </div>
      {date && (
        <time
          dateTime={new Date(date).toISOString()}
          className="text-muted-foreground shrink-0 text-sm tabular-nums"
        >
          {format(new Date(date), 'd MMM')}
        </time>
      )}
    </li>
  )
}
