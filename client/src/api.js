// Thin fetch wrapper for the Open Library API. Always sends cookies so the
// httpOnly JWT is included on authenticated requests.
const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

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
    throw new Error(message);
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
