import { NavLink } from 'react-router-dom'
import './AppHeader.css'

const NAV_ITEMS = [
  { to: '/board', label: 'Big Board' },
  { to: '/prospects', label: 'Prospect DB' },
  // Future routes:
  // { to: '/live', label: '🔴 Live Draft' },
  // { to: '/time-machine', label: 'Time Machine' },
]

export default function AppHeader() {
  return (
    <header className="app-header" role="banner">
      <div className="header-brand">
        <span className="header-logo" aria-hidden="true">🏈</span>
        <div className="header-brand-text">
          <span className="header-title">DLB Draft Board</span>
          <span className="header-subtitle">2026 NFL Draft</span>
        </div>
      </div>

      <nav className="header-nav" aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `header-nav-link ${isActive ? 'header-nav-link--active' : ''}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="header-actions">
        <a
          href="https://github.com/IrishIncarnate/nfl-draft-app"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost header-gh-link"
          aria-label="View source on GitHub"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.38 7.86 10.9.57.1.78-.25.78-.55v-2.02c-3.19.69-3.86-1.54-3.86-1.54-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.24 3.33.95.1-.74.4-1.24.72-1.52-2.55-.29-5.23-1.27-5.23-5.67 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.14 1.17a10.9 10.9 0 0 1 2.86-.38c.97.01 1.95.13 2.86.38 2.18-1.48 3.14-1.17 3.14-1.17.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.07 0 4.41-2.69 5.38-5.25 5.66.41.36.78 1.06.78 2.13v3.16c0 .31.21.66.79.55C20.21 21.38 23.5 17.08 23.5 12 23.5 5.73 18.27.5 12 .5z"/>
          </svg>
          GitHub
        </a>
      </div>
    </header>
  )
}
