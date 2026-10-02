import express from 'express';
import Book from '../models/Book.js';
import Review from '../models/Review.js';
import Loan from '../models/Loan.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { GENRES, LANGUAGES } from '../constants.js';
import { firstNameLastInitial } from '../utils/privacy.js';

const router = express.Router();

// GET /api/books — public browse/search with filters + pagination.
router.get('/', async (req, res) => {
  const { search, language, genre, rating, available } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 12));

  const filter = {};
  if (search) {
    const rx = new RegExp(search, 'i');
    filter.$or = [{ title: rx }, { author: rx }, { description: rx }];
  }
  if (language) filter.language = language;
  if (genre) filter.genre = genre;
  if (rating) filter.ratingAverage = { $gte: Number(rating) };
  if (available === 'true') filter.availableCopies = { $gt: 0 };

  const [items, total] = await Promise.all([
    Book.find(filter)
      .sort({ title: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Book.countDocuments(filter),
  ]);

  res.json({ items, total, page, limit, pages: Math.ceil(total / limit) });
});

// GET /api/books/book-of-week — the single flagged book (must precede /:id).
router.get('/book-of-week', async (req, res) => {
  const book = await Book.findOne({ isBookOfWeek: true });
  if (!book) return res.status(404).json({ error: 'No Book of the Week is set' });
  res.json(book);
});

// GET /api/books/:id — single book detail with its reviews.
router.get('/:id', async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  const reviews = await Review.find({ book: book._id })
    .populate('member', 'name')
    .sort({ createdAt: -1 });

  const payload = { ...book.toObject(), reviews };

  // Privacy: when lent out, expose ONLY a masked borrower name + expected return
  // date. Never the borrower's full name, phone, email, or address.
  if (book.availableCopies === 0) {
    const activeLoan = await Loan.findOne({ book: book._id, dateReturned: null }).sort({
      dateIssued: -1,
    });
    if (activeLoan) {
      payload.currentBorrower = {
        name: firstNameLastInitial(activeLoan.memberName),
        expectedReturnDate: activeLoan.expectedReturnDate,
      };
    }
  }

  res.json(payload);
});

// Ensure at most one Book of the Week: clear the flag on all others.
async function enforceSingleBookOfWeek(keepId) {
  await Book.updateMany({ _id: { $ne: keepId }, isBookOfWeek: true }, { isBookOfWeek: false });
}

// POST /api/books — admin only.
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const book = await Book.create(req.body);
  if (book.isBookOfWeek) await enforceSingleBookOfWeek(book._id);
  res.status(201).json(book);
});

// PUT /api/books/:id — admin only.
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!book) return res.status(404).json({ error: 'Book not found' });
  if (book.isBookOfWeek) await enforceSingleBookOfWeek(book._id);
  res.json(book);
});

// DELETE /api/books/:id — admin only.
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json({ ok: true });
});

// Recompute a book's rating rollup from all its reviews.
async function recomputeRating(bookId) {
  const reviews = await Review.find({ book: bookId });
  const ratingCount = reviews.length;
  const ratingAverage =
    ratingCount === 0 ? 0 : reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount;
  await Book.findByIdAndUpdate(bookId, { ratingCount, ratingAverage });
  return { ratingCount, ratingAverage };
}

// POST /api/books/:id/reviews (member) — one review per member per book (upsert).
router.post('/:id/reviews', authMiddleware, async (req, res) => {
  const { rating, text } = req.body || {};
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'rating must be a number from 1 to 5' });
  }
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });

  const review = await Review.findOneAndUpdate(
    { book: book._id, member: req.user._id },
    { rating, text, createdAt: new Date() },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  const rollup = await recomputeRating(book._id);
  res.status(201).json({ review, ...rollup });
});

// GET /api/books/:id/reviews — newest first.
router.get('/:id/reviews', async (req, res) => {
  const reviews = await Review.find({ book: req.params.id })
    .populate('member', 'name')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

// PUT /api/books/:id/admin-review (admin) — featured review text + orientation tags.
router.put('/:id/admin-review', authMiddleware, adminOnly, async (req, res) => {
  const { adminReview, orientationTags } = req.body || {};
  const update = {};
  if (adminReview !== undefined) update.adminReview = adminReview;
  if (orientationTags !== undefined) update.orientationTags = orientationTags;
  const book = await Book.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
});

export default router;
