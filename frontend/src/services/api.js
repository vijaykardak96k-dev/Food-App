// The only place that talks to the backend. Adds the JWT token and turns errors into friendly messages.
export const API_ORIGIN = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const TOKEN_KEY = 'cravo_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// AuthContext registers a function here so an expired token logs the user out everywhere.
let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request(path, { method = 'GET', body, formData } = {}) {
  const headers = {};
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (formData) {
    payload = formData; // the browser sets the multipart Content-Type itself
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_ORIGIN}/api${path}`, { method, headers, body: payload });
  } catch {
    throw new ApiError('Cannot reach the server. Make sure the backend is running on port 5000.', 0);
  }

  let data = null;
  try { data = await response.json(); } catch { /* empty or non-JSON body */ }

  if (!response.ok) {
    // an expired token, or an account an admin has deactivated, ends the session
    if ((response.status === 401 || data?.code === 'ACCOUNT_DEACTIVATED') && token && onUnauthorized) onUnauthorized();
    throw new ApiError(data?.message || 'Something went wrong. Please try again.', response.status, data?.code);
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
  upload: (path, formData, method = 'POST') => request(path, { method, formData }),
};

// Images are stored on the backend (/images for samples, /uploads for restaurant uploads).
export function imageUrl(path) {
  if (!path) return `${API_ORIGIN}/images/placeholder.svg`;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}
