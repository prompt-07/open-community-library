import mongoose from 'mongoose';
import { RESERVATION_STATUSES } from '../constants.js';

const reservationSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: RESERVATION_STATUSES, default: 'pending' },
  sessionDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Reservation', reservationSchema);
