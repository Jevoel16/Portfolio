import { bodies } from '../data/bodies'

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
