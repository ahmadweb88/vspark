import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-36 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="hidden h-40 rounded-2xl sm:block" />
        <Skeleton className="hidden h-40 rounded-2xl lg:block" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  )
}
