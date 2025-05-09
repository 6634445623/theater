'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { movieApi } from '@/lib/api'
import { getToken } from '@/lib/auth'
import { jwtDecode } from 'jwt-decode'

interface Movie {
  id: number
  name: string
  poster: string
  description: string
  duration: number
  rating: number
  release_date: string
}

interface User {
  is_admin: boolean
}

export default function AdminMoviesPage() {
  const router = useRouter()
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)

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

    loadMovies()
  }, [router])

  const loadMovies = async () => {
    try {
      const data = await movieApi.getAll()
      setMovies(data)
    } catch (err) {
      setError('Failed to load movies')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (movie: Movie) => {
    setEditingMovie(movie)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this movie?')) return

    try {
      await movieApi.delete(id)
      setMovies(movies.filter(movie => movie.id !== id))
    } catch (err) {
      setError('Failed to delete movie')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingMovie) return

    try {
      if (editingMovie.id) {
        await movieApi.update(editingMovie.id, editingMovie)
      } else {
        await movieApi.create(editingMovie)
      }
      await loadMovies()
      setEditingMovie(null)
    } catch (err) {
      setError('Failed to save movie')
    }
  }

  if (isLoading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Movies</h1>
        <button
          onClick={() => setEditingMovie({
            id: 0,
            name: '',
            poster: '',
            description: '',
            duration: 0,
            rating: 0,
            release_date: ''
          })}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Movie
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {editingMovie && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingMovie.id ? 'Edit Movie' : 'Add New Movie'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editingMovie.name}
                  onChange={(e) => setEditingMovie({ ...editingMovie, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Poster URL</label>
                <input
                  type="text"
                  value={editingMovie.poster}
                  onChange={(e) => setEditingMovie({ ...editingMovie, poster: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={editingMovie.description}
                  onChange={(e) => setEditingMovie({ ...editingMovie, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                <input
                  type="number"
                  value={editingMovie.duration}
                  onChange={(e) => setEditingMovie({ ...editingMovie, duration: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={editingMovie.rating}
                  onChange={(e) => setEditingMovie({ ...editingMovie, rating: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Release Date</label>
                <input
                  type="date"
                  value={editingMovie.release_date}
                  onChange={(e) => setEditingMovie({ ...editingMovie, release_date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingMovie(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {movies.map((movie) => (
          <div key={movie.id} className="bg-white rounded-lg shadow overflow-hidden">
            <img
              src={movie.poster}
              alt={movie.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{movie.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{movie.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{movie.duration} min</span>
                <span>Rating: {movie.rating}/10</span>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(movie)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(movie.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 