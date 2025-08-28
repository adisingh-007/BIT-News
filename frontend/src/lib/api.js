// Centralized API helper to handle base URL across environments
// Uses VITE_API_BASE_URL if provided (e.g., https://your-domain.com), otherwise '' for same-origin

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || ""

export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`
  const res = await fetch(url, {
    // include cookies when talking to same-origin or configured domain
    credentials: 'include',
    ...options,
  })
  return res
}

export function apiUrl(path) {
  return path.startsWith("http") ? path : `${API_BASE}${path}`
}