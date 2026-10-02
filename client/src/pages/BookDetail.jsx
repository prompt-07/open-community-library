import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import RatingStars from '../components/RatingStars.jsx';
import BookCard from '../components/BookCard.jsx';
import ReviewForm from '../components/ReviewForm.jsx';

export default function BookDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { add, has, isFull } = useCart();

  const [book, setBook] = useState(null);
  const [related, setRelated] = useState([]);
  const [wishlisted, setWishlisted] = useState(false);
  const [notice, setNotice] = useState('');

  async function load() {
    const b = await api.get(`/books/${id}`);
    setBook(b);
    const rel = await api.get(`/books?genre=${encodeURIComponent(b.genre)}&limit=8`);
    setRelated(rel.items.filter((x) => x._id !== b._id).slice(0, 4));
  }

  useEffect(() => {
    load().catch(() => setBook(null));
  }, [id]);

  // Reflect wishlist membership for logged-in members.
  useEffect(() => {
    if (!user) return;
    api.get('/users/wishlist').then((list) => setWishlisted(list.some((b) => b._id === id))).catch(() => {});
  }, [user, id]);

  if (!book) return <p>{t('common.loading')}</p>;

  const available = book.availableCopies > 0;

  async function toggleWishlist() {
    const res = await api.put(`/users/wishlist/${id}`);
    setWishlisted(res.inWishlist);
  }

  async function joinWaitingList() {
    try {
      await api.post('/waiting-list', { bookId: id });
      setNotice('You have joined the waiting list.');
    } catch (err) {
      setNotice(err.message);
    }
  }

  function addToCart() {
    add(book);
    setNotice('Added to your cart for the next session.');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 280px) 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left: cover */}
        <div
          style={{
            aspectRatio: '2 / 3',
            borderRadius: 12,
            background: 'var(--color-parchment-alt)',
            border: '2px dashed var(--color-ink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            textAlign: 'center',
            padding: 12,
          }}
        >
          {book.coverImageUrl ? (
            <img src={book.coverImageUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span>{book.title}</span>
          )}
        </div>

        {/* Right: metadata + controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h1 style={{ margin: 0 }}>{book.title}</h1>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem' }}>{book.author}</p>
          <p style={{ margin: 0 }}>
            {book.language} · {book.genre}
          </p>
          <RatingStars average={book.ratingAverage} count={book.ratingCount} />
          <p style={{ margin: 0 }}>
            Copies: {book.availableCopies} available of {book.totalCopies}
          </p>
          <StatusBadge available={available} />

          {/* Highlighted admin review box */}
          {(book.adminReview || book.orientationTags?.length > 0) && (
            <div
              style={{
                background: 'var(--color-parchment-alt)',
                border: '2px solid var(--color-accent)',
                borderRadius: 12,
                padding: '1rem',
              }}
            >
              <strong>Librarian's Review</strong>
              {book.adminReview && <p style={{ marginBottom: 8 }}>{book.adminReview}</p>}
              {book.orientationTags?.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {book.orientationTags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: 999,
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-accent)',
                        color: 'var(--color-accent)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Availability-dependent controls */}
          {available ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={addToCart}
              disabled={has(book._id) || (isFull && !has(book._id))}
            >
              {has(book._id) ? 'In Cart' : 'ADD TO CART FOR NEXT SESSION'}
            </button>
          ) : (
            <div
              style={{
                background: 'var(--color-surface)',
                border: '2px solid var(--color-lent)',
                borderRadius: 12,
                padding: '1rem',
              }}
            >
              <p style={{ marginTop: 0, fontWeight: 700, color: 'var(--color-lent)' }}>Currently Lent</p>
              {book.currentBorrower && (
                <>
                  <p style={{ margin: '4px 0' }}>Lent to: {book.currentBorrower.name}</p>
                  <p style={{ margin: '4px 0' }}>
                    Expected Return Date: {new Date(book.currentBorrower.expectedReturnDate).toLocaleDateString()}
                  </p>
                </>
              )}
              <button type="button" className="btn btn-secondary" onClick={joinWaitingList} disabled={!user}>
                Join Waiting List / Reserve on Return
              </button>
              {!user && <p style={{ fontSize: '0.85rem' }}>Log in to join the waiting list.</p>}
            </div>
          )}

          {user && (
            <button type="button" className="btn btn-secondary" onClick={toggleWishlist}>
              {wishlisted ? '♥ In Wishlist' : '♡ Add to Wishlist'}
            </button>
          )}

          {notice && <p style={{ fontWeight: 600, color: 'var(--color-available)' }}>{notice}</p>}
        </div>
      </div>

      {/* Reviews */}
      <section>
        <h2>Reviews</h2>
        {user && <ReviewForm bookId={book._id} onSubmitted={load} />}
        {book.reviews?.length > 0 ? (
          book.reviews.map((r) => (
            <div key={r._id} style={{ borderTop: '1px solid var(--color-ink)', padding: '0.75rem 0' }}>
              <strong>{r.member?.name || 'Member'}</strong> — {'★'.repeat(r.rating)}
              <p style={{ margin: '4px 0' }}>{r.text}</p>
            </div>
          ))
        ) : (
          <p style={{ opacity: 0.7 }}>No reviews yet.</p>
        )}
      </section>

      {/* Related books */}
      {related.length > 0 && (
        <section>
          <h2>More in {book.genre}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {related.map((b) => (
              <BookCard key={b._id} book={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
