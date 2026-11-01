// src/api/client.js
// Central API client — all fetch calls go through here

const BASE_URL = import.meta.env.VITE_API_URL || ''
// In dev, Vite proxy handles /api → localhost:8000
// In prod, set VITE_API_URL=https://your-render-app.onrender.com

export async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `Request failed: ${res.status}`)
  }
  return res.json()
}

// --- Prospects ---
export const getProspects = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString()
  return apiFetch(`/api/prospects${qs ? `?${qs}` : ''}`)
}

export const getProspectDetail = (id) => apiFetch(`/api/prospects/${id}`)
export const getPositions = () => apiFetch('/api/prospects/positions')
export const getSummary = () => apiFetch('/api/prospects/summary')

// --- Live Picks ---
export const getLivePicks = (maxPick = 257) =>
  apiFetch(`/api/live-picks?max_pick=${maxPick}`)

export const getTeams = () => apiFetch('/api/teams')

// --- Health ---
export const getHealth = () => apiFetch('/api/health')
