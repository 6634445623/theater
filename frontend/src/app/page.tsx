import { moviesApi } from '@/lib/api'
import { MovieCard } from '@/components/ui/MovieCard'
import Link from 'next/link'

export default async function Home() {
  const allMovies = await moviesApi.getAll()
  // Get first 3 movies as featured
  const featuredMovies = allMovies.slice(0, 3)

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Welcome to Movie Theater</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Experience the latest blockbusters in supreme comfort. Book your tickets now and secure the best seats in the house.
        </p>
        <div>
          <Link
            href="/movies"
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View All Movies
          </Link>
        </div>
      </section>
      
      {/* Featured Movies */}
      <section className="space-y-8">
        <div className="flex justify-between items-baseline">
          <h2 className="text-2xl font-semibold">Featured Movies</h2>
          <Link href="/movies" className="text-blue-600 hover:text-blue-700">
            View all →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Additional Info */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Online Booking</h3>
          <p className="text-gray-600">Quick and easy ticket booking from anywhere</p>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Seat Selection</h3>
          <p className="text-gray-600">Choose your preferred seats in advance</p>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Digital Tickets</h3>
          <p className="text-gray-600">Get your tickets directly on your device</p>
        </div>
      </section>
    </div>
  )
}
