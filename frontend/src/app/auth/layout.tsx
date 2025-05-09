import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign in - Movie Theater',
  description: 'Sign in to your Movie Theater account to book tickets and manage your bookings.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
