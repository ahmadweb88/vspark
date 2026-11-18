export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <h2 className="text-muted-foreground shrink-0 text-xs font-semibold tracking-[0.14em] uppercase">
        {children}
      </h2>
      <span aria-hidden="true" className="bg-border h-px flex-1" />
    </div>
  )
}
