import type { ReactNode } from 'react'
import { NavLink } from 'react-router'
import { GITHUB, LICENSE_URL } from '../data/profile'
import { ThemePicker } from './ThemePicker'

const LINKS = [
  { to: '/about', label: 'About' },
  { to: '/toolkit', label: 'Toolkit' },
  { to: '/contact', label: 'Contact' },
  { to: '/blog', label: 'Blog' },
]

/** The same footer on every page; `children` is the scroll page's telemetry readout. */
export function SiteFooter({ children }: { children?: ReactNode }) {
  return (
    <footer className="site-footer">
      <nav aria-label="About Sprucetrap">
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} end>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="site-footer-meta mono">
        {children}
        <p>
          Built by <a href={GITHUB}>Sprucetrap</a>. <a href={LICENSE_URL}>Source-available license</a>.
        </p>
        <ThemePicker />
      </div>
    </footer>
  )
}
