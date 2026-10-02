import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

export default function Profile() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api.get('/loans/mine').then(setLoans).catch(() => setLoans([]));
    api.get('/reservations/mine').then(setReservations).catch(() => setReservations([]));
    api.get('/users/wishlist').then(setWishlist).catch(() => setWishlist([]));
    api.get('/reviews/mine').then(setReviews).catch(() => setReviews([]));
  }, []);

  const borrowed = loans.filter((l) => !l.dateReturned);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1>My Profile</h1>

      <Panel title="Account">
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Phone:</strong> {user?.phone || '—'}</p>
      </Panel>

      <Panel title={`Currently Borrowed (${borrowed.length})`}>
        {borrowed.length === 0 ? <Empty /> : borrowed.map((l) => (
          <p key={l._id}>{l.book?.title} — due {fmt(l.expectedReturnDate)}</p>
        ))}
      </Panel>

      <Panel title={`Reading History (${loans.length})`}>
        {loans.length === 0 ? <Empty /> : loans.map((l) => (
          <p key={l._id}>{l.book?.title} — issued {fmt(l.dateIssued)}{l.dateReturned ? `, returned ${fmt(l.dateReturned)}` : ''}</p>
        ))}
      </Panel>

      <Panel title={`Active Reservations (${reservations.length})`}>
        {reservations.length === 0 ? <Empty /> : reservations.map((r) => (
          <p key={r._id}>{r.book?.title} — {r.status} (session {fmt(r.sessionDate)})</p>
        ))}
      </Panel>

      <Panel title={`Wishlist (${wishlist.length})`}>
        {wishlist.length === 0 ? <Empty /> : wishlist.map((b) => (
          <p key={b._id}><Link to={`/book/${b._id}`}>{b.title}</Link></p>
        ))}
      </Panel>

      <Panel title={`Reviews Written (${reviews.length})`}>
        {reviews.length === 0 ? <Empty /> : reviews.map((r) => (
          <p key={r._id}>{r.book?.title}: {'★'.repeat(r.rating)} — {r.text}</p>
        ))}
      </Panel>
    </div>
  );
}

const fmt = (d) => (d ? new Date(d).toLocaleDateString() : '—');
const Empty = () => <p style={{ opacity: 0.6 }}>Nothing yet.</p>;

function Panel({ title, children }) {
  return (
    <section style={{ background: 'var(--color-surface)', border: '2px solid var(--color-ink)', borderRadius: 12, padding: '1.25rem' }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {children}
    </section>
  );
}
