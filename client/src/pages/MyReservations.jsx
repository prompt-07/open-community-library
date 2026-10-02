import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';

export default function MyReservations() {
  const { t } = useTranslation();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/reservations/mine')
      .then(setReservations)
      .catch(() => setReservations([]))
      .finally(() => setLoading(false));
  }, []);

  // Group by sessionDate (already sorted by the API).
  const groups = {};
  for (const r of reservations) {
    const key = new Date(r.sessionDate).toLocaleDateString();
    (groups[key] ||= []).push(r);
  }

  if (loading) return <p>{t('common.loading')}</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1>{t('nav.myReservations')}</h1>
      {reservations.length === 0 ? (
        <p style={{ opacity: 0.7 }}>You have no reservations yet.</p>
      ) : (
        Object.entries(groups).map(([date, list]) => (
          <section
            key={date}
            style={{ background: 'var(--color-surface)', border: '2px solid var(--color-ink)', borderRadius: 12, padding: '1.25rem' }}
          >
            <h2 style={{ marginTop: 0 }}>Session: {date}</h2>
            {list.map((r) => (
              <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0' }}>
                <span>
                  <strong>{r.book?.title}</strong> — {r.book?.author}
                </span>
                <StatusPill status={r.status} />
              </div>
            ))}
          </section>
        ))
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const colors = {
    pending: 'var(--color-accent)',
    approved: 'var(--color-available)',
    collected: 'var(--color-ink)',
    cancelled: 'var(--color-lent)',
  };
  return (
    <span
      style={{
        padding: '0.15rem 0.6rem',
        borderRadius: 999,
        border: `2px solid ${colors[status] || 'var(--color-ink)'}`,
        color: colors[status] || 'var(--color-ink)',
        fontWeight: 600,
        fontSize: '0.85rem',
        textTransform: 'capitalize',
      }}
    >
      {status}
    </span>
  );
}
