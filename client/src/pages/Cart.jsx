import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { api } from '../api.js';

export default function Cart() {
  const { items, remove, clear, MAX_CART } = useCart();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      const res = await api.post('/reservations/confirm', { bookIds: items.map((b) => b._id) });
      // Only clear the cart once the server has confirmed.
      clear();
      setSuccess(`Reserved ${res.reservations.length} book(s) for the next session.`);
    } catch (err) {
      // Surface the real error; do NOT clear the cart.
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 640 }}>
      <h1>Cart</h1>
      <p style={{ fontWeight: 700 }}>
        {items.length} / {MAX_CART} books this session
      </p>
      {items.length >= MAX_CART && (
        <p style={{ color: 'var(--color-lent)', fontWeight: 600 }}>
          You have reached the per-session limit of {MAX_CART} books.
        </p>
      )}

      {error && <p style={{ color: 'var(--color-lent)', fontWeight: 600 }}>{error}</p>}
      {success && (
        <p style={{ color: 'var(--color-available)', fontWeight: 600 }}>
          {success} <Link to="/my-reservations">View my reservations</Link>
        </p>
      )}

      {items.length === 0 ? (
        <p style={{ opacity: 0.7 }}>
          Your cart is empty. <Link to="/browse">Browse books</Link> to add some.
        </p>
      ) : (
        <>
          {items.map((b) => (
            <div
              key={b._id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--color-surface)',
                border: '2px solid var(--color-ink)',
                borderRadius: 12,
                padding: '0.75rem 1rem',
              }}
            >
              <span>
                <strong>{b.title}</strong> — {b.author}
              </span>
              <button type="button" className="btn btn-secondary" style={{ minHeight: 40 }} onClick={() => remove(b._id)}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-primary" onClick={confirm} disabled={busy}>
            {busy ? 'Confirming…' : 'Confirm My Reservations | आरक्षण निश्चित करा'}
          </button>
        </>
      )}
    </div>
  );
}
