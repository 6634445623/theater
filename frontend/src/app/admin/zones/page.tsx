'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getToken } from '@/lib/auth'
import { jwtDecode } from 'jwt-decode'
import { zoneApi, theatreApi, Zone, Theatre } from '@/lib/api'

interface User {
  is_admin: boolean
}

export default function AdminZonesPage() {
  const router = useRouter()
  const [zones, setZones] = useState<Zone[]>([])
  const [theatres, setTheatres] = useState<Theatre[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingZone, setEditingZone] = useState<Zone | null>(null)

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
      const [zonesData, theatresData] = await Promise.all([
        zoneApi.getAll(),
        theatreApi.getAll()
      ])
      setZones(zonesData)
      setTheatres(theatresData)
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (zone: Zone) => {
    setEditingZone(zone)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this zone?')) return

    try {
      await zoneApi.delete(id)
      setZones(zones.filter(zone => zone.id !== id))
    } catch (err) {
      setError('Failed to delete zone')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingZone) return

    try {
      if (editingZone.id) {
        const updatedZone = await zoneApi.update(editingZone.id, {
          name: editingZone.name,
          price: editingZone.price,
          description: editingZone.description,
          theatre_id: editingZone.theatre_id
        })
        setZones(zones.map(zone => 
          zone.id === editingZone.id ? updatedZone : zone
        ))
      } else {
        const newZone = await zoneApi.create({
          name: editingZone.name,
          price: editingZone.price,
          description: editingZone.description,
          theatre_id: editingZone.theatre_id
        })
        setZones([...zones, newZone])
      }
      setEditingZone(null)
    } catch (err) {
      setError('Failed to save zone')
    }
  }

  if (isLoading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Zones</h1>
        <button
          onClick={() => setEditingZone({
            id: 0,
            name: '',
            price: 0,
            description: '',
            theatre_id: theatres[0]?.id || 0,
            theatre_name: ''
          })}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Zone
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {editingZone && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingZone.id ? 'Edit Zone' : 'Add New Zone'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Theatre</label>
                <select
                  value={editingZone.theatre_id}
                  onChange={(e) => setEditingZone({ ...editingZone, theatre_id: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  {theatres.map(theatre => (
                    <option key={theatre.id} value={theatre.id}>
                      {theatre.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editingZone.name}
                  onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  value={editingZone.price}
                  onChange={(e) => setEditingZone({ ...editingZone, price: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={editingZone.description}
                  onChange={(e) => setEditingZone({ ...editingZone, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingZone(null)}
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
          {zones.map((zone) => (
            <li key={zone.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {zone.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {zone.theatre_name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {zone.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      ${zone.price.toFixed(2)}
                    </p>
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() => handleEdit(zone)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(zone.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
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