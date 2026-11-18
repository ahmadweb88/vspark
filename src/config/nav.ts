import { LayoutDashboard, Settings, type LucideIcon } from 'lucide-react'

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
  /** Shown under the page title in the portal top bar. */
  description: string
}

export const portalNav: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Generate captions and manage your posts',
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Email notifications and templates',
  },
]
