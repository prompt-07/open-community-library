// Displays a 0–5 rating as filled/empty stars plus the numeric average and count.
export default function RatingStars({ average = 0, count = 0 }) {
  const rounded = Math.round(average);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.95rem' }}>
      <span aria-hidden="true" style={{ color: 'var(--color-accent)', letterSpacing: 1 }}>
        {'★'.repeat(rounded)}
        {'☆'.repeat(5 - rounded)}
      </span>
      <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>
        {count > 0 ? `${average.toFixed(1)} (${count})` : 'No ratings'}
      </span>
    </div>
  );
}
