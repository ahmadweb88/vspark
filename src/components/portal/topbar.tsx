'use client'

import { usePathname } from 'next/navigation'
import { MobileSidebar } from '@/components/portal/sidebar'
import { UserMenu } from '@/components/user-menu'
import { portalNav } from '@/config/nav'

export function Topbar({
  name,
  email,
  role,
}: {
  name: string
  email: string
  role: string
}) {
  const pathname = usePathname()
  const current = portalNav.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  )

  return (
    <header className="bg-brand-dark sticky top-0 z-30 border-b border-white/10">
      <div className="container-app flex h-16 items-center gap-3">
        <MobileSidebar />
        <div className="min-w-0">
          <p className="font-heading truncate font-semibold text-white">
            {current?.label ?? 'Portal'}
          </p>
          {current && (
            <p className="text-primary truncate text-xs">
              {current.description}
            </p>
          )}
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-3">
          <div className="hidden min-w-0 text-right sm:block">
            <p className="truncate text-sm font-semibold text-white" title={name}>
              {name}
            </p>
            <p className="text-sm text-white/70">{role}</p>
          </div>
          <UserMenu
            name={name}
            email={email}
            triggerClassName="hover:bg-white/10"
            avatarClassName="bg-primary text-brand-dark"
          />
        </div>
      </div>
    </header>
  )
}
