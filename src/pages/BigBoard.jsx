import { useState, useMemo } from 'react'
import { useProspects, useLivePicks, useTeams } from '../hooks/useProspects'
import { normalizePlayerName, positionColor } from '../utils/formatting'
import ProspectCard from '../components/ProspectCard/ProspectCard'
import ProspectModal from '../components/ProspectModal/ProspectModal'
import './BigBoard.css'

// 11 Canonical positional waterfall columns
const WATERFALL_COLUMNS = [
  { key: 'QB', label: 'QB', fullName: 'Quarterbacks' },
  { key: 'RB', label: 'RB', fullName: 'Running Backs' },
  { key: 'WR', label: 'WR', fullName: 'Wide Receivers' },
  { key: 'TE', label: 'TE', fullName: 'Tight Ends' },
  { key: 'OT', label: 'OT', fullName: 'Offensive Tackles' },
  { key: 'IOL', label: 'IOL', fullName: 'Interior OL' },
  { key: 'EDGE', label: 'EDGE', fullName: 'Edge Rushers' },
  { key: 'DT', label: 'DT', fullName: 'Defensive Tackles' },
  { key: 'LB', label: 'LB', fullName: 'Linebackers' },
  { key: 'CB', label: 'CB', fullName: 'Cornerbacks' },
  { key: 'S', label: 'S', fullName: 'Safeties' },
]

// Mapping database positions to waterfall column keys
const POSITION_TO_COLUMN = {
  QB: 'QB',
  RB: 'RB',
  FB: 'RB',
  WR: 'WR',
  TE: 'TE',
  OT: 'OT',
  IOL: 'IOL',
  OG: 'IOL',
  OC: 'IOL',
  C: 'IOL',
  G: 'IOL',
  EDGE: 'EDGE',
  DE: 'EDGE',
  DT: 'DT',
  NT: 'DT',
  DL: 'DT',
  LB: 'LB',
  'OTB LB': 'LB',
  ILB: 'LB',
  OLB: 'LB',
  CB: 'CB',
  S: 'S',
  SAF: 'S',
  FS: 'S',
  SS: 'S',
}

const TIERS = [1, 2, 3, 4, 5]

export default function BigBoard() {
  const [selectedTier, setSelectedTier] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [hideDrafted, setHideDrafted] = useState(false)
  const [selectedProspectId, setSelectedProspectId] = useState(null)

  // Fetch top prospects sorted by consensus rank
  const { data: prospectsData, isLoading, isError, error, refetch: refetchProspects } = useProspects({
    limit: 1000,
    sort_by: 'consensus_rank',
    sort_dir: 'asc',
  })

  // Fetch live draft picks and team metadata
  const { data: livePicksData, refetch: refetchPicks } = useLivePicks(257)
  const { data: teamsData } = useTeams()

  // Build drafted player lookup: normalized name -> pick info
  const draftedMap = useMemo(() => {
    const map = new Map()
    if (livePicksData?.picks) {
      for (const pick of livePicksData.picks) {
        const key = normalizePlayerName(pick.player_name)
        if (key) {
          map.set(key, pick)
        }
      }
    }
    return map
  }, [livePicksData])

  // Build team lookup: team_id / abbr -> team info
  const teamsMap = useMemo(() => {
    const map = new Map()
    if (teamsData?.teams) {
      for (const team of teamsData.teams) {
        map.set(String(team.id), team)
        if (team.abbreviation) {
          map.set(team.abbreviation, team)
        }
      }
    }
    return map
  }, [teamsData])

  // Group and sort prospects into positional waterfall columns
  const waterfallColumnsData = useMemo(() => {
    const prospects = prospectsData?.prospects || []
    const searchLower = searchQuery.trim().toLowerCase()

    // Initialize columns
    const columns = WATERFALL_COLUMNS.map(col => ({
      ...col,
      prospects: [],
      totalCount: 0,
      availableCount: 0,
    }))

    const columnMap = new Map(columns.map(c => [c.key, c]))

    for (const p of prospects) {
      const posUpper = (p.position || '').toUpperCase().trim()
      const colKey = POSITION_TO_COLUMN[posUpper]
      if (!colKey || !columnMap.has(colKey)) continue

      const targetCol = columnMap.get(colKey)
      const normName = normalizePlayerName(p.player)
      const draftInfo = draftedMap.get(normName)
      const isDrafted = Boolean(draftInfo)

      targetCol.totalCount++
      if (!isDrafted) {
        targetCol.availableCount++
      }

      // Filter: Hide drafted if toggle is enabled
      if (hideDrafted && isDrafted) continue

      // Filter: Tier selection
      if (selectedTier && String(p.tier) !== String(selectedTier)) continue

      // Filter: Search query
      if (searchLower) {
        const nameMatch = (p.player || '').toLowerCase().includes(searchLower)
        const collegeMatch = (p.college || '').toLowerCase().includes(searchLower)
        if (!nameMatch && !collegeMatch) continue
      }

      targetCol.prospects.push({
        prospect: p,
        draftInfo,
        teamInfo: draftInfo ? teamsMap.get(String(draftInfo.team_id)) : null,
      })
    }

    // Sort prospects vertically within each column by consensus rank, then pos rank, then RAS
    for (const col of columns) {
      col.prospects.sort((a, b) => {
        const rankA = a.prospect.consensus_rank != null ? Number(a.prospect.consensus_rank) : 9999
        const rankB = b.prospect.consensus_rank != null ? Number(b.prospect.consensus_rank) : 9999
        if (rankA !== rankB) return rankA - rankB

        const posRankA = a.prospect.consensus_pos_rank != null ? Number(a.prospect.consensus_pos_rank) : 9999
        const posRankB = b.prospect.consensus_pos_rank != null ? Number(b.prospect.consensus_pos_rank) : 9999
        if (posRankA !== posRankB) return posRankA - posRankB

        const rasA = a.prospect.ras_score != null ? Number(a.prospect.ras_score) : -1
        const rasB = b.prospect.ras_score != null ? Number(b.prospect.ras_score) : -1
        if (rasA !== rasB) return rasB - rasA

        return (a.prospect.player || '').localeCompare(b.prospect.player || '')
      })
    }

    return columns
  }, [prospectsData, draftedMap, teamsMap, selectedTier, searchQuery, hideDrafted])

  // Draft overall summary stats
  const draftStats = useMemo(() => {
    const totalDrafted = draftedMap.size
    const totalVisible = waterfallColumnsData.reduce((acc, col) => acc + col.prospects.length, 0)
    return {
      totalDrafted,
      totalVisible,
    }
  }, [draftedMap, waterfallColumnsData])

  const handleRefresh = () => {
    refetchProspects()
    refetchPicks()
  }

  const clearFilters = () => {
    setSelectedTier('')
    setSearchQuery('')
    setHideDrafted(false)
  }

  const hasActiveFilters = Boolean(selectedTier || searchQuery || hideDrafted)

  return (
    <div className="big-board-page">
      {/* Top Header & Live Status */}
      <div className="big-board-header">
        <div>
          <h1 className="page-title">Live Big Board</h1>
          <p className="page-subtitle">
            Positional waterfall draft board with real-time draft pick tracking
          </p>
        </div>

        <div className="big-board-status-group">
          <div className="live-pill" title="Live draft tracking active">
            <span className="live-dot" />
            <span className="live-label">Draft Tracker</span>
            <span className="live-pick-count">
              {draftStats.totalDrafted} / 257 Picks
            </span>
          </div>

          <button
            className="btn btn-ghost refresh-btn"
            onClick={handleRefresh}
            title="Refresh board and live picks"
            aria-label="Refresh data"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.19" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Filter & Control Toolbar */}
      <div className="big-board-toolbar">
        {/* Search */}
        <div className="toolbar-search-wrapper">
          <svg className="toolbar-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="input toolbar-search-input"
            placeholder="Search player or college…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search prospects"
          />
          {searchQuery && (
            <button
              className="toolbar-search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Tier Filter */}
        <div className="toolbar-group">
          <span className="toolbar-label">Tier:</span>
          <div className="toolbar-toggle-pills" role="group" aria-label="Filter by tier">
            <button
              className={`toolbar-pill ${!selectedTier ? 'toolbar-pill--active' : ''}`}
              onClick={() => setSelectedTier('')}
              aria-pressed={!selectedTier}
            >
              All
            </button>
            {TIERS.map(t => (
              <button
                key={t}
                className={`toolbar-pill ${selectedTier === String(t) ? 'toolbar-pill--active' : ''}`}
                onClick={() => setSelectedTier(selectedTier === String(t) ? '' : String(t))}
                aria-pressed={selectedTier === String(t)}
              >
                T{t}
              </button>
            ))}
          </div>
        </div>

        {/* Hide Drafted Toggle */}
        <div className="toolbar-toggle-wrapper">
          <button
            type="button"
            className={`btn ${hideDrafted ? 'btn-primary' : 'btn-ghost'} toggle-drafted-btn`}
            onClick={() => setHideDrafted(prev => !prev)}
            aria-pressed={hideDrafted}
          >
            <span className={`toggle-switch-indicator ${hideDrafted ? 'is-active' : ''}`} />
            Hide Drafted ({draftStats.totalDrafted})
          </button>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button className="btn btn-ghost clear-btn" onClick={clearFilters}>
            Reset Filters
          </button>
        )}

        {/* Visible count indicator */}
        <div className="toolbar-count">
          Showing <strong>{draftStats.totalVisible}</strong> players
        </div>
      </div>

      {/* Board Body / Waterfall Grid */}
      <div className="big-board-content">
        {isLoading && (
          <div className="state-container loading-state">
            <div className="spinner" />
            <p>Loading Big Board prospects...</p>
          </div>
        )}

        {isError && (
          <div className="state-container error-state">
            <p className="error-msg">⚠️ Unable to load Big Board data: {error?.message || 'Server error'}</p>
            <button className="btn btn-secondary" onClick={() => refetchProspects()}>
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="waterfall-scroll-container">
            <div className="waterfall-grid">
              {waterfallColumnsData.map(col => {
                const color = positionColor(col.key)
                return (
                  <div key={col.key} className="waterfall-column">
                    {/* Sticky Column Header */}
                    <div
                      className="waterfall-column-header"
                      style={{ borderTopColor: color }}
                    >
                      <div className="column-header-title-row">
                        <span className="column-pos-code" style={{ color }}>
                          {col.label}
                        </span>
                        <span className="column-count-badge" title={`${col.availableCount} available / ${col.totalCount} total`}>
                          {col.prospects.length}
                        </span>
                      </div>
                      <span className="column-full-name">{col.fullName}</span>
                    </div>

                    {/* Column Stack of Cards */}
                    <div className="waterfall-cards-list">
                      {col.prospects.map(({ prospect, draftInfo, teamInfo }) => (
                        <ProspectCard
                          key={prospect.id}
                          prospect={prospect}
                          draftInfo={draftInfo}
                          teamInfo={teamInfo}
                          onClick={setSelectedProspectId}
                        />
                      ))}

                      {col.prospects.length === 0 && (
                        <div className="column-empty">
                          No players match filters
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Prospect Detail Modal */}
      {selectedProspectId != null && (
        <ProspectModal
          prospectId={selectedProspectId}
          onClose={() => setSelectedProspectId(null)}
        />
      )}
    </div>
  )
}
