import { Check } from 'lucide-react'
import { BRAND, Logo } from '@/components/brand/logo'

// [PLACEHOLDER] Replace the headline with one sentence about what this app does.
const HEADLINE = 'Everything you need, in one place'

// [PLACEHOLDER] Replace with three benefits specific to this app.
const BENEFITS = [
  'Add, edit and track your records in one list',
  'Upload photos and files that stay private to you',
  'Use it on your phone, tablet or desktop',
]

/** The logo's tile repeated as a faint background pattern. */
function MarkPattern() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full text-white opacity-[0.06]"
    >
      <defs>
        <pattern
          id="auth-mark-pattern"
          width="72"
          height="72"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M4 16A12 12 0 0 1 16 4h20v20a12 12 0 0 1-12 12H4z"
            fill="currentColor"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#auth-mark-pattern)" />
    </svg>
  )
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[5fr_7fr]">
      <aside className="bg-brand-dark relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col xl:p-14">
        <MarkPattern />
        <div className="relative">
          <Logo tone="dark" />
        </div>
        <div className="relative my-auto max-w-md space-y-8 py-12">
          <p className="font-heading text-3xl leading-tight font-bold xl:text-4xl">
            {HEADLINE}
          </p>
          <ul className="space-y-4">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex gap-3">
                <Check
                  className="text-primary mt-0.5 size-5 shrink-0"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span className="text-white/85">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/60">
          © {new Date().getFullYear()} {BRAND.name}
        </p>
      </aside>

      <main
        id="main"
        className="flex items-center justify-center px-6 py-12"
      >
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
