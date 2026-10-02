import mongoose from 'mongoose';

// Loan (lending record). Member contact fields are a snapshot taken at issue
// time from the admin registration form — kept even if the User record changes.
const loanSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  memberName: { type: String, required: true },
  memberPhone: { type: String },
  memberEmail: { type: String },
  memberAddress: { type: String },
  dateIssued: { type: Date, required: true },
  expectedReturnDate: { type: Date, required: true },
  dateReturned: { type: Date, default: null },
  remarks: { type: String },
});

export default mongoose.model('Loan', loanSchema);
