import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import { fieldStyle, formCard } from '../components/formStyles.js';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [waking, setWaking] = useState(false);

  // Warm up the (possibly sleeping) backend the moment the page loads, so it's
  // likely awake by the time the user submits.
  useEffect(() => {
    api.get('/stats/public').catch(() => {});
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setWaking(false);
    setBusy(true);
    try {
      await login(email, password, () => setWaking(true));
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      setWaking(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={formCard}>
      <h1>{t('nav.login')}</h1>
      {error && <p style={{ color: 'var(--color-lent)', fontWeight: 600 }}>{error}</p>}
      {waking && (
        <p style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
          Waking up the server (free tier) — this can take up to a minute, please wait…
        </p>
      )}
      <label>
        Email
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={fieldStyle} />
      </label>
      <label>
        Password
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={fieldStyle} />
      </label>
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? (waking ? 'Waking up server…' : t('common.loading')) : t('nav.login')}
      </button>
      <p>
        No account? <Link to="/register">{t('nav.register')}</Link>
      </p>
    </form>
  );
}
