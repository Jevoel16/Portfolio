import { Link } from 'react-router'
import { bodyById, type BodyId } from '../data/bodies'
import { setMotion, useReducedMotion } from '../hooks/useMotion'
import { openTerminal } from '../hud/CommandTerminal'
import { hrefForSection, SECTION_LABELS, type SectionId } from '../scroll/sections'

/** Sections with a chip in the top bar; Home is the brand and Write-ups sit under Blog. */
const NAV: SectionId[] = ['about', 'projects', 'toolkit', 'contact']

const accentFor = (id: SectionId) => bodyById.get(id as BodyId)?.color ?? 'var(--gold)'

/** Sticky HUD bar: brand, the section chips (active one lit), the blog and the terminal. */
export function Header({ active }: { active: SectionId }) {
  return (
    <header className="header" data-scroll-var>
      <Link to="/" className="brand" aria-label="Sprucetrap, back to the top">
        <svg viewBox="0 0 32 32" width="20" height="20" aria-hidden="true">
          <path d="M16 3l3 10 10 3-10 3-3 10-3-10-10-3 10-3z" fill="var(--gold)" />
        </svg>
        <span>Sprucetrap</span>
      </Link>
      <nav className="nav" aria-label="Sections">
        {NAV.map((id) => {
          const body = bodyById.get(id as BodyId)
          return (
            <Link
              key={id}
              to={hrefForSection(id)}
              className={`hud-chip${active === id ? ' active' : ''}`}
              style={{ '--accent': accentFor(id) } as React.CSSProperties}
              aria-current={active === id ? 'location' : undefined}
            >
              <span className={`body-icon ${body?.kind ?? 'cluster'}`} aria-hidden="true" />
              {SECTION_LABELS[id]}
            </Link>
          )
        })}
        <Link to="/blog" viewTransition className="hud-chip" style={{ '--accent': 'var(--signal)' } as React.CSSProperties}>
          <span className="blog-icon" aria-hidden="true" />
          Blog
        </Link>
        <MotionChip />
        <button type="button" className="hud-chip terminal-chip mono" onClick={openTerminal} aria-label="Open command terminal" title="Command terminal (⌘K or /)">
          <span aria-hidden="true">&gt;_</span>
          <kbd>⌘K</kbd>
        </button>
      </nav>
    </header>
  )
}

/** Pauses or resumes the ambient animation (sky, typing, glows); a must since motion is on by default. */
function MotionChip() {
  const reduced = useReducedMotion()
  const label = reduced ? 'Play background motion' : 'Pause background motion'
  return (
    <button
      type="button"
      className="hud-chip motion-chip"
      onClick={() => setMotion(reduced ? 'full' : 'reduced')}
      aria-label={label}
      title={label}
    >
      <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" fill="currentColor">
        {reduced ? <path d="M3 1.5v9l7.5-4.5z" /> : <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" />}
      </svg>
    </button>
  )
}
