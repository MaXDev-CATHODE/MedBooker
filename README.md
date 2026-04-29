# MedBooker — Aesthetic Clinic Booking System

> A production-grade booking system prototype for aesthetic medicine clinics.  
> Built with React, TypeScript, Node.js, and real-time SSE — fully functional demo with mocked integrations.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4.2-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Overview

MedBooker is a complete appointment booking system designed for aesthetic medicine clinics. It handles three distinct patient flows, payment processing with race condition protection, SMS-OTP verification, and real-time event monitoring — all without any external API keys.

**Every integration is mocked** (Tpay, SMSAPI, Calendly, MailerLite), making this a fully self-contained, deployable demo.

### Key Features

| Feature | Implementation |
|---------|---------------|
| **3 Patient Flows** | New Patient, VIP Owner Calendar (OTP-gated), Team Patient |
| **Race Condition Protection** | Async mutex (`withConfirmLock`) prevents double-booking |
| **TTL Reservations** | Pending bookings auto-expire after 90s if unpaid |
| **SMS-OTP Verification** | 6-digit code with rate limiting (3 attempts, 10min expiry) |
| **Single-Use Session Tokens** | UUID v4 tokens (30min TTL) protect private calendars |
| **Real-Time Demo Panel** | Server-Sent Events (SSE) stream all backend activity live |
| **Waitlist Broadcasting** | Simultaneous SMS + email notification on cancellation |
| **Interactive Architecture** | Click-to-explore system diagram with tech stack details |
| **Exit Intent Popup** | Waitlist capture triggered by cursor leaving viewport |

---

## Tech Stack

### Frontend
- **React 19** + TypeScript 6.0
- **Tailwind CSS 4.2** with custom design tokens
- **Vite 8** for development and build
- **React Router v7** for client-side routing
- **Axios** for API communication

### Backend
- **Node.js** + Express
- **UUID v4** for token and ID generation
- **Server-Sent Events** for real-time demo panel
- **In-memory mutex** for race condition handling
- **JSON file storage** (simulated database)

### Mock Integrations
- **Tpay** — Payment gateway (redirect flow + webhook simulation)
- **SMSAPI.pl** — SMS delivery (OTP codes, confirmations, broadcasts)
- **Calendly** — Scheduling API (slot management, invitee creation)
- **MailerLite** — Email marketing (waitlist segments, confirmation emails)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React SPA)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ NewPatient│  │OwnerPat. │  │ TeamPat. │  │ArchPage │ │
│  │ (public)  │  │ (OTP)    │  │ (public) │  │(diagram)│ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────────┘ │
│       │              │              │                    │
│       └──────────────┼──────────────┘                    │
│                      ▼                                   │
│              ┌───────────────┐                           │
│              │  API Client   │──── SSE ──→ DemoPanel     │
│              └───────┬───────┘                           │
└──────────────────────┼───────────────────────────────────┘
                       │ HTTP
┌──────────────────────┼───────────────────────────────────┐
│                 BACKEND (Express)                         │
│  ┌────────┐  ┌────────┐  ┌─────────┐  ┌──────────────┐  │
│  │OTP Flow│  │Reserv. │  │Waitlist │  │ SSE Events   │  │
│  │ +token │  │ +mutex │  │ +mailer │  │ (broadcast)  │  │
│  └────┬───┘  └───┬────┘  └────┬────┘  └──────────────┘  │
│       │          │            │                           │
│  ┌────┴──────────┴────────────┴────┐                     │
│  │     Mock Services Layer         │                     │
│  │  SMS · Tpay · Calendly · Mail   │                     │
│  └─────────────────────────────────┘                     │
│       │                                                  │
│  ┌────┴─────────────────┐                                │
│  │   JSON File Storage  │                                │
│  │ doctors · patients   │                                │
│  │ reservations · wait  │                                │
│  └──────────────────────┘                                │
└──────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/medbooker.git
cd medbooker

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running Locally

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server starts on http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App opens on http://localhost:5173
```

---

## Demo Walkthrough

### Flow 1 — New Patient
1. Click **"Nowy Pacjent – Pierwsza Wizyta"**
2. Filter by doctor, select a slot
3. Fill in patient details → redirect to mock Tpay
4. Watch the **60-second TTL countdown**
5. Pay → confirmation page + SMS notification

### Flow 2 — VIP Owner Calendar (SMS-OTP)
1. Click **"Prywatny Kalendarz Dr Nowak"**
2. Enter a test phone number (see below)
3. Enter the 6-digit OTP code (shown in demo mode)
4. Browse the owner's private calendar
5. Book a slot with pre-filled patient data

### Flow 3 — Team Patient
1. Click **"Kontynuacja Leczenia"**
2. Select your doctor from the card grid
3. Pick a slot and complete booking

### Test Phone Numbers

These numbers are pre-registered in the demo patient database:

| Phone | First Name | Last Name |
|-------|-----------|-----------|
| +48600100200 | Anna | Kowalska |
| +48601200300 | Maria | Nowak |
| +48602300400 | Katarzyna | Wiśniewska |
| +48603400500 | Joanna | Zielińska |
| +48604500600 | Magdalena | Wójcik |

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/doctors` | List team doctors (excluding owner) |
| `GET` | `/api/slots` | Available slots for team doctors |
| `GET` | `/api/slots/:doctorId` | Slots for a specific doctor |
| `POST` | `/api/otp/send` | Send OTP code via SMS |
| `POST` | `/api/otp/verify` | Verify OTP and get session token |
| `GET` | `/api/calendar/owner?token=` | Owner's private calendar (requires token) |
| `POST` | `/api/reservations/create` | Create pending reservation (TTL: 90s) |
| `POST` | `/api/reservations/confirm` | Confirm reservation (mutex-protected) |
| `GET` | `/api/reservations/:id` | Get reservation details |
| `POST` | `/api/waitlist/owner` | Join owner's waitlist |
| `POST` | `/api/waitlist/doctors` | Join team doctors' waitlist |
| `GET` | `/api/demo/events` | SSE stream for demo panel |
| `GET` | `/api/health` | Health check |

---

## Project Structure

```
medbooker/
├── backend/
│   ├── server.js              # Express API + SSE + mutex logic
│   ├── utils/
│   │   └── db.js              # JSON file storage utility
│   ├── mock/
│   │   ├── sms.js             # Mock SMSAPI.pl
│   │   └── mailerlite.js      # Mock MailerLite
│   ├── scripts/
│   │   └── generateSlots.js   # Slot generator script
│   └── data/
│       ├── doctors.json       # Doctor profiles
│       ├── patients.json      # Test patient database
│       ├── reservations.json  # Booking records
│       └── waitlist_owner.json
├── frontend/
│   ├── src/
│   │   ├── api/client.ts      # Typed API client
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── NewPatient.tsx
│   │   │   ├── OwnerPatient.tsx
│   │   │   ├── TeamPatient.tsx
│   │   │   ├── Architecture.tsx
│   │   │   ├── MockTpay.tsx
│   │   │   ├── PaymentSuccess.tsx
│   │   │   └── PaymentError.tsx
│   │   ├── components/
│   │   │   ├── SlotCalendar.tsx
│   │   │   ├── ReservationModal.tsx
│   │   │   ├── DemoPanel.tsx
│   │   │   ├── WaitlistForm.tsx
│   │   │   ├── ExitPopup.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── OtpInput.tsx
│   │   │   └── ...
│   │   └── context/
│   │       └── ToastContext.tsx
│   └── index.html
└── README.md
```

---

## Deployment

### Frontend — GitHub Pages

The frontend is deployed automatically via GitHub Actions on push to `main`.

### Backend — Render.com

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repo
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && node server.js`
5. Add environment variable: `CORS_ORIGIN=https://your-username.github.io`

> **Note:** Render's free tier has ephemeral storage. The JSON "database" resets on each deploy, which is fine for a demo.

---

## Technical Highlights

### Race Condition Protection
The `withConfirmLock()` mutex prevents the classic TOCTOU (Time-of-Check-Time-of-Use) vulnerability. Even though Node.js is single-threaded, async I/O allows two `/confirm` requests to interleave between `db.readAll()` and `db.updateById()`. The mutex serializes these operations.

### TTL Reservation System
When a patient selects a slot, a "pending" reservation is created with a 90-second TTL. This blocks the slot for other users while the patient completes payment. If payment isn't completed in time, the reservation expires and the slot becomes available again — zero manual intervention needed.

### Single-Use Session Tokens
After OTP verification, the backend generates a UUID v4 token that:
- Expires after 30 minutes
- Can only be used once (`used: false → true`)
- Is never exposed in URLs (stored in React state)

This prevents link sharing and unauthorized access to the owner's private calendar.

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with care as a portfolio demonstration of a production-grade booking system.
</p>
