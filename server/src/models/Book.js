import mongoose from 'mongoose';
import { GENRES, LANGUAGES } from '../constants.js';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  language: { type: String, enum: LANGUAGES, required: true },
  genre: { type: String, enum: GENRES, required: true },
  coverImageUrl: { type: String },
  description: { type: String },
  adminReview: { type: String },
  orientationTags: [{ type: String }],
  isBookOfWeek: { type: Boolean, default: false },
  ratingAverage: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  totalCopies: { type: Number, default: 1, min: 0 },
  availableCopies: { type: Number, default: 1, min: 0 },
  shelfNumber: { type: String },
});

export default mongoose.model('Book', bookSchema);
