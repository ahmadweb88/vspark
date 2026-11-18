'use client'

import { LogOut } from 'lucide-react'
import { signOut } from '@/app/(auth)/actions'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export function UserMenu({
  email,
  name,
  triggerClassName,
  avatarClassName = 'bg-brand-dark text-white',
}: {
  email: string
  name?: string | null
  triggerClassName?: string
  avatarClassName?: string
}) {
  const initials = (name || email)
    .split(/[\s@.]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className={cn('size-11 rounded-full p-0', triggerClassName)}
            aria-label="Open account menu"
          />
        }
      >
        <Avatar className="size-9">
          <AvatarFallback
            className={cn('text-sm font-semibold', avatarClassName)}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <p className="text-foreground truncate font-medium">
              {name || 'Account'}
            </p>
            <p className="text-muted-foreground truncate text-sm" title={email}>
              {email}
            </p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="size-4" strokeWidth={1.75} aria-hidden="true" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
