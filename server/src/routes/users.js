import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users/wishlist (member) — this member's wishlist, populated with books.
router.get('/wishlist', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    'wishlist',
    'title author coverImageUrl availableCopies'
  );
  res.json(user?.wishlist || []);
});

// PUT /api/users/wishlist/:bookId (member) — toggle a book in the wishlist.
router.put('/wishlist/:bookId', authMiddleware, async (req, res) => {
  const { bookId } = req.params;
  const user = await User.findById(req.user._id);
  const idx = user.wishlist.findIndex((b) => b.toString() === bookId);
  let inWishlist;
  if (idx >= 0) {
    user.wishlist.splice(idx, 1);
    inWishlist = false;
  } else {
    user.wishlist.push(bookId);
    inWishlist = true;
  }
  await user.save();
  res.json({ inWishlist, wishlist: user.wishlist });
});

export default router;
