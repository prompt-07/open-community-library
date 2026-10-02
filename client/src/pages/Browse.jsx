import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import { GENRES, LANGUAGES } from '../constants.js';
import BookCard from '../components/BookCard.jsx';

export default function Browse() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('');
  const [genre, setGenre] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Debounced fetch whenever any filter changes.
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (language) params.set('language', language);
      if (genre) params.set('genre', genre);
      if (availableOnly) params.set('available', 'true');
      params.set('limit', '50');
      try {
        const data = await api.get(`/books?${params.toString()}`);
        setBooks(data.items);
      } catch {
        setBooks([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, language, genre, availableOnly]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h1>{t('nav.browse')}</h1>

      {/* Search bar */}
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t('browse.searchPlaceholder')}
        aria-label={t('browse.searchPlaceholder')}
        style={{
          padding: '0.75rem 1rem',
          fontSize: '1rem',
          borderRadius: 10,
          border: '2px solid var(--color-ink)',
          background: 'var(--color-surface)',
          color: 'var(--color-ink)',
        }}
      />

      {/* Filter chips */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <ChipRow label={t('browse.language')}>
          <Chip active={language === ''} onClick={() => setLanguage('')}>
            {t('browse.showAll')}
          </Chip>
          {LANGUAGES.map((l) => (
            <Chip key={l} active={language === l} onClick={() => setLanguage(l)}>
              {l}
            </Chip>
          ))}
        </ChipRow>

        <ChipRow label={t('browse.genre')}>
          <Chip active={genre === ''} onClick={() => setGenre('')}>
            {t('browse.showAll')}
          </Chip>
          {GENRES.map((g) => (
            <Chip key={g} active={genre === g} onClick={() => setGenre(g)}>
              {g}
            </Chip>
          ))}
        </ChipRow>

        <ChipRow label={t('browse.availability')}>
          <Chip active={!availableOnly} onClick={() => setAvailableOnly(false)}>
            {t('browse.showAll')}
          </Chip>
          <Chip active={availableOnly} onClick={() => setAvailableOnly(true)}>
            {t('browse.availableOnly')}
          </Chip>
        </ChipRow>
      </div>

      {/* Results */}
      {loading ? (
        <p>{t('common.loading')}</p>
      ) : books.length === 0 ? (
        <p style={{ fontWeight: 600 }}>{t('browse.noBooks')}</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          {books.map((b) => (
            <BookCard key={b._id} book={b} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChipRow({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span style={{ fontWeight: 700, minWidth: 90 }}>{label}:</span>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        padding: '0.35rem 0.85rem',
        borderRadius: 999,
        border: '2px solid var(--color-ink)',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.9rem',
        background: active ? 'var(--color-accent)' : 'var(--color-surface)',
        color: active ? '#fff' : 'var(--color-ink)',
      }}
    >
      {children}
    </button>
  );
}
