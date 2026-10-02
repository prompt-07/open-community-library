import express from 'express';
import ExcelJS from 'exceljs';
import Book from '../models/Book.js';
import User from '../models/User.js';
import Loan from '../models/Loan.js';
import Reservation from '../models/Reservation.js';
import Review from '../models/Review.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require auth + admin role.
router.use(authMiddleware, adminOnly);

function overdueGraceDays() {
  return parseInt(process.env.OVERDUE_GRACE_DAYS, 10) || 14;
}

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  const totalBooks = await Book.countDocuments();
  const registeredMembers = await User.countDocuments({ role: 'member' });
  const booksCurrentlyIssued = await Loan.countDocuments({ dateReturned: null });

  // Overdue: not returned AND now is past expectedReturnDate + grace days.
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - overdueGraceDays());
  const overdueBooks = await Loan.countDocuments({
    dateReturned: null,
    expectedReturnDate: { $lt: cutoff },
  });

  res.json({
    totalBooks,
    registeredMembers,
    booksCurrentlyIssued,
    overdueBooks,
    overdueGraceDays: overdueGraceDays(),
  });
});

// GET /api/admin/members — all registered members (Manage Members).
router.get('/members', async (req, res) => {
  const members = await User.find({ role: 'member' })
    .select('name email phone createdAt')
    .sort({ createdAt: -1 });
  res.json(members);
});

// GET /api/admin/reviews — all reviews with book + author (Moderate Reviews).
router.get('/reviews', async (req, res) => {
  const reviews = await Review.find()
    .populate('book', 'title')
    .populate('member', 'name email')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

// GET /api/admin/session-fulfillment?sessionDate=... — approved reservations for a
// session, grouped by member, with book titles (the Session Fulfillment Desk list).
router.get('/session-fulfillment', async (req, res) => {
  if (!req.query.sessionDate) {
    return res.status(400).json({ error: 'sessionDate query param is required' });
  }
  // Match any reservation whose sessionDate falls on the requested calendar day
  // (server-local), so a date-picker value matches the stored local-midnight value.
  const t = new Date(req.query.sessionDate);
  const start = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const sessionDate = start;

  const reservations = await Reservation.find({
    sessionDate: { $gte: start, $lt: end },
    status: 'approved',
  })
    .populate('book', 'title author')
    .populate('member', 'name email phone');

  const byMember = new Map();
  for (const r of reservations) {
    const key = r.member?._id?.toString() || 'unknown';
    if (!byMember.has(key)) {
      byMember.set(key, {
        member: r.member ? { name: r.member.name, email: r.member.email, phone: r.member.phone } : null,
        books: [],
      });
    }
    byMember.get(key).books.push({ title: r.book?.title, author: r.book?.author });
  }

  res.json({ sessionDate, groups: Array.from(byMember.values()) });
});

// GET /api/admin/export/loans.xlsx — stream a workbook of all loan records.
router.get('/export/loans.xlsx', async (req, res) => {
  const loans = await Loan.find().populate('book', 'title author').sort({ dateIssued: -1 });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Loans');
  sheet.columns = [
    { header: 'Book', key: 'book', width: 32 },
    { header: 'Author', key: 'author', width: 24 },
    { header: 'Member Name', key: 'memberName', width: 24 },
    { header: 'Phone', key: 'memberPhone', width: 16 },
    { header: 'Email', key: 'memberEmail', width: 28 },
    { header: 'Address', key: 'memberAddress', width: 32 },
    { header: 'Date Issued', key: 'dateIssued', width: 16 },
    { header: 'Expected Return', key: 'expectedReturnDate', width: 16 },
    { header: 'Date Returned', key: 'dateReturned', width: 16 },
    { header: 'Remarks', key: 'remarks', width: 24 },
  ];

  for (const l of loans) {
    sheet.addRow({
      book: l.book?.title || '',
      author: l.book?.author || '',
      memberName: l.memberName,
      memberPhone: l.memberPhone,
      memberEmail: l.memberEmail,
      memberAddress: l.memberAddress,
      dateIssued: l.dateIssued ? l.dateIssued.toISOString().slice(0, 10) : '',
      expectedReturnDate: l.expectedReturnDate ? l.expectedReturnDate.toISOString().slice(0, 10) : '',
      dateReturned: l.dateReturned ? l.dateReturned.toISOString().slice(0, 10) : '',
      remarks: l.remarks,
    });
  }

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', 'attachment; filename="loans.xlsx"');
  await workbook.xlsx.write(res);
  res.end();
});

export default router;
