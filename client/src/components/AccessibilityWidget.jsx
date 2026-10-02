import { useSettings } from '../context/SettingsContext.jsx';

// Floating, fixed-position accessibility widget visible on every page:
// Font Scaler (A- / A+ / A++), High-Contrast toggle, Language toggle.
export default function AccessibilityWidget() {
  const { fontScale, setFontScale, highContrast, toggleContrast, lang, cycleLang } = useSettings();

  const scaleBtn = (level, label, title) => (
    <button
      type="button"
      onClick={() => setFontScale(level)}
      aria-pressed={fontScale === level}
      title={title}
      className="btn"
      style={{
        minHeight: 40,
        padding: '0.25rem 0.6rem',
        fontWeight: 700,
        background: fontScale === level ? 'var(--color-accent)' : 'var(--color-surface)',
        color: fontScale === level ? '#fff' : 'var(--color-ink)',
        border: '2px solid var(--color-ink)',
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      role="region"
      aria-label="Accessibility options"
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 12,
        background: 'var(--color-surface)',
        border: '2px solid var(--color-ink)',
        borderRadius: 12,
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      }}
    >
      <div style={{ display: 'flex', gap: 6 }}>
        {scaleBtn(0, 'A-', 'Base text size')}
        {scaleBtn(1, 'A+', 'Larger text')}
        {scaleBtn(2, 'A++', 'Largest text')}
      </div>
      <button
        type="button"
        onClick={toggleContrast}
        aria-pressed={highContrast}
        className="btn btn-secondary"
        style={{ minHeight: 40 }}
      >
        {highContrast ? 'Contrast: On' : 'High Contrast'}
      </button>
      <button
        type="button"
        onClick={cycleLang}
        className="btn btn-secondary"
        style={{ minHeight: 40 }}
        title="Change language"
      >
        Language: {lang.toUpperCase()}
      </button>
    </div>
  );
}
