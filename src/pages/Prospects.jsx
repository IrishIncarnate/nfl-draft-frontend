import { useState } from 'react'
import { useProspects, useSummary } from '../hooks/useProspects'
import FilterPanel from '../components/FilterPanel/FilterPanel'
import ProspectTable from '../components/ProspectTable/ProspectTable'
import './Prospects.css'

export default function Prospects() {
  const [filters, setFilters] = useState({
    positions: [],
    status: '',
    tier: '',
    sortBy: 'consensus_rank',
    search: '',
  })

  // Format params for backend API
  const queryParams = {
    ...filters,
    positions: filters.positions.length > 0 ? filters.positions.join(',') : undefined,
  }

  const { data, isLoading, isError, error, refetch } = useProspects(queryParams)
  const { data: summary } = useSummary()

  return (
    <div className="prospects-page">
      {/* Page Header / Stat Cards */}
      <div className="page-header">
        <div>
          <h1 className="page-title">2026 NFL Draft Prospects</h1>
          <p className="page-subtitle">
            Consensus and expert rankings, athletic measurements, and RAS scores
          </p>
        </div>

        {summary && (
          <div className="summary-pills">
            <div className="summary-pill">
              <span className="summary-val">{summary.total_prospects?.toLocaleString() ?? '—'}</span>
              <span className="summary-lbl">Total Prospects</span>
            </div>
            <div className="summary-pill">
              <span className="summary-val">{summary.with_ras_count?.toLocaleString() ?? '—'}</span>
              <span className="summary-lbl">With RAS</span>
            </div>
            <div className="summary-pill">
              <span className="summary-val">
                {summary.avg_ras != null ? summary.avg_ras.toFixed(2) : '—'}
              </span>
              <span className="summary-lbl">Avg RAS</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="prospects-layout">
        <FilterPanel filters={filters} onChange={setFilters} />

        <div className="prospects-table-container">
          {isLoading && (
            <div className="state-container loading-state">
              <div className="spinner" />
              <p>Loading prospect data...</p>
            </div>
          )}

          {isError && (
            <div className="state-container error-state">
              <p className="error-msg">⚠️ Unable to load prospects: {error?.message || 'Server error'}</p>
              <button className="btn btn-secondary" onClick={() => refetch()}>
                Retry
              </button>
            </div>
          )}

          {!isLoading && !isError && (
            <ProspectTable data={data?.prospects || []} />
          )}
        </div>
      </div>
    </div>
  )
}
