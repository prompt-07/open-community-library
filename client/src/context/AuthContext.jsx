import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api.js';

const AuthContext = createContext(null);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const me = await api.get('/auth/me');
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function login(email, password, onRetry) {
    // Retry only on network errors (backend cold-start wake-up). A real HTTP
    // error like 401 (wrong password) has err.status and is thrown immediately.
    // ~10 attempts x 4s ≈ 40s of patience — enough to outlast a Render free-tier
    // cold start (~20-50s). onRetry lets the UI show a "waking up" message.
    let lastErr;
    for (let attempt = 0; attempt < 10; attempt++) {
      try {
        await api.post('/auth/login', { email, password });
        await refresh();
        return;
      } catch (err) {
        if (err.status) throw err; // HTTP error (e.g. 401) — don't retry
        lastErr = err; // network error ("Failed to fetch") — backend likely waking
        onRetry?.(attempt + 1);
        await sleep(4000);
      }
    }
    throw lastErr;
  }

  async function register(payload) {
    await api.post('/auth/register', payload);
    // auto-login after successful registration
    await login(payload.email, payload.password);
  }

  async function logout() {
    await api.post('/auth/logout');
    setUser(null);
  }

  const value = { user, loading, isAdmin: user?.role === 'admin', login, register, logout, refresh };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
