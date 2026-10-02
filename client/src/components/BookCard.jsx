import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StatusBadge from './StatusBadge.jsx';
import RatingStars from './RatingStars.jsx';

// Grid card: cover, title/author, rating stars, availability badge, See Details.
export default function BookCard({ book }) {
  const { t } = useTranslation();
  const available = book.availableCopies > 0;

  return (
    <article
      style={{
        background: 'var(--color-surface)',
        border: '2px solid var(--color-ink)',
        borderRadius: 12,
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div
        style={{
          height: 180,
          borderRadius: 8,
          background: 'var(--color-parchment-alt)',
          border: '2px dashed var(--color-ink)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          textAlign: 'center',
          padding: 8,
        }}
      >
        {book.coverImageUrl ? (
          <img
            src={book.coverImageUrl}
            alt={book.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontSize: '0.85rem' }}>{book.title}</span>
        )}
      </div>

      <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{book.title}</h3>
      <p style={{ margin: 0, fontWeight: 600 }}>{book.author}</p>
      <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>
        {book.language} · {book.genre}
      </p>

      <RatingStars average={book.ratingAverage} count={book.ratingCount} />
      <StatusBadge available={available} />

      <Link to={`/book/${book._id}`} className="btn btn-secondary" style={{ marginTop: 'auto' }}>
        {t('browse.seeDetails')}
      </Link>
    </article>
  );
}
