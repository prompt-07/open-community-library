import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { connectDB } from './db.js';
import User from './models/User.js';
import Book from './models/Book.js';

dotenv.config();

// Throwaway seed: a few sample books across genres/languages (one Book of the
// Week) and one admin user. Safe to re-run — clears Users/Books first.
const books = [
  {
    title: 'Shivaji: The Great Maratha',
    author: 'Ranjit Desai',
    language: 'Marathi',
    genre: 'History',
    description: 'A sweeping account of the founder of the Maratha empire.',
    adminReview: 'Essential reading for anyone curious about Maharashtra\'s history.',
    orientationTags: ['Thought-Provoking', 'Beginner Friendly'],
    isBookOfWeek: true,
    totalCopies: 3,
    availableCopies: 3,
    shelfNumber: 'A1',
  },
  {
    title: 'The Discovery of India',
    author: 'Jawaharlal Nehru',
    language: 'English',
    genre: 'History',
    description: 'Nehru\'s exploration of India\'s past, written from prison.',
    orientationTags: ['In-Depth'],
    totalCopies: 2,
    availableCopies: 2,
    shelfNumber: 'A2',
  },
  {
    title: 'Gaban',
    author: 'Munshi Premchand',
    language: 'Hindi',
    genre: 'Novels',
    description: 'A classic Hindi novel about greed and redemption.',
    orientationTags: ['Classic'],
    totalCopies: 4,
    availableCopies: 4,
    shelfNumber: 'B1',
  },
  {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    language: 'English',
    genre: 'Sociology',
    description: 'How Homo sapiens came to dominate the planet.',
    orientationTags: ['Thought-Provoking', 'Popular'],
    totalCopies: 2,
    availableCopies: 2,
    shelfNumber: 'C1',
  },
  {
    title: 'Mrityunjay',
    author: 'Shivaji Sawant',
    language: 'Marathi',
    genre: 'Literature',
    description: 'The epic story of Karna from the Mahabharata.',
    orientationTags: ['Beginner Friendly'],
    totalCopies: 3,
    availableCopies: 3,
    shelfNumber: 'B2',
  },
];

async function seed() {
  await connectDB();

  await User.deleteMany({});
  await Book.deleteMany({});

  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await User.create({
    name: 'Library Admin',
    email: 'admin@openlibrary.local',
    passwordHash,
    phone: '0000000000',
    role: 'admin',
  });

  const inserted = await Book.insertMany(books);

  console.log(`Seeded ${inserted.length} books and 1 admin user (${admin.email}).`);
  console.log('Admin login (dev only): admin@openlibrary.local / admin123');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
