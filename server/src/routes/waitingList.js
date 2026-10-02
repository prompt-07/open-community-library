import express from 'express';
import WaitingListEntry from '../models/WaitingListEntry.js';
import Book from '../models/Book.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// POST /api/waiting-list (member) — join the waiting list for an unavailable book.
router.post('/', authMiddleware, async (req, res) => {
  const { bookId } = req.body || {};
  if (!bookId) return res.status(400).json({ error: 'bookId is required' });

  const book = await Book.findById(bookId);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  if (book.availableCopies > 0) {
    return res
      .status(409)
      .json({ error: 'This book is available — reserve it instead of joining the waiting list' });
  }

  const existing = await WaitingListEntry.findOne({ book: bookId, member: req.user._id });
  if (existing) {
    return res.status(409).json({ error: 'You are already on the waiting list for this book' });
  }

  const entry = await WaitingListEntry.create({ book: bookId, member: req.user._id });
  res.status(201).json(entry);
});

// GET /api/waiting-list/:bookId (admin) — full contact info of everyone waiting.
router.get('/:bookId', authMiddleware, adminOnly, async (req, res) => {
  const entries = await WaitingListEntry.find({ book: req.params.bookId })
    .populate('member', 'name email phone')
    .sort({ createdAt: 1 });
  res.json(entries);
});

export default router;
