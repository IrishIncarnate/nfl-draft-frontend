import { memo } from 'react'
import { fmtRank, fmtNum, tierClass, positionColor } from '../../utils/formatting'
import './ProspectCard.css'

function ProspectCard({ prospect, draftInfo, teamInfo, onClick }) {
  const isDrafted = Boolean(draftInfo)
  const rank = prospect.consensus_rank != null ? Math.round(prospect.consensus_rank) : null
  const posRank = prospect.consensus_pos_rank != null ? Math.round(prospect.consensus_pos_rank) : null
  
  const rasNum = prospect.ras_score != null && prospect.ras_score !== '' ? parseFloat(prospect.ras_score) : null
  const hasRas = rasNum != null && !isNaN(rasNum) && rasNum > 0

  const rasClass = hasRas
    ? rasNum >= 8
      ? 'ras-badge-elite'
      : rasNum >= 5
      ? 'ras-badge-good'
      : 'ras-badge-poor'
    : ''

  const teamLogoUrl = teamInfo?.logo
    ? teamInfo.logo.startsWith('//')
      ? `https:${teamInfo.logo}`
      : teamInfo.logo
    : null

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.(prospect.id)
    }
  }

  return (
    <div
      className={`prospect-card ${isDrafted ? 'prospect-card--drafted' : ''}`}
      onClick={() => onClick?.(prospect.id)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${prospect.player}${isDrafted ? ` (Drafted pick ${draftInfo.overall_pick})` : ''}`}
    >
      {/* Drafted Banner / Header if drafted */}
      {isDrafted && (
        <div
          className="drafted-banner"
          style={{
            borderColor: teamInfo?.primaryColor ? `${teamInfo.primaryColor}88` : 'var(--color-border)',
          }}
        >
          {teamLogoUrl && (
            <img
              src={teamLogoUrl}
              alt={teamInfo?.abbreviation || 'NFL team'}
              className="drafted-team-logo"
              loading="lazy"
            />
          )}
          <span className="drafted-pick-text">
            {teamInfo?.abbreviation ? `${teamInfo.abbreviation} ` : ''}
            Pick #{draftInfo.overall_pick}
            {draftInfo.round ? ` (Rd ${draftInfo.round})` : ''}
          </span>
        </div>
      )}

      {/* Card Header: Rank & Badges */}
      <div className="card-top">
        <div className="card-rank-group">
          {rank != null && (
            <span className="card-rank" title={`Consensus Rank: ${fmtRank(prospect.consensus_rank)}`}>
              #{rank}
            </span>
          )}
          {posRank != null && (
            <span
              className="card-pos-rank"
              style={{ color: positionColor(prospect.position) }}
              title={`Positional Rank: ${posRank}`}
            >
              {prospect.position} {posRank}
            </span>
          )}
        </div>

        <div className="card-badges">
          {prospect.tier != null && (
            <span className={`badge ${tierClass(prospect.tier)} card-tier-badge`}>
              T{prospect.tier}
            </span>
          )}
          {hasRas && (
            <span
              className={`ras-badge ${rasClass}`}
              title={`RAS: ${fmtNum(prospect.ras_score, 2)}`}
            >
              RAS {fmtNum(prospect.ras_score, 2)}
            </span>
          )}
        </div>
      </div>

      {/* Card Body: Player Name */}
      <div className="card-name-row">
        <span className={`card-player-name ${isDrafted ? 'card-name--strikethrough' : ''}`}>
          {prospect.player}
        </span>
      </div>

      {/* Card Footer: College & Status */}
      <div className="card-footer">
        <span className="card-college" title={prospect.college || ''}>
          {prospect.college || '—'}
        </span>
        {prospect.status && prospect.status.toLowerCase() === 'pro' && (
          <span className="badge badge-pro card-status-badge">PRO</span>
        )}
      </div>
    </div>
  )
}

export default memo(ProspectCard)
