import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import { fieldStyle, formCard } from '../components/formStyles.js';

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={formCard}>
      <h1>{t('nav.register')}</h1>
      {error && <p style={{ color: 'var(--color-lent)', fontWeight: 600 }}>{error}</p>}
      <label>
        Name
        <input required value={form.name} onChange={set('name')} style={fieldStyle} />
      </label>
      <label>
        Email
        <input type="email" required value={form.email} onChange={set('email')} style={fieldStyle} />
      </label>
      <label>
        Password
        <input type="password" required minLength={6} value={form.password} onChange={set('password')} style={fieldStyle} />
      </label>
      <label>
        Phone
        <input value={form.phone} onChange={set('phone')} style={fieldStyle} />
      </label>
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? t('common.loading') : t('nav.register')}
      </button>
      <p>
        Already have an account? <Link to="/login">{t('nav.login')}</Link>
      </p>
    </form>
  );
}
