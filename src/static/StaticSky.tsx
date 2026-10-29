import { useEffect, useMemo, useRef, useState } from 'react'
import { bodies } from '../data/bodies'
import { bodyLabelPosition, constellations, labelPosition, orient, skyBounds } from '../data/constellations'
import { projectById } from '../data/projects'

interface Props {
  portrait: boolean
  selectedId: string | null
  onSelect: (id: string) => void
  /** Covered by the 3D scene: faded out and removed from the tab order. */
  covered?: boolean
}

/** Lightweight star map: plain SVG + CSS, no WebGL and no extra download. */
export function StaticSky({ portrait, selectedId, onSelect, covered }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const b = useMemo(() => skyBounds(portrait), [portrait])
  // Sky units per screen pixel, so text and stars keep a readable size at any width.
  const [unit, setUnit] = useState(0.02)

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (!width || !height) return
      setUnit(1 / Math.min(width / b.width, height / b.height))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [b])

  const px = (n: number) => n * unit
  const pt = (x: number, y: number) => {
    const [ox, oy] = orient(x, y, portrait)
    return [ox, -oy] as const
  }

  return (
    <svg
      ref={svgRef}
      className={`static-sky${covered ? ' covered' : ''}`}
      viewBox={`${b.minX} ${-b.maxY} ${b.width} ${b.height}`}
      preserveAspectRatio="xMidYMid meet"
      role="group"
      aria-label="Star map of my projects. Each constellation is a skill area; each named star is a project. The planets hold About, Toolkit and Contact."
      aria-hidden={covered || undefined}
    >
      <defs>
        <radialGradient id="glow">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="0.25" stopColor="var(--accent)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="nebula">
          <stop offset="0" stopColor="#ff7a9c" stopOpacity="0.32" />
          <stop offset="0.5" stopColor="#8a5cff" stopOpacity="0.12" />
          <stop offset="1" stopColor="#8a5cff" stopOpacity="0" />
        </radialGradient>
        {bodies.map((b) => (
          <radialGradient key={b.id} id={`planet-${b.id}`} cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="0.25" stopColor={b.color} />
            <stop offset="1" stopColor={b.color2} />
          </radialGradient>
        ))}
      </defs>

      {constellations.map((c, ci) => {
        const byKey = new Map(c.stars.map((s) => [s.key, s]))
        const [lox, loy] = labelPosition(c, portrait)
        const [lx, ly] = [lox, -loy]
        return (
          <g
            key={c.id}
            className={`constellation${c.forming ? ' forming' : ''}`}
            style={{ '--accent': c.color, '--delay': `${ci * 0.25}s` } as React.CSSProperties}
          >
            {c.forming && (() => {
              const [cx, cy] = pt(0.1, 0.2)
              return <ellipse className="nebula" cx={cx} cy={cy} rx={portrait ? 2.6 : 3.2} ry={portrait ? 3.2 : 2.6} fill="url(#nebula)" />
            })()}

            {c.edges.map(([a, z]) => {
              const [x1, y1] = pt(byKey.get(a)!.x, byKey.get(a)!.y)
              const [x2, y2] = pt(byKey.get(z)!.x, byKey.get(z)!.y)
              return (
                <line
                  key={a + z}
                  className="edge"
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  pathLength={1}
                  strokeWidth={px(1.2)}
                  // Inline so it beats the draw-in dasharray in the stylesheet.
                  style={c.forming ? { strokeDasharray: `${px(4)} ${px(5)}` } : undefined}
                />
              )
            })}

            {c.stars.map((s, si) => {
              const [x, y] = pt(s.x, s.y)
              const project = s.projectId ? projectById.get(s.projectId) : undefined
              const twinkle = { animationDelay: `${(ci * 7 + si * 3) % 11 * 0.37}s` }
              if (!project) {
                return <circle key={s.key} className="star-minor" cx={x} cy={y} r={px(c.forming ? 2 : 2.4)} style={twinkle} />
              }
              const r = px(project.featured ? 5 : 3.6)
              const selected = selectedId === project.id
              const rightSide = x > (b.minX + b.width) - b.width * 0.22
              return (
                <g
                  key={s.key}
                  className={`star${project.featured ? ' featured' : ''}${selected ? ' selected' : ''}`}
                  role="button"
                  tabIndex={covered ? -1 : 0}
                  aria-label={`${project.name}, ${c.name}${project.featured ? ', featured' : ''}`}
                  aria-pressed={selected}
                  onClick={() => onSelect(project.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelect(project.id)
                    }
                  }}
                >
                  <circle className="hit" cx={x} cy={y} r={px(22)} />
                  <circle className="halo" cx={x} cy={y} r={r * 4.5} fill="url(#glow)" style={twinkle} />
                  <circle className="core" cx={x} cy={y} r={r} />
                  <circle className="ring" cx={x} cy={y} r={r * 2.6} strokeWidth={px(1.2)} />
                  <text
                    className="star-label"
                    x={rightSide ? x - r * 2.4 : x + r * 2.4}
                    y={y + px(4)}
                    textAnchor={rightSide ? 'end' : 'start'}
                    fontSize={px(13)}
                    strokeWidth={px(4)}
                  >
                    {project.name}
                  </text>
                </g>
              )
            })}

            <text className="const-label" x={lx} y={ly} textAnchor="middle" fontSize={px(12)} letterSpacing={px(2.4)} strokeWidth={px(4)}>
              {c.name.toUpperCase()}
              {c.forming && (
                <tspan className="forming-tag" x={lx} dy={px(17)} fontSize={px(10.5)} letterSpacing={px(1.2)}>
                  · in formation ·
                </tspan>
              )}
            </text>
          </g>
        )
      })}

      {bodies.map((body) => {
        const [x, y] = pt(body.x, body.y)
        const [lox, loy] = bodyLabelPosition(body, portrait)
        const r = body.radius
        const selected = selectedId === body.id
        return (
          <g
            key={body.id}
            className={`body ${body.kind}${selected ? ' selected' : ''}`}
            style={{ '--accent': body.color, '--accent-2': body.color2 } as React.CSSProperties}
            role="button"
            tabIndex={covered ? -1 : 0}
            aria-label={`${body.name}, ${body.caption}`}
            aria-pressed={selected}
            onClick={() => onSelect(body.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(body.id)
              }
            }}
          >
            <circle className="hit" cx={x} cy={y} r={Math.max(r * 1.6, px(26))} />
            <circle cx={x} cy={y} r={r * 2.4} fill="url(#glow)" opacity={0.7} />
            {body.kind === 'beacon' ? (
              <>
                <circle className="pulse" cx={x} cy={y} r={r * 2} strokeWidth={px(1.4)} />
                <circle className="pulse late" cx={x} cy={y} r={r * 2} strokeWidth={px(1.4)} />
                <circle className="core" cx={x} cy={y} r={r * 0.55} />
              </>
            ) : (
              <>
                {body.kind === 'ringed' && (
                  <ellipse className="ring-back" cx={x} cy={y} rx={r * 2.1} ry={r * 0.55} strokeWidth={px(3)} transform={`rotate(-18 ${x} ${y})`} />
                )}
                <circle cx={x} cy={y} r={r} fill={`url(#planet-${body.id})`} />
                {body.kind === 'ringed' && (
                  <path
                    className="ring-front"
                    d={`M ${x - r * 2.1} ${y} A ${r * 2.1} ${r * 0.55} 0 0 0 ${x + r * 2.1} ${y}`}
                    strokeWidth={px(3)}
                    transform={`rotate(-18 ${x} ${y})`}
                  />
                )}
              </>
            )}
            <circle className="ring" cx={x} cy={y} r={r * 1.5} strokeWidth={px(1.2)} />
            <text className="body-label" x={lox} y={-loy} textAnchor="middle" fontSize={px(13)} strokeWidth={px(4)}>
              {body.name}
              <tspan className="forming-tag" x={lox} dy={px(14)} fontSize={px(10)}>
                {body.caption}
              </tspan>
            </text>
          </g>
        )
      })}
    </svg>
  )
}
