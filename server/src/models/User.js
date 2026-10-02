import mongoose from 'mongoose';
import { USER_ROLES } from '../constants.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  phone: { type: String, trim: true },
  role: { type: String, enum: USER_ROLES, default: 'member' },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);
