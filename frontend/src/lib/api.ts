import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';

interface APIErrorResponse {
  message: string;
  statusCode?: number;
}

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<APIErrorResponse>) => {
    if (error.response?.status === 401) {
      // Clear auth token
      Cookies.remove('token');
      // Only redirect if we're in the browser
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }

    // Transform error to our custom APIError
    const message = 
      (error.response?.data && 'message' in error.response.data 
        ? error.response.data.message 
        : null) || 
      error.message || 
      'An unknown error occurred';
    const statusCode = error.response?.status;
    const code = error.code;

    return Promise.reject(new APIError(message, statusCode, code));
  }
);

// Add request interceptor to attach auth token
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types based on backend API
export interface Movie {
  id: number;
  name: string;
  description: string;
  duration: number;
  poster: string;
  rating: number;
  release_date: string;
}

export interface Schedule {
  id: number;
  date: string;
  start_time: string;
  theatre_name: string;
  available: boolean;
  end_time?: string;
  movie_id?: number;
}

export interface Booking {
  id: number;
  scheduleId: number;
  movie_name: string;
  movie_poster: string;
  date: string;
  total_amount: number;
  payment_method: string;
  status: string;
  username: string;
  seats: { row: string; number: string }[];
}

export interface ReceiptItem {
  id: number;
  price: number;
  discount: number;
  amount: number;
  receipt_id: number;
  ticket_id: number;
  ticketId: number;
  row: string;
  column: string;
  zone: string;
}

export interface Receipt {
  id: number;
  payment_method: 'CASH' | 'CARD';
  date: string;
  movie_name: string;
  movie_poster: string;
  items: ReceiptItem[];
}

export interface Theatre {
  id: number;
  name: string;
  zones?: Zone[];  // Optional for when we need the relationship
}

export interface Zone {
  id: number;
  name: string;
  theatre_id: number;
  seats?: Seat[];  // Optional for when we need the relationship
}

export interface Seat {
  seat_id: number;
  row: number;
  column: number;
  zone_name: string;
  is_spacer: boolean;
  available: boolean;
  color: string;
  is_reserve: boolean;
  zone_id: number;
}

export interface TempTicket {
  ticketId: number;
  seatId: number;
  row: number;
}

export interface Ticket {
  ticketId: number;
  movie_name: string;
  movie_poster: string;
  row: number;
  column: number;
  zone: string;
  status: 'available' | 'selected' | 'booked';
  confirmed: boolean;
  schedule_id: number;
  seat_id: number;
  user_id: number;
  qr?: string;
}

export interface AuthResponse {
  token: string;
}

export interface User {
  id: number;
  username: string;
}

export interface RegisterResponse {
  msg: string;
}

export interface ScheduleResponse {
  movie: {
    name: string;
    poster: string;
    duration: number;
  };
  schedules: {
    [date: string]: {
      [theatre: string]: {
        [time: string]: any;
      };
    };
  };
}

// API functions
export const moviesApi = {
  getAll: () => api.get<Movie[]>('/movies').then(res => res.data),
  getById: (id: number) => api.get<Movie>(`/movies/${id}`).then(res => res.data),
  getSchedules: (movieId: number) => api.get<ScheduleResponse>(`/schedule?movieId=${movieId}`).then(res => res.data),
};

export const bookingsApi = {
  create: (data: { scheduleId: number; seats: string[] }) => 
    api.post<Booking>('/bookings', data).then(res => res.data),
  getMyBookings: () => api.get<Booking[]>('/bookings').then(res => res.data),
  getById: (id: number) => api.get<Booking>(`/bookings/${id}`).then(res => res.data),
};

export const receiptsApi = {
  getAll: () => api.get<Receipt[]>('/receipt').then(res => res.data),
  getById: (id: number) => api.get<Receipt>(`/receipt/item?receiptId=${id}`).then(res => res.data),
};

export const ticketsApi = {
  getAll: () => api.get<Ticket[]>('/ticket').then(res => res.data),
  getById: (id: number) => api.get<{info: Ticket[], qr: string}>(`/ticket/item?ticketId=${id}`).then(res => res.data),
};

export const seatsApi = {
  getSeats: (scheduleId: number) => 
    api.get<Record<string, Record<string, Record<string, Seat>>>>(`/seat?scheduleId=${scheduleId}`).then(res => res.data),
  validateSeat: (seatId: number, scheduleId: number) => 
    api.get<{ available: number }>(`/seat/valid?seatId=${seatId}&scheduleId=${scheduleId}`).then(res => res.data),
  selectSeat: (seatId: number, scheduleId: number) => 
    api.post<TempTicket>(`/seat/select`, { seatId, scheduleId }).then(res => res.data),
  unselectSeat: (ticketId: number) => 
    api.post(`/seat/unselect`, { ticketId }).then(res => res.data),
  getTempTickets: (scheduleId: number) => 
    api.get<TempTicket[]>(`/seat/tickets?scheduleId=${scheduleId}`).then(res => res.data),
  book: (ticketIds: number[]) => 
    api.post('/seat/book', { ticketIds }).then(res => res.data),
};

export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth', { user: username, password });
    console.log('Auth API response:', response.data); // Debug log
    return response.data;
  },
  register: (username: string, password: string) =>
    api.post<RegisterResponse>('/user', { user: username, password }).then(res => res.data),
};

export const movieApi = {
  getAll: () => api.get<Movie[]>('/movie').then(res => res.data),
  getById: (id: number) => api.get<Movie>(`/movie/${id}`).then(res => res.data),
  create: (movie: Omit<Movie, 'id'>) => api.post<Movie>('/movie', movie).then(res => res.data),
  update: (id: number, movie: Movie) => api.put<Movie>(`/movie/${id}`, movie).then(res => res.data),
  delete: (id: number) => api.delete(`/movie/${id}`).then(res => res.data),
};

export const bookingApi = {
  getAll: () => api.get<Booking[]>('/bookings').then(res => res.data),
  getAllAdmin: () => api.get<Booking[]>('/bookings/all').then(res => res.data),
  getById: (id: number) => api.get<Booking>(`/bookings/${id}`).then(res => res.data),
  create: (booking: Omit<Booking, 'id'>) => api.post<Booking>('/bookings', booking).then(res => res.data),
  update: (id: number, booking: Booking) => api.put<Booking>(`/bookings/${id}`, booking).then(res => res.data),
  delete: (id: number) => api.delete(`/bookings/${id}`).then(res => res.data),
};