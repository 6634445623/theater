import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { moviesApi } from '@/lib/api'
import { BookingForm } from '@/components/ui/BookingForm'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const movie = await moviesApi.getById(parseInt(params.id))
    return {
      title: `${movie.title} - Movie Theater`,
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
  try {
    const movie = await moviesApi.getById(parseInt(params.id))
    const schedules = await moviesApi.getSchedules(parseInt(params.id))

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative aspect-[2/3] w-full">
            <Image
              src={movie.imageUrl}
              alt={movie.title}
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{movie.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{movie.duration} mins</span>
              <span className="px-2 py-1 bg-gray-100 rounded">{movie.rating}</span>
            </div>
            <p className="text-gray-600">{movie.description}</p>
            
            <BookingForm schedules={schedules} />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}