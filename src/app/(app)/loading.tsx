import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="container-app space-y-6 py-12">
      <Skeleton className="h-10 w-64 max-w-full" />
      <Skeleton className="h-5 w-full max-w-2xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  )
}
