// Thin fetch wrapper for the Open Library API. Always sends cookies so the
// httpOnly JWT is included on authenticated requests.
//
// In production the API is served same-origin via a Vercel rewrite proxy
// (/api/* -> Render). This keeps the auth cookie first-party, so it works even
// in browsers that block third-party cookies (Safari, Brave, hardened Chrome).
// Local dev talks to the backend directly on :5000.
const BASE = import.meta.env.PROD
  ? '/api'
  : import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

async function request(path, { method = 'GET', body, headers } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message = (isJson && data?.error) || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return data;
}

// Multipart image upload (admin). Returns { url, publicId }.
async function uploadImage(file) {
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch(`${BASE}/upload`, { method: 'POST', credentials: 'include', body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Upload failed (${res.status})`);
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
  uploadImage,
  base: BASE,
};
