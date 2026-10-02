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

  async function login(email, password) {
    // Retry only on network errors (backend cold-start wake-up). A real HTTP
    // error like 401 (wrong password) has err.status and is thrown immediately.
    let lastErr;
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        await api.post('/auth/login', { email, password });
        await refresh();
        return;
      } catch (err) {
        if (err.status) throw err; // HTTP error (e.g. 401) — don't retry
        lastErr = err; // network error ("Failed to fetch") — backend likely waking
        await sleep(3000);
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
