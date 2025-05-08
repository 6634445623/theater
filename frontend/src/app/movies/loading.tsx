import { LoadingState } from '@/components/ui/LoadingState'

export default function MoviesLoading() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">All Movies</h1>
      <LoadingState />
    </div>
  )
}