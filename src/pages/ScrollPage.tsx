import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Header } from '../components/Header'
import { HoloAvatar } from '../components/HoloAvatar'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { formatDate, posts } from '../content/posts'
import { bodyById, type BodyId } from '../data/bodies'
import { constellations } from '../data/constellations'
import { GITHUB, LICENSE_URL } from '../data/profile'
import { projects, techStack } from '../data/projects'
import { PORTRAIT_QUERY, useMediaQuery } from '../hooks/useMediaQuery'
import { useSceneSupport } from '../hooks/useSceneSupport'
import { useReducedMotion } from '../hooks/useMotion'
import { BootLine, HudFrame, Telemetry } from '../hud/Hud'
import { hrefForSection, SECTIONS, SECTION_LABELS, type SectionId } from '../scroll/sections'
import { useSectionSync } from '../scroll/useSectionSync'
import { StaticSky } from '../static/StaticSky'

const ScrollSky = lazy(() => import('../scene/ScrollSky'))

/** If the 3D chunk fails to download or WebGL fails to start, keep the static map. */
class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/**
 * True once the browser is idle after first paint. The prerendered page is the fast first paint;
 * the ~250 KB three.js chunk downloads only after that.
 */
function useIdle() {
  const [idle, setIdle] = useState(false)
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setIdle(true), { timeout: 1200 })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(() => setIdle(true), 300)
    return () => clearTimeout(id)
  }, [])
  return idle
}

/** Hyperspace overlay for long jumps: on for one streak animation, then off. */
function useWarp() {
  const [on, setOn] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const trigger = useCallback(() => {
    setOn(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOn(false), 900)
  }, [])
  useEffect(() => () => clearTimeout(timer.current), [])
  return [on, trigger] as const
}

const accent = (color: string) => ({ '--accent': color }) as CSSProperties
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

/**
 * The v2 home: one long page flying through the night sky. `/`, `/about`, `/toolkit` and `/contact`
 * all render it (each prerendered with every section) and open scrolled to their section.
 */
export function ScrollPage() {
  const { webgl, lite } = useSceneSupport()
  const reducedMotion = useReducedMotion()
  const portrait = useMediaQuery(PORTRAIT_QUERY)
  const [warping, warp] = useWarp()
  const active = useSectionSync({ reduced: reducedMotion, onWarp: warp })
  const [sceneReady, setSceneReady] = useState(false)
  const [sceneFailed, setSceneFailed] = useState(false)
  const idle = useIdle()
  const show3d = webgl && !sceneFailed && idle
  const onReady = useCallback(() => setSceneReady(true), [])

  useEffect(() => {
    if (!show3d) setSceneReady(false)
  }, [show3d])

  const lit = constellations.filter((c) => projects.some((p) => p.constellation === c.id))
  const security = constellations.find((c) => c.id === 'security')
  const about = bodyById.get('about')!
  const toolkit = bodyById.get('toolkit')!
  const contact = bodyById.get('contact')!

  return (
    <div className={`v2${sceneReady ? ' three-ready' : ''}${warping ? ' is-warping' : ''}`} data-active={active}>
      <div className="backdrop" aria-hidden="true" data-scroll-var>
        <div className="backdrop-map">
          <StaticSky covered={show3d && sceneReady} />
        </div>
        {show3d && (
          <SceneBoundary onError={() => setSceneFailed(true)}>
            <Suspense fallback={null}>
              <ScrollSky
                portrait={portrait}
                activeBody={bodyById.has(active as BodyId) ? active : null}
                onReady={onReady}
                reducedMotion={reducedMotion}
                lite={lite}
              />
            </Suspense>
          </SceneBoundary>
        )}
        <div className="backdrop-veil" />
      </div>
      <div className="warp" aria-hidden="true" />
      <HudFrame />
      <Header active={active} />
      <ScrollRail active={active} />

      <main className="v2-main">
        <section id="home" className="v2-section hero-section" data-cam="home" aria-labelledby="home-title">
          <BootLine stats={`// ${plural(projects.length, 'project')} · ${plural(posts.length, 'write-up')} · ${constellations.length} constellations`} />
          <h1 id="home-title" className="hero-title">
            Sprucetrap
          </h1>
          <p className="hero-sub">
            Cybersecurity <span className="signal">×</span> Full-Stack Development<span className="caret" aria-hidden="true" />
          </p>
          <p className="status-chip mono">
            <span className="pulse-dot" aria-hidden="true" /> learning security · building the web
          </p>
          <div className="hero-actions">
            <Link className="btn" to={hrefForSection('projects')}>
              Explore the constellations <span aria-hidden="true">↓</span>
            </Link>
            <Link className="btn ghost" to={hrefForSection('contact')} style={accent(contact.color)}>
              Open a channel
            </Link>
          </div>
          <p className="scroll-cue mono" aria-hidden="true">
            <span>scroll to fly</span>
            <span className="scroll-cue-line" />
          </p>
        </section>

        <OrbitDivider />

        <section id="about" className="v2-section" data-cam="body:about" style={accent(about.color)} aria-labelledby="about-title">
          <SectionHeading id="about-title" kicker={`01 · ${about.caption}`} title="About me" />
          <Reveal className="glass">
            <p className="lede">
              I'm early in my cybersecurity career and building my skills step by step. Along the way I've built full-stack web
              apps, worked with several kinds of databases, put together machine learning pipelines, and written network servers
              from scratch.
            </p>
            <ul className="facts">
              <li><span className="mono">focus</span> Learning cybersecurity, starting with the fundamentals</li>
              <li><span className="mono">now</span> Building the core skills every cybersecurity professional needs</li>
              <li><span className="mono">learning</span> New tools, techniques and threats in the field</li>
              <li><span className="mono">open to</span> Working on ideas and projects that help me grow in cybersecurity</li>
            </ul>
          </Reveal>
        </section>

        <OrbitDivider />

        <section id="projects" className="v2-section" aria-labelledby="projects-title">
          <SectionHeading id="projects-title" kicker="02 · star map" title="Projects" />
          <Reveal className="section-intro">
            <p>
              {plural(projects.length, 'project')} charted across {plural(lit.length, 'constellation')}. Each constellation is a
              skill area; every star is something I built.
            </p>
          </Reveal>
          {lit.map((c) => (
            <div key={c.id} className="constellation-block" data-cam={`const:${c.id}`} style={accent(c.color)}>
              <Reveal className="constellation-head">
                <h3>
                  <span className="dot" aria-hidden="true" /> {c.name}
                </h3>
                <p>{c.blurb}</p>
              </Reveal>
              <ul className="project-grid">
                {projects
                  .filter((p) => p.constellation === c.id)
                  .map((p, i) => (
                    <li key={p.id}>
                      <Reveal className={`project-card${p.featured ? ' featured' : ''}`} delay={i * 70}>
                        <h4>
                          <Link to={`/projects/${p.id}`} viewTransition>
                            {p.featured ? '★' : '✦'} {p.name}
                          </Link>
                        </h4>
                        <p>{p.description}</p>
                        <ul className="chips" aria-label={`${p.name} tech stack`}>
                          {p.stack.slice(0, 4).map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                        <p className="card-links mono">
                          <Link to={`/projects/${p.id}`} viewTransition>
                            details →
                          </Link>
                          <a href={p.url} target="_blank" rel="noreferrer">
                            source ↗
                          </a>
                        </p>
                      </Reveal>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </section>

        <OrbitDivider />

        <section id="toolkit" className="v2-section" data-cam="body:toolkit" style={accent(toolkit.color)} aria-labelledby="toolkit-title">
          <SectionHeading id="toolkit-title" kicker={`03 · ${toolkit.caption}`} title="Toolkit" />
          <Reveal className="section-intro">
            <p>The languages, frameworks and tools that orbit my projects.</p>
          </Reveal>
          <div className="toolkit-grid">
            {techStack.map((g, i) => (
              <Reveal key={g.group} className="glass stack-group" delay={i * 60}>
                <h3 className="mono">{g.group}</h3>
                <ul className="chips">
                  {g.items.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </section>

        <OrbitDivider />

        <section
          id="writeups"
          className="v2-section"
          data-cam={security ? `const:${security.id}` : undefined}
          style={accent(security?.color ?? 'var(--alert)')}
          aria-labelledby="writeups-title"
        >
          <SectionHeading id="writeups-title" kicker="04 · intercepted transmissions" title="Write-ups" />
          <Reveal className="section-intro">
            <p>Security notes and build logs. Each one is also a star in the {security?.name ?? 'security'} constellation.</p>
          </Reveal>
          <ul className="post-cards">
            {posts.slice(0, 4).map((p, i) => (
              <li key={p.slug}>
                <Reveal className="glass post-card" delay={i * 70}>
                  <p className="post-meta mono">
                    <time dateTime={p.date}>{formatDate(p.date)}</time> · {p.readingMinutes} min read
                  </p>
                  <h3>
                    <Link to={`/blog/${p.slug}`} viewTransition>
                      {p.title}
                    </Link>
                  </h3>
                  <p>{p.summary}</p>
                </Reveal>
              </li>
            ))}
          </ul>
          <Link className="btn ghost" to="/blog" viewTransition>
            All write-ups <span aria-hidden="true">→</span>
          </Link>
        </section>

        <OrbitDivider />

        <section id="contact" className="v2-section contact-section" data-cam="body:contact" style={accent(contact.color)} aria-labelledby="contact-title">
          <SectionHeading id="contact-title" kicker={`05 · ${contact.caption}`} title="Open a channel" />
          <HoloAvatar />
          <Reveal className="contact-links">
            <a className="btn" href={GITHUB} target="_blank" rel="noreferrer">
              github.com/Jevoel16 <span aria-hidden="true">↗</span>
            </a>
            <blockquote className="quote">
              “Things are not meant to last, but they will last to give meaning to things.”
              <cite>— Sprucetrap</cite>
            </blockquote>
          </Reveal>
        </section>
      </main>

      <footer className="v2-footer mono">
        <Telemetry target={active} />
        <p>
          © {new Date().getFullYear()} Sprucetrap · source-available under the{' '}
          <a href={LICENSE_URL} target="_blank" rel="noreferrer">
            Sprucetrap license
          </a>
        </p>
      </footer>
    </div>
  )
}

/** Thin orbit line with a data packet travelling along it, between sections. */
function OrbitDivider() {
  return (
    <div className="orbit-divider" aria-hidden="true">
      <span className="orbit-packet" />
    </div>
  )
}

/** Left-edge "altitude" rail: page progress plus a tick for each section. */
function ScrollRail({ active }: { active: SectionId }) {
  return (
    <nav className="scroll-rail" aria-label="Page sections">
      <span className="rail-track" aria-hidden="true" data-scroll-var>
        <span className="rail-fill" />
      </span>
      <ol>
        {SECTIONS.map((id) => (
          <li key={id}>
            <Link to={hrefForSection(id)} className={active === id ? 'active' : undefined} aria-current={active === id ? 'location' : undefined}>
              <span className="rail-tick" aria-hidden="true" />
              <span className="rail-label mono">{SECTION_LABELS[id]}</span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}
