import express from 'express';
import multer from 'multer';
import { uploadBuffer } from '../cloudinary.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Keep the file in memory; we stream the buffer straight to Cloudinary.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  },
});

// POST /api/upload (admin) — multipart form field "image". Returns { url }.
router.post('/', authMiddleware, adminOnly, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
    try {
      const result = await uploadBuffer(req.file.buffer);
      res.status(201).json({ url: result.secure_url, publicId: result.public_id });
    } catch (e) {
      res.status(502).json({ error: `Cloudinary upload failed: ${e.message}` });
    }
  });
});

export default router;
