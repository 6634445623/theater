import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types based on backend API
export interface Movie {
  id: number;
  title: string;
  description: string;
  duration: number;
  imageUrl: string;
  rating: string;
}

export interface Schedule {
  id: number;
  movieId: number;
  showtime: string;
  price: number;
}

export interface Booking {
  id: number;
  scheduleId: number;
  seats: string[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}

// API functions
export const moviesApi = {
  getAll: () => api.get<Movie[]>('/movies').then(res => res.data),
  getById: (id: number) => api.get<Movie>(`/movies/${id}`).then(res => res.data),
  getSchedules: (movieId: number) => api.get<Schedule[]>(`/movies/${movieId}/schedules`).then(res => res.data),
};

export const bookingsApi = {
  create: (data: { scheduleId: number; seats: string[] }) => 
    api.post<Booking>('/bookings', data).then(res => res.data),
  getMyBookings: () => api.get<Booking[]>('/bookings').then(res => res.data),
  getById: (id: number) => api.get<Booking>(`/bookings/${id}`).then(res => res.data),
};