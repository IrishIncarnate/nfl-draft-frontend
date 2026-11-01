import { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { fmtRank, fmtNum, fmtInt, tierClass, statusClass, positionColor } from '../../utils/formatting'
import ProspectModal from '../ProspectModal/ProspectModal'
import './ProspectTable.css'

const columnHelper = createColumnHelper()

const RANK_COLS = [
  { key: 'consensus_rank', label: 'CON' },
  { key: 'consensus_pos_rank', label: 'POS' },
  { key: 'schlitt_rank', label: 'ES' },
  { key: 'pff_rank', label: 'PFF' },
  { key: 'jeremiah_rank', label: 'DJ' },
  { key: 'brugler_rank', label: 'BRU' },
  { key: 'mcshay_rank', label: 'McS' },
  { key: 'zierlein_rank', label: 'ZIE' },
]

export default function ProspectTable({ data }) {
  const [sorting, setSorting] = useState([{ id: 'consensus_rank', desc: false }])
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const columns = useMemo(() => [
    columnHelper.accessor('consensus_rank', {
      header: '#',
      size: 52,
      cell: info => {
        const val = info.getValue()
        return (
          <span className="rank-number">
            {val != null ? Math.round(val) : '—'}
          </span>
        )
      },
    }),
    columnHelper.accessor('player', {
      header: 'Player',
      size: 200,
      cell: info => (
        <span className="player-name">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('position', {
      header: 'POS',
      size: 60,
      cell: info => {
        const pos = info.getValue()
        return (
          <span
            className="pos-badge"
            style={{
              color: positionColor(pos),
              borderColor: `${positionColor(pos)}44`,
              background: `${positionColor(pos)}11`,
            }}
          >
            {pos || '—'}
          </span>
        )
      },
    }),
    columnHelper.accessor('college', {
      header: 'College',
      size: 140,
      cell: info => <span className="text-muted text-small">{info.getValue() || '—'}</span>,
    }),
    columnHelper.accessor('tier', {
      header: 'Tier',
      size: 60,
      cell: info => {
        const tier = info.getValue()
        return tier != null
          ? <span className={`badge ${tierClass(tier)}`}>T{tier}</span>
          : <span className="stat-null">—</span>
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      size: 88,
      cell: info => {
        const s = info.getValue()
        return s
          ? <span className={`badge ${statusClass(s)}`}>{s}</span>
          : null
      },
    }),
    // Expert rank columns
    ...RANK_COLS.map(({ key, label }) =>
      columnHelper.accessor(key, {
        header: label,
        size: 56,
        cell: info => {
          const v = info.getValue()
          return v != null
            ? <span className="rank-val">{fmtRank(v)}</span>
            : <span className="stat-null">—</span>
        },
      })
    ),
    columnHelper.accessor('ras_score', {
      header: 'RAS',
      size: 64,
      cell: info => {
        const v = info.getValue()
        if (v == null) return <span className="stat-null">—</span>
        const n = parseFloat(v)
        const cls = n >= 8 ? 'stat-good' : n >= 6 ? '' : n > 0 ? 'stat-warn' : 'stat-null'
        return <span className={cls}>{fmtNum(v, 2)}</span>
      },
    }),
    columnHelper.accessor('proj_rd', {
      header: 'Rd',
      size: 44,
      cell: info => {
        const v = info.getValue()
        return v != null ? <span className="text-muted text-small">{fmtInt(v)}</span> : <span className="stat-null">—</span>
      },
    }),
  ], [])

  const table = useReactTable({
    data: data ?? [],
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
  })

  return (
    <div className="prospect-table-wrapper">
      {/* Table search (local client-side filter on top of server results) */}
      <div className="table-toolbar">
        <input
          id="table-search"
          className="input table-search"
          placeholder="Filter visible rows…"
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          aria-label="Filter table rows"
        />
        <span className="table-count">
          {table.getFilteredRowModel().rows.length.toLocaleString()} players
        </span>
      </div>

      <div className="prospect-table-scroll">
        <table className="prospect-table" aria-label="Prospect database">
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(header => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className={header.column.getCanSort() ? 'sortable' : ''}
                    onClick={header.column.getToggleSortingHandler()}
                    aria-sort={
                      header.column.getIsSorted() === 'asc' ? 'ascending'
                      : header.column.getIsSorted() === 'desc' ? 'descending'
                      : 'none'
                    }
                  >
                    <span className="th-inner">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && <span className="sort-icon" aria-hidden>↑</span>}
                      {header.column.getIsSorted() === 'desc' && <span className="sort-icon" aria-hidden>↓</span>}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, i) => (
              <tr
                key={row.id}
                className={`table-row ${i % 2 === 0 ? 'row-even' : 'row-odd'}`}
                onClick={() => setSelectedId(row.original.id)}
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setSelectedId(row.original.id)}
                aria-label={`View details for ${row.original.player}`}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {table.getRowModel().rows.length === 0 && (
          <div className="table-empty">No prospects match your filters.</div>
        )}
      </div>

      {selectedId != null && (
        <ProspectModal
          prospectId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}
