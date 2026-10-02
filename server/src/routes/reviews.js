import express from 'express';
import Review from '../models/Review.js';
import Book from '../models/Book.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// GET /api/reviews/mine (member) — reviews this member has written.
router.get('/mine', authMiddleware, async (req, res) => {
  const reviews = await Review.find({ member: req.user._id })
    .populate('book', 'title author')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

// DELETE /api/reviews/:id (admin) — moderate/remove a review, then recompute the
// owning book's rating rollup.
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) return res.status(404).json({ error: 'Review not found' });

  const reviews = await Review.find({ book: review.book });
  const ratingCount = reviews.length;
  const ratingAverage =
    ratingCount === 0 ? 0 : reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount;
  await Book.findByIdAndUpdate(review.book, { ratingCount, ratingAverage });

  res.json({ ok: true, ratingCount, ratingAverage });
});

export default router;
