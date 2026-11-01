// src/utils/formatting.js
// Shared display helpers

export function fmtRank(val) {
  if (val == null) return '—'
  const n = parseFloat(val)
  return isNaN(n) ? '—' : n.toFixed(1)
}

export function fmtNum(val, decimals = 2) {
  if (val == null) return '—'
  const n = parseFloat(val)
  return isNaN(n) ? '—' : n.toFixed(decimals)
}

export function fmtInt(val) {
  if (val == null) return '—'
  const n = parseInt(val, 10)
  return isNaN(n) ? '—' : String(n)
}

export function tierClass(tier) {
  const t = parseInt(tier, 10)
  if (isNaN(t) || t < 1 || t > 5) return ''
  return `badge-tier-${Math.min(t, 5)}`
}

export function statusClass(status) {
  if (!status) return ''
  return status.toLowerCase() === 'pro' ? 'badge-pro' : 'badge-prospect'
}

// Position color accent lookup (for styling rows / position badges)
const POSITION_COLORS = {
  QB:   '#f87171',
  RB:   '#4ade80',
  WR:   '#60a5fa',
  TE:   '#a78bfa',
  OT:   '#f59e0b',
  OG:   '#fb923c',
  OC:   '#fbbf24',
  EDGE: '#34d399',
  DT:   '#22d3ee',
  LB:   '#818cf8',
  CB:   '#e879f9',
  S:    '#f472b6',
  K:    '#94a3b8',
  P:    '#94a3b8',
}

export function positionColor(pos) {
  return POSITION_COLORS[pos?.toUpperCase()] || '#94a3b8'
}

export function formatHeight(inches) {
  if (inches == null) return '—'
  const ft = Math.floor(inches / 12)
  const ins = (inches % 12).toFixed(1)
  return `${ft}'${ins}"`
}
