import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
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

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={formCard}>
      <h1>{t('nav.login')}</h1>
      {error && <p style={{ color: 'var(--color-lent)', fontWeight: 600 }}>{error}</p>}
      <label>
        Email
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={fieldStyle} />
      </label>
      <label>
        Password
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={fieldStyle} />
      </label>
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? t('common.loading') : t('nav.login')}
      </button>
      <p>
        No account? <Link to="/register">{t('nav.register')}</Link>
      </p>
    </form>
  );
}
