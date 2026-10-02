import express from 'express';
import Loan from '../models/Loan.js';
import Book from '../models/Book.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// GET /api/loans (admin) — active loans (not yet returned), for Receive Returns.
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  const loans = await Loan.find({ dateReturned: null })
    .populate('book', 'title author')
    .sort({ dateIssued: 1 });
  res.json(loans);
});

// GET /api/loans/mine (member) — this member's loans (reading history + current).
router.get('/mine', authMiddleware, async (req, res) => {
  const loans = await Loan.find({ member: req.user._id })
    .populate('book', 'title author coverImageUrl')
    .sort({ dateIssued: -1 });
  res.json(loans);
});

// POST /api/loans/issue (admin) — record a loan and decrement availability.
router.post('/issue', authMiddleware, adminOnly, async (req, res) => {
  const {
    bookId,
    member,
    memberName,
    memberPhone,
    memberEmail,
    memberAddress,
    dateIssued,
    expectedReturnDate,
    remarks,
  } = req.body || {};

  if (!bookId || !memberName || !dateIssued || !expectedReturnDate) {
    return res
      .status(400)
      .json({ error: 'bookId, memberName, dateIssued, and expectedReturnDate are required' });
  }

  const book = await Book.findById(bookId);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  if (book.availableCopies <= 0) {
    return res.status(409).json({ error: 'No copies available to issue' });
  }

  const loan = await Loan.create({
    book: bookId,
    member: member || undefined,
    memberName,
    memberPhone,
    memberEmail,
    memberAddress,
    dateIssued,
    expectedReturnDate,
    remarks,
  });

  book.availableCopies -= 1;
  await book.save();

  res.status(201).json(loan);
});

// POST /api/loans/:id/return (admin) — mark returned and restore availability.
router.post('/:id/return', authMiddleware, adminOnly, async (req, res) => {
  const loan = await Loan.findById(req.params.id);
  if (!loan) return res.status(404).json({ error: 'Loan not found' });
  if (loan.dateReturned) {
    return res.status(409).json({ error: 'Loan already returned' });
  }

  loan.dateReturned = new Date();
  await loan.save();

  const book = await Book.findById(loan.book);
  if (book) {
    book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
    await book.save();
  }

  res.json(loan);
});

export default router;
