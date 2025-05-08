'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'

export function Navigation() {
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const hasToken = !!Cookies.get('token')
    setIsAuthenticated(hasToken)
  }, [])

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  const handleLogout = () => {
    Cookies.remove('token')
    setIsAuthenticated(false)
    window.location.href = '/'
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link 
              href="/" 
              className={`flex items-center px-2 text-lg font-semibold ${
                isActive('/') ? 'text-blue-600' : 'text-gray-900'
              }`}
            >
              Movie Theater
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/movies"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  isActive('/movies')
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Movies
              </Link>
              {isAuthenticated && (
                <Link
                  href="/bookings"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                    isActive('/bookings')
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  My Bookings
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}