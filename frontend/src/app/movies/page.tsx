import { Metadata } from 'next'
import { moviesApi } from '@/lib/api'
import { MovieCard } from '@/components/ui/MovieCard'

export const metadata: Metadata = {
  title: 'All Movies - Movie Theater',
  description: 'Browse and book tickets for the latest movies showing at Movie Theater.',
}

export default async function MoviesPage() {
  const movies = await moviesApi.getAll()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">All Movies</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  )
}