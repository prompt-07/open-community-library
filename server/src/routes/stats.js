import express from 'express';
import Book from '../models/Book.js';
import Loan from '../models/Loan.js';

const router = express.Router();

// GET /api/stats/public (no auth) — powers the homepage Impact Stats Bar.
router.get('/public', async (req, res) => {
  const totalBooks = await Book.countDocuments();

  // activeReaders: distinct members who appear on at least one Loan record ever.
  // A member with only a reservation (no loan) does NOT count.
  const distinctReaders = await Loan.distinct('member', { member: { $ne: null } });
  const activeReaders = distinctReaders.length;

  // booksIssuedToDate: every loan ever created, not just currently-active ones.
  const booksIssuedToDate = await Loan.countDocuments();

  res.json({ totalBooks, activeReaders, booksIssuedToDate });
});

export default router;
