import express from 'express';
import Reservation from '../models/Reservation.js';
import Book from '../models/Book.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { nextSunday } from '../utils/sessionDate.js';

const router = express.Router();

function maxPerSession() {
  return parseInt(process.env.MAX_RESERVATIONS_PER_SESSION, 10) || 3;
}

// POST /api/reservations/confirm (member) — the cart confirm step.
router.post('/confirm', authMiddleware, async (req, res) => {
  const { bookIds } = req.body || {};
  if (!Array.isArray(bookIds) || bookIds.length === 0) {
    return res.status(400).json({ error: 'bookIds must be a non-empty array' });
  }

  const sessionDate = nextSunday();

  // Validate every book exists and has an available copy — reject the whole cart otherwise.
  const books = await Book.find({ _id: { $in: bookIds } });
  const foundIds = new Set(books.map((b) => b._id.toString()));
  const missing = bookIds.filter((id) => !foundIds.has(id));
  if (missing.length) {
    return res.status(404).json({ error: `Book not found: ${missing.join(', ')}` });
  }
  const unavailable = books.filter((b) => b.availableCopies <= 0);
  if (unavailable.length) {
    return res.status(409).json({
      error: `These books are currently unavailable: ${unavailable.map((b) => b.title).join(', ')}`,
    });
  }

  // Enforce the per-session limit, counting this member's active reservations for the session.
  const existing = await Reservation.countDocuments({
    member: req.user._id,
    sessionDate,
    status: { $in: ['pending', 'approved'] },
  });
  const limit = maxPerSession();
  if (existing + bookIds.length > limit) {
    return res.status(409).json({
      error: `Reservation limit is ${limit} books per session. You already have ${existing} for this session.`,
    });
  }

  const created = await Reservation.insertMany(
    bookIds.map((book) => ({ book, member: req.user._id, sessionDate, status: 'pending' }))
  );
  res.status(201).json({ sessionDate, reservations: created });
});

// GET /api/reservations/mine (member) — own reservations, sorted by sessionDate.
router.get('/mine', authMiddleware, async (req, res) => {
  const reservations = await Reservation.find({ member: req.user._id })
    .populate('book', 'title author coverImageUrl')
    .sort({ sessionDate: 1, createdAt: 1 });
  res.json(reservations);
});

// GET /api/reservations (admin) — pending reservations, optionally by sessionDate.
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  const filter = { status: 'pending' };
  if (req.query.sessionDate) filter.sessionDate = new Date(req.query.sessionDate);
  const reservations = await Reservation.find(filter)
    .populate('book', 'title author')
    .populate('member', 'name email')
    .sort({ sessionDate: 1 });
  res.json(reservations);
});

// PATCH /api/reservations/:id/approve (admin)
router.patch('/:id/approve', authMiddleware, adminOnly, async (req, res) => {
  const r = await Reservation.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
  if (!r) return res.status(404).json({ error: 'Reservation not found' });
  res.json(r);
});

// PATCH /api/reservations/:id/cancel (admin)
router.patch('/:id/cancel', authMiddleware, adminOnly, async (req, res) => {
  const r = await Reservation.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
  if (!r) return res.status(404).json({ error: 'Reservation not found' });
  res.json(r);
});

export default router;
