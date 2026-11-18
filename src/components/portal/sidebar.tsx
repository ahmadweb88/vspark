'use client'

import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { signOut } from '@/app/(auth)/actions'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { portalNav } from '@/config/nav'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'portal-sidebar-collapsed'
const CHANGE_EVENT = 'portal-sidebar-change'
let memoryCollapsed = false // keeps the choice for this visit when storage is blocked

function readCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return memoryCollapsed
  }
}

function writeCollapsed(value: boolean) {
  memoryCollapsed = value
  try {
    localStorage.setItem(STORAGE_KEY, value ? '1' : '0')
  } catch {
    // Storage is blocked (private mode, site data off): memoryCollapsed still works.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange)
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

const itemClass =
  'relative flex h-11 items-center gap-3 rounded-md px-3 font-semibold text-white/75 transition-colors duration-150 hover:bg-white/10 hover:text-white'

function SidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav aria-label="Portal" className="flex flex-col gap-1">
      {portalNav.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`)

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            title={collapsed ? label : undefined}
            className={cn(
              itemClass,
              active && 'text-primary hover:text-primary bg-white/10',
              collapsed && 'justify-center px-0',
            )}
          >
            {active && (
              <span
                aria-hidden="true"
                className="bg-primary absolute inset-y-2 left-0 w-0.75 rounded-r-full"
              />
            )}
            <Icon className="size-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span className={cn(collapsed && 'sr-only')}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

function SignOutButton({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => signOut()}
      title={collapsed ? 'Sign out' : undefined}
      className={cn(itemClass, 'w-full', collapsed && 'justify-center px-0')}
    >
      <LogOut className="size-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      <span className={cn(collapsed && 'sr-only')}>Sign out</span>
    </button>
  )
}

/** Desktop sidebar (lg and up). Collapses to icons; the choice is remembered. */
export function Sidebar() {
  const collapsed = useSyncExternalStore(subscribe, readCollapsed, () => false)
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <aside
      className={cn(
        'bg-brand-dark sticky top-0 hidden h-dvh shrink-0 flex-col gap-6 p-3 transition-[width] duration-250 lg:flex',
        collapsed ? 'w-18' : 'w-64',
      )}
    >
      <div
        className={cn(
          'flex h-16 shrink-0 items-center px-2',
          collapsed && 'justify-center px-0',
        )}
      >
        <Logo tone="dark" variant={collapsed ? 'mark' : 'full'} href="/dashboard" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <SidebarNav collapsed={collapsed} />
      </div>

      <div className="flex flex-col gap-1 border-t border-white/10 pt-3">
        <button
          type="button"
          onClick={() => writeCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : undefined}
          className={cn(itemClass, 'w-full', collapsed && 'justify-center px-0')}
        >
          <ToggleIcon className="size-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
          {!collapsed && <span>Collapse</span>}
        </button>
        <SignOutButton collapsed={collapsed} />
      </div>
    </aside>
  )
}

/** Below lg: a menu button in the top bar opens the same navigation in a Sheet. */
export function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Open menu"
          />
        }
      >
        <Menu className="size-5" strokeWidth={1.75} aria-hidden="true" />
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="bg-brand-dark w-72 gap-6 border-none p-3 text-white"
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <div className="flex h-16 shrink-0 items-center justify-between px-2">
          <Logo tone="dark" href="/dashboard" />
          <SheetClose
            render={
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 hover:text-white"
                aria-label="Close menu"
              />
            }
          >
            <X className="size-5" strokeWidth={1.75} aria-hidden="true" />
          </SheetClose>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </div>
        <div className="border-t border-white/10 pt-3">
          <SignOutButton />
        </div>
      </SheetContent>
    </Sheet>
  )
}
