import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const { t } = useTranslation();
  const [bookOfWeek, setBookOfWeek] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Retry a few times to ride out the backend's cold start (free tier can take
    // ~50s to wake). A 404 on book-of-week is a real "none set", not a failure.
    async function fetchWithRetry(path, { tries = 4, allow404 = false } = {}) {
      for (let i = 0; i < tries; i++) {
        try {
          return await api.get(path);
        } catch (err) {
          if (allow404 && err.status === 404) return null;
          if (i === tries - 1) throw err;
          await sleep(3000);
        }
      }
    }

    (async () => {
      const [bow, s] = await Promise.all([
        fetchWithRetry('/books/book-of-week', { allow404: true }).catch(() => null),
        fetchWithRetry('/stats/public').catch(() => null),
      ]);
      if (cancelled) return;
      setBookOfWeek(bow);
      setStats(s);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Banner */}
      <section
        style={{
          background: 'var(--color-surface)',
          border: '2px solid var(--color-ink)',
          borderRadius: 16,
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <img
          src="/logo-main.png"
          alt="मुक्त वाचनालय — The Open Library"
          style={{ width: 'min(240px, 60vw)', height: 'auto', margin: '0 auto 0.5rem' }}
        />
        <h1>{t('home.heroTitle')}</h1>
        <p style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>{t('home.heroSubtitle')}</p>
        <Link to="/browse" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
          Browse Books | पुस्तके पहा
        </Link>
      </section>

      {/* Book of the Week */}
      <section>
        <h2>{t('home.bookOfWeek')}</h2>
        {loading ? (
          <p style={{ opacity: 0.7 }}>{t('common.loading')}</p>
        ) : bookOfWeek ? (
          <article
            style={{
              display: 'flex',
              gap: '1.5rem',
              background: 'var(--color-surface)',
              border: '2px solid var(--color-ink)',
              borderRadius: 16,
              padding: '1.5rem',
              flexWrap: 'wrap',
            }}
          >
            <BookCover book={bookOfWeek} />
            <div style={{ flex: 1, minWidth: 240 }}>
              <h3 style={{ marginTop: 0 }}>{bookOfWeek.title}</h3>
              <p style={{ fontWeight: 600 }}>{bookOfWeek.author}</p>
              {bookOfWeek.adminReview && (
                <p style={{ fontStyle: 'italic' }}>
                  “{bookOfWeek.adminReview.slice(0, 160)}
                  {bookOfWeek.adminReview.length > 160 ? '…' : ''}”
                </p>
              )}
              {bookOfWeek.orientationTags?.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  {bookOfWeek.orientationTags.map((tag) => (
                    <TagChip key={tag} label={tag} />
                  ))}
                </div>
              )}
              <div style={{ marginTop: '1rem' }}>
                <Link to={`/book/${bookOfWeek._id}`} className="btn btn-secondary">
                  {t('browse.seeDetails')}
                </Link>
              </div>
            </div>
          </article>
        ) : (
          <p style={{ opacity: 0.7 }}>No Book of the Week is currently featured.</p>
        )}
      </section>

      {/* Impact Stats Bar */}
      <section>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
          }}
        >
          <StatCard label={t('home.impact.totalBooks')} value={stats?.totalBooks} loading={loading} />
          <StatCard label={t('home.impact.activeReaders')} value={stats?.activeReaders} loading={loading} />
          <StatCard label={t('home.impact.booksIssued')} value={stats?.booksIssuedToDate} loading={loading} />
        </div>
      </section>
    </div>
  );
}

function BookCover({ book }) {
  if (book.coverImageUrl) {
    return (
      <img
        src={book.coverImageUrl}
        alt={book.title}
        style={{ width: 140, height: 200, objectFit: 'cover', borderRadius: 8 }}
      />
    );
  }
  return (
    <div
      style={{
        width: 140,
        height: 200,
        borderRadius: 8,
        background: 'var(--color-parchment-alt)',
        border: '2px dashed var(--color-ink)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 8,
        fontSize: '0.85rem',
      }}
    >
      {book.title}
    </div>
  );
}

function TagChip({ label }) {
  return (
    <span
      style={{
        padding: '0.2rem 0.6rem',
        borderRadius: 999,
        background: 'var(--color-parchment-alt)',
        border: '1px solid var(--color-accent)',
        color: 'var(--color-accent)',
        fontSize: '0.85rem',
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}

function StatCard({ label, value, loading }) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '2px solid var(--color-ink)',
        borderRadius: 12,
        padding: '1.25rem',
        textAlign: 'center',
      }}
    >
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-accent)' }}>
        {loading ? '…' : (value ?? '—')}
      </div>
      <div style={{ fontWeight: 600 }}>{label}</div>
    </div>
  );
}
