import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { moviesApi, ScheduleResponse } from '@/lib/api';
import { BookingForm } from '@/components/ui/BookingForm';
import type { BookingFormProps } from '@/components/ui/BookingForm';

// Corrected type definition to reflect async param behavior in Next.js 15
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);

  try {
    const movie = await moviesApi.getById(id);
    return {
      title: `${movie.name} - Movie Theater`,
      description: movie.description,
    };
  } catch (error) {
    console.error('Error in generateMetadata:', error);
    return {
      title: 'Movie Not Found - Movie Theater',
      description: 'The requested movie could not be found.',
    };
  }
}

// Fix: Make sure `params` is typed as a Promise and awaited
export default async function MoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);

  try {
    console.log('Fetching movie data for ID:', id);
    const [movie, schedulesData] = await Promise.all([
      moviesApi.getById(id),
      moviesApi.getSchedules(id),
    ]);

    console.log('Received movie data:', movie);
    console.log('Received schedules data:', schedulesData);

    // Validate required fields
    if (!movie || !movie.name || !movie.duration) {
      console.error('Invalid movie data:', movie);
      throw new Error('Invalid movie data');
    }

    // Transform the schedules into BookingFormProps format
    const schedules = Object.entries(schedulesData.schedules).reduce(
      (acc, [date, theatres]) => {
        acc[date] = {};

        Object.entries(theatres).forEach(([theatre, times]) => {
          acc[date][theatre] = {};

          Object.entries(times).forEach(([time, details]) => {
            acc[date][theatre][time] = {
              available: details.available,
              scheduleId: details.scheduleId,
            };
          });
        });

        return acc;
      },
      {} as BookingFormProps['schedules']
    );

    console.log('Transformed schedules:', schedules);

    return (
      <div className="container mx-auto px-4 py-8">
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
              <span className="px-2 py-1 bg-gray-100 rounded">
                {(movie.rating || 0).toFixed(1)}
              </span>
              <span>
                {movie.release_date
                  ? new Date(movie.release_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Coming Soon'}
              </span>
            </div>
            <p className="text-gray-600">{movie.description}</p>
            <BookingForm schedules={schedules} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in MoviePage:', error);
    notFound();
  }
}
