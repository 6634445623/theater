import Image from 'next/image'
import Link from 'next/link'
import { Movie } from '@/lib/api'

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/movies/${movie.id}`} className="group">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md">
        <div className="relative h-48 w-full">
          <Image
            src={movie.poster}
            alt={movie.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-lg group-hover:text-blue-600">{movie.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{movie.description}</p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{movie.duration} mins</span>
            <span className="px-2 py-1 bg-gray-100 rounded">{movie.rating}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}