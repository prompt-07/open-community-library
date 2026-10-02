// Availability badge — never color alone: color + icon + bilingual text.
// Copy strings are exact from the guide's Design Reference:
//   Available: 🟢 Available | उपलब्ध
//   Lent out:  🔴 Lent Out | उसने दिलेले
export default function StatusBadge({ available }) {
  const isAvailable = Boolean(available);
  const label = isAvailable ? 'Available | उपलब्ध' : 'Lent Out | उसने दिलेले';
  const icon = isAvailable ? '🟢' : '🔴';
  const color = isAvailable ? 'var(--color-available)' : 'var(--color-lent)';

  return (
    <span
      role="status"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '0.25rem 0.6rem',
        borderRadius: 999,
        border: `2px solid ${color}`,
        color,
        fontWeight: 600,
        fontSize: '0.9rem',
        background: 'var(--color-surface)',
      }}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </span>
  );
}
