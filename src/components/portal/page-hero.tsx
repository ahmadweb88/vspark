export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <section className="bg-brand-dark relative overflow-hidden rounded-2xl p-6 text-white md:p-8">
      {/* The page's one special effect: a soft accent glow in the corner. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-[radial-gradient(circle,var(--primary)_0%,transparent_70%)] opacity-15"
      />
      <p className="text-primary relative text-xs font-semibold tracking-[0.14em] uppercase">
        {eyebrow}
      </p>
      <h1 className="font-heading relative mt-2 text-2xl font-bold md:text-3xl">
        {title}
      </h1>
      <p className="relative mt-2 max-w-2xl text-white/75">{description}</p>
    </section>
  )
}
