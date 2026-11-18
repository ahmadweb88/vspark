'use client'

import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function PasswordInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <Lock
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <Input
        {...props}
        type={show ? 'text' : 'password'}
        className={cn('h-12 pr-12 pl-10 text-base', className)}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="text-muted-foreground hover:text-foreground focus-visible:outline-ring absolute top-0 right-0 grid size-12 place-items-center rounded-md focus-visible:outline-2"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? (
          <EyeOff className="size-4" strokeWidth={1.75} aria-hidden="true" />
        ) : (
          <Eye className="size-4" strokeWidth={1.75} aria-hidden="true" />
        )}
      </button>
    </div>
  )
}
