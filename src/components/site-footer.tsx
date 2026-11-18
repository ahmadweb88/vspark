import { BRAND, Logo } from '@/components/brand/logo'

export function SiteFooter() {
  return (
    <footer className="bg-brand-dark text-white">
      <div className="container-app flex flex-col gap-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <Logo tone="dark" />
        <p className="text-sm text-white/60">
          © {new Date().getFullYear()} {BRAND.name}
        </p>
      </div>
    </footer>
  )
}
