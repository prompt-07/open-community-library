import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './db.js';
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import reservationRoutes from './routes/reservations.js';
import loanRoutes from './routes/loans.js';
import waitingListRoutes from './routes/waitingList.js';
import statsRoutes from './routes/stats.js';
import adminRoutes from './routes/admin.js';
import reviewRoutes from './routes/reviews.js';
import userRoutes from './routes/users.js';
import uploadRoutes from './routes/upload.js';

dotenv.config();

const app = express();

const isProd = process.env.NODE_ENV === 'production';

// Behind Render's proxy, Express must trust it so Secure cookies are set correctly.
if (isProd) app.set('trust proxy', 1);

// In production, only allow the configured frontend origin(s) (comma-separated).
// Locally, reflect any origin so localhost dev just works.
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: isProd ? (allowedOrigins.length ? allowedOrigins : false) : true,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/waiting-list', waitingListRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

const PORT = process.env.PORT || 5000;

await connectDB();

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
