import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { moviesApi } from '@/lib/api'
import { BookingForm } from '@/components/ui/BookingForm'
import type { BookingFormProps } from '@/components/ui/BookingForm'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const id = parseInt(resolvedParams.id)
  try {
    const movie = await moviesApi.getById(id)
    return {
      title: `${movie.name} - Movie Theater`,
      description: movie.description,
    }
  } catch (error) {
    return {
      title: 'Movie Not Found - Movie Theater',
      description: 'The requested movie could not be found.',
    }
  }
}

export default async function MoviePage({ params }: { params: { id: string } }) {
  const resolvedParams = await params
  const id = parseInt(resolvedParams.id)
  
  try {
    const [movie, schedulesData] = await Promise.all([
      moviesApi.getById(id),
      moviesApi.getSchedules(id)
    ])

    // Validate that all required fields exist
    if (!movie || !movie.name || !movie.duration || !movie.rating || !movie.release_date) {
      throw new Error('Invalid movie data')
    }

    // Transform schedules array into the required format
    const schedules = schedulesData.reduce((acc, schedule) => {
      const date = schedule.date;
      const theatre = schedule.theatre_name;
      const time = schedule.start_time;
      
      acc[date] = acc[date] || {};
      acc[date][theatre] = acc[date][theatre] || {};
      acc[date][theatre][time] = {
        available: schedule.available,
        scheduleId: schedule.id
      };
      
      return acc;
    }, {} as BookingFormProps['schedules']);

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative aspect-[2/3] w-full">
            <Image
              src={movie.poster || '/placeholder-movie.jpg'}
              alt={movie.name}
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{movie.name}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{movie.duration} mins</span>
              <span className="px-2 py-1 bg-gray-100 rounded">{movie.rating.toFixed(1)}</span>
              <span>{new Date(movie.release_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <p className="text-gray-600">{movie.description}</p>

            <BookingForm schedules={schedules}/>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}