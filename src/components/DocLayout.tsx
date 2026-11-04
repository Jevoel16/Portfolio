import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'

/** Scrolling page shell for the blog and 404: same identity as the sky, without WebGL. */
export function DocLayout({ children }: { children: ReactNode }) {
  return (
    <div className="doc">
      <div className="doc-stars" aria-hidden="true" />
      <header className="doc-header">
        <Link to="/" className="brand">
          <svg viewBox="0 0 32 32" width="20" height="20" aria-hidden="true">
            <path d="M16 3l3 10 10 3-10 3-3 10-3-10-10-3 10-3z" fill="var(--gold)" />
          </svg>
          <span>Sprucetrap</span>
        </Link>
        <nav className="doc-nav" aria-label="Site">
          <NavLink to="/" end>
            Sky
          </NavLink>
          <NavLink to="/blog">Blog</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
      </header>
      <main className="doc-main">{children}</main>
      <footer className="doc-footer mono">
        © {new Date().getFullYear()} Sprucetrap ·{' '}
        <a href="https://github.com/Jevoel16" target="_blank" rel="noreferrer">
          github.com/Jevoel16
        </a>
      </footer>
    </div>
  )
}
