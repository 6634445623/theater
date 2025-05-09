import { LoadingState } from '@/components/ui/LoadingState'

export default function BookingsLoading() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Bookings</h1>
      <LoadingState />
    </div>
  )
}
