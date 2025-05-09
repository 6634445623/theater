import { Metadata } from 'next'
import { bookingsApi } from '@/lib/api'
import { requireAuth, getServerToken } from '@/lib/serverAuth'
import Image from 'next/image'
import Link from 'next/link'
import { BookingsClient } from './BookingsClient'

export const metadata: Metadata = {
  title: 'My Bookings - Movie Theater',
  description: 'View your movie ticket bookings and booking history.',
}

export default async function BookingsPage() {
  await requireAuth()
  const token = await getServerToken()

  return <BookingsClient token={token} />
}