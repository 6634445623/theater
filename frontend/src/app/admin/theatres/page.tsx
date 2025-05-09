'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getToken } from '@/lib/auth'
import { jwtDecode } from 'jwt-decode'
import { theatreApi, Theatre } from '@/lib/api'

interface User {
  is_admin: boolean
}

export default function AdminTheatresPage() {
  const router = useRouter()
  const [theatres, setTheatres] = useState<Theatre[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingTheatre, setEditingTheatre] = useState<Theatre | null>(null)

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

    loadData()
  }, [router])

  const loadData = async () => {
    try {
      const theatresData = await theatreApi.getAll()
      setTheatres(theatresData)
    } catch (err) {
      setError('Failed to load theatres')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (theatre: Theatre) => {
    setEditingTheatre(theatre)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this theatre? This will also delete all associated zones and seats.')) return

    try {
      await theatreApi.delete(id)
      setTheatres(theatres.filter(theatre => theatre.id !== id))
    } catch (err) {
      setError('Failed to delete theatre')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingTheatre) return

    try {
      if (editingTheatre.id) {
        const updatedTheatre = await theatreApi.update(editingTheatre.id, editingTheatre)
        setTheatres(theatres.map(theatre => 
          theatre.id === editingTheatre.id ? updatedTheatre : theatre
        ))
      } else {
        const newTheatre = await theatreApi.create({
          name: editingTheatre.name
        })
        setTheatres([...theatres, newTheatre])
      }
      setEditingTheatre(null)
    } catch (err) {
      setError('Failed to save theatre')
    }
  }

  if (isLoading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Theatres</h1>
        <button
          onClick={() => setEditingTheatre({
            id: 0,
            name: ''
          })}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Theatre
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {editingTheatre && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingTheatre.id ? 'Edit Theatre' : 'Add New Theatre'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editingTheatre.name}
                  onChange={(e) => setEditingTheatre({ ...editingTheatre, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingTheatre(null)}
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

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {theatres.map((theatre) => (
            <li key={theatre.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {theatre.name}
                    </h3>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(theatre)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(theatre.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 