'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { bookingApi, movieApi } from '@/lib/api'
import { getToken } from '@/lib/auth'
import { jwtDecode } from 'jwt-decode'

interface User {
  is_admin: boolean
}

interface Statistics {
  totalMovies: number
  totalBookings: number
  totalRevenue: number
  averageBookingValue: number
  topMovies: {
    name: string
    bookings: number
    revenue: number
  }[]
  recentBookings: {
    movie_name: string
    total_amount: number
    date: string
  }[]
}

export default function AdminStatisticsPage() {
  const router = useRouter()
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push('/auth/login')
      return
    }

    try {
      const decoded = jwtDecode<User>(token)
      if (!decoded.is_admin) {
        router.push('/')
        return
      }
    } catch (error) {
      console.error('Error decoding token:', error)
      router.push('/auth/login')
      return
    }

    loadStatistics()
  }, [router])

  const loadStatistics = async () => {
    try {
      const [movies, bookings] = await Promise.all([
        movieApi.getAll(),
        bookingApi.getAllAdmin()
      ])

      // Calculate statistics
      const totalRevenue = bookings.reduce((sum, booking) => sum + booking.total_amount, 0)
      const movieStats = new Map<string, { bookings: number; revenue: number }>()

      bookings.forEach(booking => {
        const stats = movieStats.get(booking.movie_name) || { bookings: 0, revenue: 0 }
        stats.bookings++
        stats.revenue += booking.total_amount
        movieStats.set(booking.movie_name, stats)
      })

      const topMovies = Array.from(movieStats.entries())
        .map(([name, stats]) => ({
          name,
          bookings: stats.bookings,
          revenue: stats.revenue
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      const recentBookings = bookings
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)

      setStatistics({
        totalMovies: movies.length,
        totalBookings: bookings.length,
        totalRevenue,
        averageBookingValue: bookings.length ? totalRevenue / bookings.length : 0,
        topMovies,
        recentBookings
      })
    } catch (err) {
      setError('Failed to load statistics')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="p-4">Loading...</div>
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  if (!statistics) {
    return null
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Statistics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Movies</h3>
          <p className="text-2xl font-bold">{statistics.totalMovies}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Bookings</h3>
          <p className="text-2xl font-bold">{statistics.totalBookings}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Revenue</h3>
          <p className="text-2xl font-bold">${statistics.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Average Booking Value</h3>
          <p className="text-2xl font-bold">${statistics.averageBookingValue.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Top Movies by Revenue</h2>
          <div className="space-y-4">
            {statistics.topMovies.map((movie, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{movie.name}</p>
                  <p className="text-sm text-gray-500">{movie.bookings} bookings</p>
                </div>
                <p className="font-semibold">${movie.revenue.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
          <div className="space-y-4">
            {statistics.recentBookings.map((booking, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{booking.movie_name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(booking.date).toLocaleDateString()}
                  </p>
                </div>
                <p className="font-semibold">${booking.total_amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 