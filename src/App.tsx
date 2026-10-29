import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { BodyPanel } from './components/BodyPanel'
import { Header } from './components/Header'
import { ProjectPanel } from './components/ProjectPanel'
import { bodies, bodyById, type BodyId } from './data/bodies'
import { constellations } from './data/constellations'
import { projectById, projects } from './data/projects'
import { coarsePointer } from './hooks/device'
import { usePortrait } from './hooks/usePortrait'
import { usePrefersReducedMotion, useSceneSupport } from './hooks/useSceneSupport'
import { StaticSky } from './static/StaticSky'

const SpaceScene = lazy(() => import('./scene/SpaceScene'))

/** If the 3D chunk fails to download or WebGL fails to start, drop back to the static map. */
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

const firstStar = (constellationId: string) =>
  projects.find((p) => p.constellation === constellationId && p.featured) ?? projects.find((p) => p.constellation === constellationId)

export default function App() {
  const { webgl, lite } = useSceneSupport()
  const reducedMotion = usePrefersReducedMotion()
  const [touch] = useState(coarsePointer)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sceneReady, setSceneReady] = useState(false)
  const [sceneFailed, setSceneFailed] = useState(false)
  const [away, setAway] = useState(false)
  const [recenter, setRecenter] = useState(0)
  const stageRef = useRef<HTMLDivElement>(null)
  const portrait = usePortrait(stageRef, true)

  const show3d = webgl && !sceneFailed
  const project = selectedId ? projectById.get(selectedId) : undefined
  const body = selectedId ? bodyById.get(selectedId as BodyId) : undefined

  useEffect(() => {
    if (!show3d) setSceneReady(false)
  }, [show3d])

  const close = useCallback(() => setSelectedId(null), [])
  const onReady = useCallback(() => setSceneReady(true), [])
  const goHome = () => (selectedId ? close() : setRecenter((n) => n + 1))

  const hint = !show3d
    ? 'Tap a star or planet to explore'
    : touch
      ? 'Drag · pinch to zoom · tap a star'
      : 'Drag to look · scroll to zoom · click a star'

  return (
    <main className={`sky${sceneReady ? ' three-ready' : ''}${selectedId ? ' has-panel' : ''}`}>
      {show3d && (
        <SceneBoundary onError={() => setSceneFailed(true)}>
          <Suspense fallback={null}>
            <SpaceScene
              portrait={portrait}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDismiss={close}
              onReady={onReady}
              onAwayChange={setAway}
              recenter={recenter}
              reducedMotion={reducedMotion}
              lite={lite}
              stageRef={stageRef}
            />
          </Suspense>
        </SceneBoundary>
      )}

      <Header selectedId={selectedId} onSelect={setSelectedId} />

      <div className="hero">
        <p className="hero-kicker mono">
          // {projects.length} projects · {constellations.length} constellations
        </p>
        <h1>Sprucetrap</h1>
        <p className="hero-sub">Aspiring Cybersecurity Professional · Full-Stack Developer</p>
      </div>

      <div ref={stageRef} className="stage">
        <StaticSky portrait={portrait} selectedId={selectedId} onSelect={setSelectedId} covered={show3d && sceneReady} />
      </div>

      <div className="sky-footer">
        <div className="hint-row">
          <p className="hint mono">{hint}</p>
          {(away || selectedId) && show3d && (
            <button type="button" className="hud-chip recenter" onClick={goHome}>
              <span aria-hidden="true">◎</span> Recenter
            </button>
          )}
        </div>
        <ul className="legend" aria-label="Constellations">
          {constellations.map((c) => {
            const first = firstStar(c.id)
            return (
              <li key={c.id} style={{ '--accent': c.color } as React.CSSProperties}>
                <button
                  type="button"
                  className="hud-chip"
                  disabled={!first}
                  onClick={() => first && setSelectedId(first.id)}
                  title={first ? `Visit ${c.name}` : `${c.name} is still forming`}
                >
                  <span className="dot" aria-hidden="true" />
                  {c.name}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* The canvas can't take focus, so keyboard and screen-reader users get every star here. */}
      <nav className="sr-only" aria-label="All stars and planets">
        <ul>
          {bodies.map((b) => (
            <li key={b.id}>
              <button type="button" onClick={() => setSelectedId(b.id)}>
                {b.name} ({b.caption})
              </button>
            </li>
          ))}
          {projects.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => setSelectedId(p.id)}>
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {project && <ProjectPanel key={project.id} project={project} onClose={close} onSelect={setSelectedId} />}
      {body && <BodyPanel key={body.id} body={body} onClose={close} onSelect={setSelectedId} />}
    </main>
  )
}
