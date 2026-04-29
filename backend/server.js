/**
 * MedBooker — Demo Backend API
 * Mock server simulating all external integrations (Calendly, Tpay, SMSAPI, MailerLite).
 * No real API keys or external calls are made — everything is simulated in-memory.
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const db = require('./utils/db');
const sms = require('./mock/sms');
const mailer = require('./mock/mailerlite');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ─── In-memory stores ─────────────────────────────────────────────────────────

const otpStore = {};       // { phone: { code, expiresAt, attempts } }
const sessionStore = {};   // { token: { patientId, used, expiresAt } }

// ─── SSE Demo Panel infrastructure ───────────────────────────────────────────

/** Active SSE client connections */
let sseClients = [];

/** In-memory event buffer — last 100 events (FIFO) */
const demoEvents = [];

/**
 * Emit a demo event to all connected SSE clients and store in buffer.
 * @param {string} category - 'sms' | 'payment' | 'calendly' | 'mailerlite' | 'info' | 'warning'
 * @param {string} message - Human-readable event description
 */
function emitDemoEvent(category, message) {
  const event = {
    id: Date.now(),
    category,
    message,
    timestamp: new Date().toISOString()
  };

  // Add to FIFO buffer (max 100 events)
  demoEvents.push(event);
  if (demoEvents.length > 100) demoEvents.shift();

  // Broadcast to all active SSE clients
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  sseClients.forEach((res) => {
    try { res.write(payload); } catch (e) { /* client disconnected */ }
  });

  console.log(`[DEMO EVENT] [${category.toUpperCase()}] ${message}`);
}

/** GET /api/demo/events — SSE endpoint for live demo panel */
app.get('/api/demo/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  // Send replay of buffered events to new client
  demoEvents.forEach((event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  sseClients.push(res);
  console.log(`[SSE] Client connected. Total: ${sseClients.length}`);

  // Heartbeat every 30s to keep connection alive through proxies
  const heartbeat = setInterval(() => {
    try { res.write(': ping\n\n'); } catch (e) { /* ignore */ }
  }, 30000);

  req.on('close', () => {
    sseClients = sseClients.filter((c) => c !== res);
    clearInterval(heartbeat);
    console.log(`[SSE] Client disconnected. Total: ${sseClients.length}`);
  });
});

/** POST /api/demo/race-condition — trigger race condition demo event */
app.post('/api/demo/race-condition', (req, res) => {
  const { slotInfo } = req.body || {};
  const info = slotInfo || 'unknown slot';

  emitDemoEvent(
    'warning',
    `Race condition: ${info} — pending reservation blocked concurrent booking | auto-refund: N/A (slot secured)`
  );

  res.json({ ok: true });
});

/** POST /api/demo/ttl-start — notify demo panel that TTL countdown started */
app.post('/api/demo/ttl-start', (req, res) => {
  const { slotInfo } = req.body || {};
  const expiresAt = new Date(Date.now() + 60 * 1000).toISOString();

  emitDemoEvent(
    'payment',
    `TTL countdown started | slot: ${slotInfo || 'unknown'} | expires_at: ${expiresAt}`
  );

  res.json({ ok: true });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Generate slots dynamically for the next 30 days */
function generateSlots() {
  const doctors = db.readAll('doctors');
  const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const slots = [];

  for (let dayOffset = 1; dayOffset <= 30; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();

    doctors.forEach((doctor) => {
      hours.forEach((hour, hourIdx) => {
        const seed = (doctor.id.charCodeAt(3) + dayOffset + hourIdx) % 10;
        const isOwner = doctor.id === 'dr-owner';
        const threshold = isOwner ? 7 : 4;
        if (seed >= threshold) return;
        if (dayOfWeek === 0) return; // skip Sundays

        slots.push({
          id: `slot-${doctor.id}-${dateStr}-${hour.replace(':', '')}`,
          doctorId: doctor.id,
          doctorName: doctor.name,
          date: dateStr,
          time: hour,
          startTime: `${dateStr}T${hour}:00`,
          available: true
        });
      });
    });
  }

  return slots;
}

/** Format date to Polish readable string */
function formatDatePL(dateStr, time) {
  const date = new Date(`${dateStr}T${time}:00`);
  return date.toLocaleDateString('pl-PL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) + ` o ${time}`;
}

/** Mask phone number for privacy: +48600100200 → +48***0200 */
function maskPhone(phone) {
  const clean = phone.replace(/\s/g, '');
  return clean.slice(0, 3) + '***' + clean.slice(-4);
}

// ─── Mutex for reservation confirm ───────────────────────────────────────────
// Prevents TOCTOU race: two simultaneous /confirm calls both reading "no conflict"
// before either writes "confirmed". Node.js is single-threaded but async I/O
// means two requests can interleave between db.readAll() and db.updateById().

let confirmLock = false;
const confirmQueue = [];

function withConfirmLock(fn) {
  return new Promise((resolve, reject) => {
    const run = async () => {
      confirmLock = true;
      try {
        resolve(await fn());
      } catch (e) {
        reject(e);
      } finally {
        confirmLock = false;
        if (confirmQueue.length > 0) {
          const next = confirmQueue.shift();
          next();
        }
      }
    };

    if (confirmLock) {
      confirmQueue.push(run);
    } else {
      run();
    }
  });
}

// ─── Routes: Doctors ──────────────────────────────────────────────────────────

app.get('/api/doctors', (req, res) => {
  const doctors = db.readAll('doctors').filter((d) => !d.isOwner);
  res.json(doctors);
});

app.get('/api/doctors/all', (req, res) => {
  res.json(db.readAll('doctors'));
});

// ─── Routes: Slots ────────────────────────────────────────────────────────────

app.get('/api/slots', (req, res) => {
  const allSlots = generateSlots();
  const publicSlots = allSlots.filter((s) => s.doctorId !== 'dr-owner');
  const reservations = db.readAll('reservations');
  const now = new Date();
  // Only block slots with active reservations — expired pending reservations free the slot
  const confirmedSlotIds = reservations
    .filter((r) => {
      if (r.status === 'confirmed') return true;
      if (r.status === 'pending' && new Date(r.expiresAt) > now) return true;
      return false;
    })
    .map((r) => r.slotId);
  res.json(publicSlots.filter((s) => !confirmedSlotIds.includes(s.id)));
});

app.get('/api/slots/:doctorId', (req, res) => {
  const { doctorId } = req.params;
  const allSlots = generateSlots();
  const doctorSlots = allSlots.filter((s) => s.doctorId === doctorId);
  const reservations = db.readAll('reservations');
  const now = new Date();
  const confirmedSlotIds = reservations
    .filter((r) => {
      if (r.status === 'confirmed') return true;
      if (r.status === 'pending' && new Date(r.expiresAt) > now) return true;
      return false;
    })
    .map((r) => r.slotId);
  res.json(doctorSlots.filter((s) => !confirmedSlotIds.includes(s.id)));
});

// ─── Routes: OTP ──────────────────────────────────────────────────────────────

app.post('/api/otp/send', (req, res) => {
  const { phone } = req.body;

  if (!phone || !/^\+48\d{9}$/.test(phone.replace(/\s/g, ''))) {
    return res.status(400).json({ error: 'Nieprawidłowy numer telefonu. Format: +48XXXXXXXXX' });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = Date.now() + 10 * 60 * 1000;

  otpStore[phone] = { code, expiresAt, attempts: 0 };

  sms.sendSMS(phone, `Twój kod weryfikacyjny: ${code}. Ważny 10 minut. Klinika Estelle.`);

  emitDemoEvent('sms', `SMS sent → ${maskPhone(phone)} | Code: ${code}`);

  res.json({
    success: true,
    message: 'Kod wysłany SMS-em',
    demoCode: code
  });
});

app.post('/api/otp/verify', (req, res) => {
  const { phone, code } = req.body;
  const record = otpStore[phone];

  if (!record) {
    return res.status(400).json({ error: 'Kod wygasł lub nie istnieje. Wyślij nowy.' });
  }
  if (Date.now() > record.expiresAt) {
    delete otpStore[phone];
    return res.status(400).json({ error: 'Kod wygasł. Wyślij nowy.' });
  }
  if (record.attempts >= 3) {
    return res.status(429).json({ error: 'Zbyt wiele błędnych prób. Spróbuj ponownie za 15 minut.' });
  }
  if (record.code !== code) {
    otpStore[phone].attempts += 1;
    const remaining = 3 - otpStore[phone].attempts;
    return res.status(400).json({ error: `Nieprawidłowy kod. Pozostało prób: ${remaining}` });
  }

  const patient = db.findOne('patients', 'phone', phone);
  if (!patient) {
    delete otpStore[phone];
    return res.status(404).json({
      error: 'Nie znaleźliśmy Cię w naszej bazie. Zadzwoń na recepcję: +48 000 000 000'
    });
  }

  const token = uuidv4();
  sessionStore[token] = {
    patientId: patient.id,
    used: false,
    expiresAt: Date.now() + 30 * 60 * 1000
  };
  delete otpStore[phone];

  emitDemoEvent('info', `OTP verified → patient found | token generated | ${patient.firstName} ${patient.lastName}`);

  res.json({
    success: true,
    token,
    patient: {
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email
    }
  });
});

// ─── Routes: Owner Calendar ──────────────────────────────────────────────────

app.get('/api/calendar/owner', (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(401).json({ error: 'Brak tokenu sesji.' });

  const session = sessionStore[token];
  if (!session) return res.status(401).json({ error: 'Token wygasł lub jest nieprawidłowy. Zweryfikuj się ponownie.' });
  if (session.used) return res.status(401).json({ error: 'Token został już użyty. Zweryfikuj się ponownie.' });
  if (Date.now() > session.expiresAt) {
    delete sessionStore[token];
    return res.status(401).json({ error: 'Token wygasł. Zweryfikuj się ponownie.' });
  }

  sessionStore[token].used = true;
  const patient = db.findOne('patients', 'id', session.patientId);
  const allSlots = generateSlots();
  const ownerSlots = allSlots.filter((s) => s.doctorId === 'dr-owner');

  emitDemoEvent('calendly', `Calendly GET → Owner calendar loaded | patient: ${patient.firstName} ${patient.lastName}`);

  res.json({
    patient: { firstName: patient.firstName, lastName: patient.lastName, email: patient.email },
    slots: ownerSlots
  });
});

// ─── Routes: Reservations ─────────────────────────────────────────────────────

app.post('/api/reservations/create', (req, res) => {
  const { slotId, doctorId, doctorName, date, time, patient } = req.body;
  if (!slotId || !patient) return res.status(400).json({ error: 'Brakujące dane rezerwacji.' });

  // Early rejection: check if slot is already confirmed by another reservation
  const existingReservations = db.readAll('reservations');
  const alreadyConfirmed = existingReservations.some(
    (r) => r.slotId === slotId && r.status === 'confirmed'
  );
  if (alreadyConfirmed) {
    return res.status(409).json({ error: 'Slot zajęty', slotTaken: true });
  }

  const reservationId = uuidv4();
  const reservation = {
    id: reservationId,
    slotId, doctorId, doctorName, date, time, patient,
    status: 'pending',
    amount: 200,
    createdAt: new Date().toISOString(),
    // Demo TTL: 90 seconds (matches the 60s visual countdown + 30s processing buffer)
    expiresAt: new Date(Date.now() + 90 * 1000).toISOString()
  };

  db.insert('reservations', reservation);

  emitDemoEvent('payment', `Pending Reservation → slot: ${date} ${time} | ${doctorName} | TTL: 90s | awaiting payment`);

  // Build payment URL — use env-based frontend URL or default to localhost
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const paymentUrl = `${frontendUrl}/mock-payment?reservationId=${reservationId}&amount=200&doctor=${encodeURIComponent(doctorName)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`;

  res.json({ success: true, reservationId, paymentUrl });
});

app.post('/api/reservations/confirm', async (req, res) => {
  const { reservationId } = req.body;
  const reservation = db.findOne('reservations', 'id', reservationId);
  if (!reservation) return res.status(404).json({ error: 'Rezerwacja nie znaleziona.' });

  // Reject expired pending reservations — TTL elapsed, slot is free again
  if (reservation.status === 'pending' && new Date(reservation.expiresAt) <= new Date()) {
    db.updateById('reservations', reservationId, { status: 'expired' });
    return res.status(410).json({ error: 'Rezerwacja wygasła. Wybierz nowy termin.' });
  }

  try {
    // Mutex: only one confirm can execute the read-check-write block at a time
    const result = await withConfirmLock(() => {
      const allReservations = db.readAll('reservations');
      const conflicting = allReservations.find(
        (r) => r.slotId === reservation.slotId && r.status === 'confirmed' && r.id !== reservationId
      );

      if (conflicting) {
        // Race condition detected — refund this reservation
        db.updateById('reservations', reservationId, {
          status: 'refunded',
          refundedAt: new Date().toISOString()
        });
        emitDemoEvent('warning', `Race condition: slot taken | auto-refund initiated | 200 PLN → patient | ${reservation.doctorName} ${reservation.date} ${reservation.time}`);
        return { success: false, slotTaken: true };
      }

      // No conflict — confirm reservation
      db.updateById('reservations', reservationId, {
        status: 'confirmed',
        confirmedAt: new Date().toISOString()
      });
      return { success: true };
    });

    if (result.success) {
      sms.sendSMS(
        reservation.patient.phone || '+48000000000',
        `Wizyta potwierdzona! ${reservation.doctorName}, ${formatDatePL(reservation.date, reservation.time)}. Zadatek 200 PLN opłacony.`
      );

      emitDemoEvent('payment', `Payment webhook → status: paid | amount: 200 PLN | reservation: ${reservationId.slice(0, 8)}...`);

      // Simulate Calendly API call with slight delay (does NOT block HTTP response)
      setTimeout(() => {
        emitDemoEvent('calendly', `Calendly API → POST /scheduled_events | invitee: ${reservation.patient.firstName} ${reservation.patient.lastName} | slot: ${reservation.date} ${reservation.time} | HTTP 201 Created`);
      }, 500);

      return res.json({
        success: true,
        reservation: {
          doctorName: reservation.doctorName,
          date: reservation.date,
          time: reservation.time,
          patientFirstName: reservation.patient.firstName,
          patientLastName: reservation.patient.lastName,
        }
      });
    } else {
      return res.json(result);
    }
  } catch (err) {
    console.error('Confirm error:', err);
    return res.status(500).json({ error: 'Błąd serwera.' });
  }
});

app.get('/api/reservations/:id', (req, res) => {
  const reservation = db.findOne('reservations', 'id', req.params.id);
  if (!reservation) return res.status(404).json({ error: 'Rezerwacja nie znaleziona.' });
  res.json(reservation);
});

// ─── Routes: Waitlist ─────────────────────────────────────────────────────────

app.post('/api/waitlist/owner', (req, res) => {
  const { firstName, lastName, email, phone, newsletterConsent } = req.body;
  if (!firstName || !lastName || !email || !phone) {
    return res.status(400).json({ error: 'Wszystkie pola są wymagane.' });
  }

  const existing = db.findOne('waitlist_owner', 'email', email);
  if (existing) return res.status(409).json({ error: 'Ten adres email jest już na liście.' });

  const entry = { id: uuidv4(), firstName, lastName, email, phone, newsletterConsent: !!newsletterConsent, createdAt: new Date().toISOString() };
  db.insert('waitlist_owner', entry);

  mailer.addSubscriber({ email, firstName, lastName, phone }, 'owner');
  mailer.sendConfirmationEmail({ email, firstName }, 'owner');

  emitDemoEvent('mailerlite', `MailerLite → subscriber added | segment: Waitlist_Owner | ${firstName} ${lastName}`);

  res.json({ success: true, message: 'Zapisano na listę rezerwową' });
});

app.post('/api/waitlist/doctors', (req, res) => {
  const { firstName, lastName, email, phone, newsletterConsent } = req.body;
  if (!firstName || !lastName || !email || !phone) {
    return res.status(400).json({ error: 'Wszystkie pola są wymagane.' });
  }

  const existing = db.findOne('waitlist_doctors', 'email', email);
  if (existing) return res.status(409).json({ error: 'Ten adres email jest już na liście.' });

  const entry = { id: uuidv4(), firstName, lastName, email, phone, newsletterConsent: !!newsletterConsent, createdAt: new Date().toISOString() };
  db.insert('waitlist_doctors', entry);

  mailer.addSubscriber({ email, firstName, lastName, phone }, 'doctors');
  mailer.sendConfirmationEmail({ email, firstName }, 'doctors');

  emitDemoEvent('mailerlite', `MailerLite → subscriber added | segment: Waitlist_Doctors | ${firstName} ${lastName}`);

  res.json({ success: true, message: 'Zapisano na listę rezerwową lekarzy' });
});

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: 'DEMO (mock integrations)',
    timestamp: new Date().toISOString(),
    sseClients: sseClients.length,
    demoEventsBuffered: demoEvents.length
  });
});

// ─── Start server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\nMedBooker Demo Backend running on http://localhost:${PORT}`);
  console.log(`   Mode: DEMO (all integrations are mocked)`);
  console.log(`   SSE Demo Panel: http://localhost:${PORT}/api/demo/events`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);

  emitDemoEvent('info', 'Backend started — Demo Mode active');
});
