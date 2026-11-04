import { Link } from 'react-router'
import { bodies } from '../data/bodies'
import { openTerminal } from '../hud/CommandTerminal'

interface Props {
  selectedId: string | null
  onSelect: (id: string) => void
}

/** Top HUD bar: brand, plus shortcuts that fly to each celestial body. */
export function Header({ selectedId, onSelect }: Props) {
  return (
    <header className="header">
      <span className="brand">
        <svg viewBox="0 0 32 32" width="20" height="20" aria-hidden="true">
          <path d="M16 3l3 10 10 3-10 3-3 10-3-10-10-3 10-3z" fill="var(--gold)" />
        </svg>
        <span>Sprucetrap</span>
      </span>
      <nav className="nav" aria-label="Sections">
        <button type="button" className="hud-chip terminal-chip mono" onClick={openTerminal} aria-label="Open command terminal" title="Command terminal (⌘K or /)">
          <span aria-hidden="true">&gt;_</span>
          <kbd>⌘K</kbd>
        </button>
        <Link to="/blog" className="hud-chip" style={{ '--accent': 'var(--signal)' } as React.CSSProperties}>
          <span className="blog-icon" aria-hidden="true" />
          Blog
        </Link>
        {bodies.map((b) => (
          <button
            key={b.id}
            type="button"
            className={`hud-chip${selectedId === b.id ? ' active' : ''}`}
            style={{ '--accent': b.color } as React.CSSProperties}
            aria-pressed={selectedId === b.id}
            onClick={() => onSelect(b.id)}
          >
            <span className={`body-icon ${b.kind}`} aria-hidden="true" />
            {b.name}
          </button>
        ))}
      </nav>
    </header>
  )
}
