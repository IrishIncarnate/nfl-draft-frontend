import { useEffect, useRef } from 'react'
import { useProspectDetail } from '../../hooks/useProspects'
import { fmtNum, fmtRank, fmtInt, tierClass, statusClass, positionColor, formatHeight } from '../../utils/formatting'
import './ProspectModal.css'

const EXPERT_RANKS = [
  { key: 'consensus_rank',     label: 'Consensus Overall' },
  { key: 'consensus_pos_rank', label: 'Consensus Position' },
  { key: 'schlitt_rank',       label: 'Erik Schlitt' },
  { key: 'schlitt_pos_rank',   label: 'Schlitt Position' },
  { key: 'pff_rank',           label: 'PFF' },
  { key: 'jeremiah_rank',      label: 'Jeremiah' },
  { key: 'brugler_rank',       label: 'Brugler' },
  { key: 'brugler_pos_rank',   label: 'Brugler Position' },
  { key: 'mcshay_rank',        label: 'McShay' },
  { key: 'zierlein_rank',      label: 'Zierlein' },
  { key: 'reid_rank',          label: 'Reid' },
]

const ATHLETIC_METRICS = [
  { key: 'height_string',   label: 'Height' },
  { key: 'weight',          label: 'Weight (lbs)', fmt: v => fmtInt(v) },
  { key: 'hand_size',       label: 'Hand Size', fmt: v => `${fmtNum(v, 2)}"` },
  { key: 'arm_length',      label: 'Arm Length', fmt: v => `${fmtNum(v, 2)}"` },
  { key: 'wingspan',        label: 'Wingspan', fmt: v => `${fmtNum(v, 2)}"` },
  { key: '40_yard_official',label: '40 Yard (Official)', fmt: v => fmtNum(v, 2) },
  { key: '40_yard_proday',  label: '40 Yard (Pro Day)', fmt: v => fmtNum(v, 2) },
  { key: '10_yard_split',   label: '10 Yard Split', fmt: v => fmtNum(v, 2) },
  { key: 'vertical_jump',   label: 'Vertical Jump', fmt: v => `${fmtNum(v, 1)}"` },
  { key: 'broad_jump_inches', label: 'Broad Jump', fmt: v => `${fmtInt(v)}"` },
  { key: 'bench_press',     label: 'Bench Press', fmt: v => `${fmtInt(v)} reps` },
  { key: 'three_cone',      label: '3-Cone', fmt: v => fmtNum(v, 2) },
  { key: 'short_shuttle',   label: 'Short Shuttle', fmt: v => fmtNum(v, 2) },
  { key: 'ras_score',       label: 'RAS Score', fmt: v => fmtNum(v, 2) },
  { key: 'speed_score',     label: 'Speed Score', fmt: v => fmtNum(v, 1) },
  { key: 'burst_rate',      label: 'Burst Rate', fmt: v => fmtNum(v, 1) },
]

export default function ProspectModal({ prospectId, onClose }) {
  const { data, isLoading, error } = useProspectDetail(prospectId)
  const modalRef = useRef(null)

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Focus trap
  useEffect(() => {
    modalRef.current?.focus()
  }, [])

  const p = data?.prospect

  return (
    <div
      className="modal-backdrop"
      onClick={e => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={p ? `Scouting profile for ${p.player}` : 'Loading prospect'}
    >
      <div className="modal-panel" ref={modalRef} tabIndex={-1}>
        {/* Header */}
        <div className="modal-header">
          {p && (
            <div
              className="modal-position-bar"
              style={{ background: `${positionColor(p.position)}22`, borderColor: `${positionColor(p.position)}44` }}
            />
          )}
          <div className="modal-title-area">
            {p ? (
              <>
                <h2 className="modal-player-name">{p.player}</h2>
                <div className="modal-meta">
                  <span
                    className="pos-badge"
                    style={{
                      color: positionColor(p?.position),
                      borderColor: `${positionColor(p?.position)}44`,
                      background: `${positionColor(p?.position)}11`,
                    }}
                  >
                    {p.position}
                  </span>
                  <span className="text-muted text-small">{p.college}</span>
                  {p.tier && <span className={`badge ${tierClass(p.tier)}`}>Tier {p.tier}</span>}
                  {p.status && <span className={`badge ${statusClass(p.status)}`}>{p.status}</span>}
                  {p.year && <span className="text-muted text-small">{p.year}</span>}
                </div>
              </>
            ) : (
              <div className="modal-player-name">Loading…</div>
            )}
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close prospect detail"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {isLoading && (
            <div className="loading-center">
              <div className="spinner" />
              <span>Loading scout profile…</span>
            </div>
          )}

          {error && (
            <div className="error-state">
              <span>⚠️ Failed to load prospect: {error.message}</span>
            </div>
          )}

          {p && (
            <div className="modal-sections">
              {/* Expert Rankings */}
              <section className="modal-section">
                <h3 className="modal-section-title">Expert Rankings</h3>
                <div className="ranks-grid">
                  {EXPERT_RANKS.map(({ key, label }) => {
                    const val = p[key]
                    return (
                      <div key={key} className="rank-card">
                        <span className="rank-card-label">{label}</span>
                        <span className={`rank-card-value ${val == null ? 'stat-null' : ''}`}>
                          {val != null ? fmtRank(val) : '—'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </section>

              {/* Athletic Profile */}
              <section className="modal-section">
                <h3 className="modal-section-title">
                  Athletic Profile
                  {p.ras_link && (
                    <a
                      href={p.ras_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="modal-ras-link"
                    >
                      View RAS ↗
                    </a>
                  )}
                </h3>
                <div className="metrics-grid">
                  {ATHLETIC_METRICS.map(({ key, label, fmt }) => {
                    const val = p[key]
                    const display = val != null ? (fmt ? fmt(val) : String(val)) : null
                    return (
                      <div key={key} className="metric-row">
                        <span className="metric-label">{label}</span>
                        <span className={`metric-value ${display == null ? 'stat-null' : ''}`}>
                          {display ?? '—'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </section>

              {/* Scouting Attributes */}
              {(p.superpower || p.nfl_type || p.grit_tier) && (
                <section className="modal-section">
                  <h3 className="modal-section-title">Scouting Profile</h3>
                  <div className="scout-attrs">
                    {p.superpower && (
                      <div className="scout-attr">
                        <span className="label">Superpower</span>
                        <span className="scout-attr-value">{p.superpower}</span>
                      </div>
                    )}
                    {p.nfl_type && (
                      <div className="scout-attr">
                        <span className="label">NFL Type</span>
                        <span className="scout-attr-value">{p.nfl_type}</span>
                      </div>
                    )}
                    {p.grit_tier && (
                      <div className="scout-attr">
                        <span className="label">Grit Tier</span>
                        <span className="scout-attr-value">{p.grit_tier}</span>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Data Lineage */}
              {data?.measurements_by_source?.length > 0 && (
                <section className="modal-section">
                  <h3 className="modal-section-title">Data Sources</h3>
                  <p className="text-muted text-small" style={{ marginBottom: 'var(--space-md)' }}>
                    Showing which source provided each measurement (higher weight = higher priority).
                  </p>
                  <div className="lineage-table-wrapper">
                    <table className="lineage-table">
                      <thead>
                        <tr>
                          <th>Source</th>
                          <th>Priority</th>
                          <th>Metric</th>
                          <th>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.measurements_by_source.map((row, i) => (
                          <tr key={i}>
                            <td><span className="badge badge-prospect">{row.source_name}</span></td>
                            <td className="text-mono">{row.source_priority}</td>
                            <td className="text-muted">{row.metric_name}</td>
                            <td className="text-mono">{row.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
