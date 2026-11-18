'use client'

import type { LucideIcon } from 'lucide-react'
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { cn } from '@/lib/utils'

type Props<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  label: string
  description?: string
  /** Lucide icon shown inside the field, on the left. */
  icon?: LucideIcon
  /** Renders a PasswordInput (lock icon and show/hide button). */
  password?: boolean
} & Pick<React.ComponentProps<'input'>, 'type' | 'autoComplete'>

/** A labelled 48px input wired to React Hook Form, with its error under the field. */
export function FormTextField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  icon: Icon,
  password = false,
  type,
  autoComplete,
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const errorId = `${name}-error`
        const inputProps = {
          ...field,
          id: name,
          autoComplete,
          'aria-invalid': fieldState.invalid,
          'aria-describedby': fieldState.invalid ? errorId : undefined,
        }

        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={name}>{label}</FieldLabel>
            {password ? (
              <PasswordInput {...inputProps} />
            ) : (
              <div className="relative">
                {Icon && (
                  <Icon
                    className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                )}
                <Input
                  {...inputProps}
                  type={type}
                  className={cn('h-12 text-base', Icon && 'pl-10')}
                />
              </div>
            )}
            {description && <FieldDescription>{description}</FieldDescription>}
            <FieldError id={errorId} errors={[fieldState.error]} />
          </Field>
        )
      }}
    />
  )
}
