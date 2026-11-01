import './FilterPanel.css'

const POSITIONS = [
  'QB','RB','WR','TE','OT','OG','OC','EDGE','DT','LB','CB','S','K','P'
]

const TIERS = [1, 2, 3, 4, 5]

const SORT_OPTIONS = [
  { value: 'consensus_rank',     label: 'Consensus Overall' },
  { value: 'consensus_pos_rank', label: 'Consensus Position' },
  { value: 'schlitt_rank',       label: 'Erik Schlitt' },
  { value: 'pff_rank',           label: 'PFF' },
  { value: 'ras_score',          label: 'RAS Score' },
]

export default function FilterPanel({ filters, onChange }) {
  const { positions = [], status = '', tier = '', sortBy = 'consensus_rank', search = '' } = filters

  function togglePosition(pos) {
    const next = positions.includes(pos)
      ? positions.filter(p => p !== pos)
      : [...positions, pos]
    onChange({ ...filters, positions: next })
  }

  function clearAll() {
    onChange({ positions: [], status: '', tier: '', sortBy: 'consensus_rank', search: '' })
  }

  const hasFilters = positions.length > 0 || status || tier

  return (
    <aside className="filter-panel" aria-label="Filter controls">
      <div className="filter-panel-header">
        <span className="filter-panel-title">Filters</span>
        {hasFilters && (
          <button className="btn btn-ghost filter-clear" onClick={clearAll} aria-label="Clear all filters">
            Clear
          </button>
        )}
      </div>

      {/* Search */}
      <div className="filter-group">
        <label className="label" htmlFor="filter-search">Search</label>
        <input
          id="filter-search"
          className="input"
          placeholder="Player name…"
          value={search}
          onChange={e => onChange({ ...filters, search: e.target.value })}
          aria-label="Search by player name"
        />
      </div>

      {/* Sort */}
      <div className="filter-group">
        <label className="label" htmlFor="filter-sort">Sort By</label>
        <select
          id="filter-sort"
          className="select"
          value={sortBy}
          onChange={e => onChange({ ...filters, sortBy: e.target.value })}
          aria-label="Sort prospects by"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div className="filter-group">
        <span className="label">Status</span>
        <div className="filter-toggle-group" role="group" aria-label="Filter by status">
          {['', 'Prospect', 'Pro'].map(s => (
            <button
              key={s || 'all'}
              className={`btn ${status === s ? 'btn-active' : 'btn-ghost'} filter-toggle`}
              onClick={() => onChange({ ...filters, status: s })}
              aria-pressed={status === s}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Tier */}
      <div className="filter-group">
        <span className="label">Tier</span>
        <div className="filter-toggle-group" role="group" aria-label="Filter by tier">
          <button
            className={`btn ${!tier ? 'btn-active' : 'btn-ghost'} filter-toggle`}
            onClick={() => onChange({ ...filters, tier: '' })}
            aria-pressed={!tier}
          >
            All
          </button>
          {TIERS.map(t => (
            <button
              key={t}
              className={`btn ${tier === String(t) ? 'btn-active' : 'btn-ghost'} filter-toggle filter-toggle--tier`}
              onClick={() => onChange({ ...filters, tier: tier === String(t) ? '' : String(t) })}
              aria-pressed={tier === String(t)}
              style={tier === String(t) ? { '--tier-accent': `var(--tier-${t})` } : {}}
            >
              T{t}
            </button>
          ))}
        </div>
      </div>

      {/* Positions */}
      <div className="filter-group">
        <span className="label">Position</span>
        <div className="position-grid" role="group" aria-label="Filter by position">
          {POSITIONS.map(pos => (
            <button
              key={pos}
              className={`btn filter-pos-btn ${positions.includes(pos) ? 'filter-pos-btn--active' : ''}`}
              onClick={() => togglePosition(pos)}
              aria-pressed={positions.includes(pos)}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
