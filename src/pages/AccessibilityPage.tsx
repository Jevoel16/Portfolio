import { DocLayout } from '../components/DocLayout'

const ISSUES_URL = 'https://github.com/Jevoel16/Portfolio/issues'
/** The date of the last automated check (axe-core and Lighthouse on every public route, both themes). */
const CHECKED = '2026-11-17'

export function AccessibilityPage() {
  return (
    <DocLayout>
      <article className="post">
        <header className="doc-hero">
          <p className="mono kicker">// accessibility</p>
          <h1>Accessibility</h1>
          <p className="lede">I want this site to work with a keyboard, a screen reader and a pause on motion. The target is WCAG 2.2 level AA.</p>
        </header>
        <div className="prose">
          <h2 id="what-works">What works</h2>
          <ul>
            <li>Every page starts with a skip link, and every control can be reached with Tab and shows a gold focus ring.</li>
            <li>
              <kbd>⌘K</kbd>, <kbd>Ctrl+K</kbd> or <kbd>/</kbd> opens the command terminal. Every command opens a page, so it doubles as keyboard navigation.
              Type <code>help</code> for the list.
            </li>
            <li>The 3D sky is decoration. Every project, planet and post it shows is also a normal link on the page.</li>
            <li>The pause button in the header stops the sky and the other ambient motion, and the site remembers it.</li>
            <li>The theme buttons in the footer switch between your system setting, Light and Dark. Text passes AA contrast in both.</li>
            <li>
              Without WebGL, or with <code>?mode=static</code> at the end of the address, the site draws a flat map instead of the 3D sky.
            </li>
          </ul>
          <h2 id="known-gaps">Known gaps</h2>
          <ul>
            <li>Motion starts on even when your device asks for reduced motion. The pause button stops it for every later visit.</li>
            <li>Code blocks in posts stay dark in the Light theme.</li>
            <li>I haven't done a full pass with a screen reader yet. It's next on the list.</li>
          </ul>
          <p>
            Last checked with axe-core and Lighthouse on every page, in both themes, on <time dateTime={CHECKED}>17 November 2026</time>.
          </p>
          <h2 id="report-a-problem">Report a problem</h2>
          <p>
            If something doesn't work for you, <a href={ISSUES_URL}>open an issue on GitHub</a>. Tell me the page, your browser and any assistive technology you
            use, and I'll fix it.
          </p>
        </div>
      </article>
    </DocLayout>
  )
}
