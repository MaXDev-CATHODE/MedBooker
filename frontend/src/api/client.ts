import axios from 'axios';

// Base API client — uses environment variable or defaults to localhost
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
});

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  photo: string | null;
  isOwner: boolean;
  color: string;
  bio: string;
}

export interface Slot {
  id: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  startTime: string;
  available: boolean;
}

export interface Patient {
  firstName: string;
  lastName: string;
  email: string;
}

export interface WaitlistEntry {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  newsletterConsent: boolean;
}

// ── API functions ──────────────────────────────────────────────────────────────

/** Fetch all team doctors (excluding clinic owner) */
export const getDoctors = () => api.get<Doctor[]>('/api/doctors').then(r => r.data);

/** Fetch all available slots for team doctors */
export const getAllSlots = () => api.get<Slot[]>('/api/slots').then(r => r.data);

/** Fetch slots for a specific doctor */
export const getDoctorSlots = (doctorId: string) =>
  api.get<Slot[]>(`/api/slots/${doctorId}`).then(r => r.data);

/** Send OTP verification code to phone number */
export const sendOTP = (phone: string) =>
  api.post<{ success: boolean; message: string; demoCode: string }>('/api/otp/send', { phone }).then(r => r.data);

/** Verify OTP code and retrieve session token */
export const verifyOTP = (phone: string, code: string) =>
  api.post<{ success: boolean; token: string; patient: Patient }>('/api/otp/verify', { phone, code }).then(r => r.data);

/** Fetch clinic owner's private calendar (requires valid session token) */
export const getOwnerCalendar = (token: string) =>
  api.get<{ patient: Patient; slots: Slot[] }>(`/api/calendar/owner?token=${token}`).then(r => r.data);

/** Create a pending reservation with TTL */
export const createReservation = (data: {
  slotId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  patient: { firstName: string; lastName: string; email: string; phone?: string };
}) => api.post<{ success: boolean; reservationId: string; paymentUrl: string }>('/api/reservations/create', data).then(r => r.data);

/** Confirm reservation — backend handles race condition detection automatically */
export const confirmReservation = (reservationId: string): Promise<{ success: boolean; slotTaken?: boolean }> =>
  api.post<{ success: boolean; slotTaken?: boolean }>('/api/reservations/confirm', { reservationId }).then(r => r.data);

/** Fetch reservation details by ID */
export const getReservation = (id: string) =>
  api.get<any>(`/api/reservations/${id}`).then(r => r.data);

/** Join the clinic owner's waitlist */
export const joinWaitlistOwner = (data: WaitlistEntry) =>
  api.post<{ success: boolean; message: string }>('/api/waitlist/owner', data).then(r => r.data);

/** Join the team doctors' waitlist */
export const joinWaitlistDoctors = (data: WaitlistEntry) =>
  api.post<{ success: boolean; message: string }>('/api/waitlist/doctors', data).then(r => r.data);

export default api;
