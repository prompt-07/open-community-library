import { useState } from 'react';
import { api } from '../api.js';

// Star rating + text review form. Calls Phase 7's endpoint; on success invokes
// onSubmitted so the detail page refetches (rating average updates in-session).
export default function ReviewForm({ bookId, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (rating < 1) return setError('Please select a star rating.');
    if (!text.trim()) return setError('Please write a short review.');
    setBusy(true);
    try {
      await api.post(`/books/${bookId}/reviews`, { rating, text: text.trim() });
      setText('');
      setRating(0);
      await onSubmitted?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      style={{
        background: 'var(--color-parchment-alt)',
        border: '2px solid var(--color-ink)',
        borderRadius: 12,
        padding: '1rem',
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <strong>Write a review</strong>
      {error && <span style={{ color: 'var(--color-lent)', fontWeight: 600 }}>{error}</span>}
      <div role="radiogroup" aria-label="Star rating" style={{ fontSize: '1.6rem', cursor: 'pointer' }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            role="radio"
            aria-checked={rating === n}
            tabIndex={0}
            onClick={() => setRating(n)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            style={{ color: 'var(--color-accent)' }}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
          >
            {n <= (hover || rating) ? '★' : '☆'}
          </span>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Share your thoughts…"
        style={{
          padding: '0.6rem',
          fontSize: '1rem',
          borderRadius: 8,
          border: '2px solid var(--color-ink)',
          background: 'var(--color-surface)',
          color: 'var(--color-ink)',
          resize: 'vertical',
        }}
      />
      <button type="submit" className="btn btn-primary" disabled={busy} style={{ alignSelf: 'flex-start' }}>
        {busy ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  );
}
