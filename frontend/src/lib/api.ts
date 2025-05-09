import axios from 'axios';
import Cookies from 'js-cookie';

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
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth token
      Cookies.remove('token');
      // Client-side redirect
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
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
  payment_method: 'CASH' | 'CARD';
  status: 'pending' | 'confirmed' | 'cancelled';
  seats: Array<{
    row: string;
    number: string;
  }>;
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

// API functions
export const moviesApi = {
  getAll: () => api.get<Movie[]>('/movies').then(res => res.data),
  getById: (id: number) => api.get<Movie>(`/movies/${id}`).then(res => res.data),
  getSchedules: (movieId: number) => api.get<Schedule[]>(`/schedule?movieId=${movieId}`).then(res => res.data),
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
  getBySchedule: (scheduleId: number) => api.get<Record<string, Record<string, Record<string, Seat>>>>(`/seat?scheduleId=${scheduleId}`).then(res => res.data),
  validateSeat: (seatId: number, scheduleId: number) => 
    api.get<{available: 0 | 1}>(`/seat/valid?seatId=${seatId}&scheduleId=${scheduleId}`)
      .then(res => ({ available: Boolean(res.data.available) })),
  selectSeat: (seatId: number, scheduleId: number) => api.post<{ticketId: number}>('/seat/select', { seatId, scheduleId }).then(res => res.data),
  unselectSeat: (ticketId: number) => api.post<string>('/seat/unselect', { ticketId }).then(res => res.data),
  getTempTickets: (scheduleId: number) => api.get<TempTicket[]>(`/seat/tickets?scheduleId=${scheduleId}`).then(res => res.data),
  book: (ticketIds: number[]) => api.post<string>('/seat/book', { ticketIds }).then(res => res.data),
};

export const authApi = {
  login: (username: string, password: string) => 
    api.post<AuthResponse>('/auth', { username, password }).then(res => res.data),
  register: (username: string, password: string) =>
    api.post<RegisterResponse>('/user', { username, password }).then(res => res.data),
};