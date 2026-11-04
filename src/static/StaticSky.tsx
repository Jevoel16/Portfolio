import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { bodies } from '../data/bodies'
import { bodyLabelPosition, constellations, labelPosition, orient, skyBounds, starItem } from '../data/constellations'
import { pathFor } from '../routes'

interface Props {
  selectedId: string | null
  onSelect: (id: string) => void
  /** Covered by the 3D scene: faded out and removed from the tab order. */
  covered?: boolean
}

/**
 * Lightweight star map: plain SVG + CSS, no WebGL and no extra download. It is the prerendered
 * first paint, the loading placeholder and the no-WebGL fallback. Both orientations are rendered
 * and CSS picks one with the same media query the 3D scene uses, so the right one shows before JS.
 */
export function StaticSky(props: Props) {
  return (
    <>
      <SkyMap {...props} portrait={false} />
      <SkyMap {...props} portrait />
    </>
  )
}

interface LinkProps extends Props {
  id: string
  label: string
  className: string
  style?: CSSProperties
  children: ReactNode
}

/** Real links, so crawlers and no-JS visitors can follow every star; with JS the router takes over. */
function SkyLink({ id, label, className, style, children, selectedId, onSelect, covered }: LinkProps) {
  const onClick = (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    onSelect(id)
  }
  return (
    <a
      href={pathFor(id)}
      className={`${className}${selectedId === id ? ' selected' : ''}`}
      style={style}
      tabIndex={covered ? -1 : undefined}
      aria-label={label}
      aria-current={selectedId === id ? 'page' : undefined}
      onClick={onClick}
    >
      {children}
    </a>
  )
}

function SkyMap({ portrait, ...props }: Props & { portrait: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const b = useMemo(() => skyBounds(portrait), [portrait])
  const ns = portrait ? 'p' : 'l'
  // Sky units per screen pixel, so text and stars keep a readable size at any width.
  const [unit, setUnit] = useState(0.022)

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
      className={`static-sky ${portrait ? 'portrait' : 'landscape'}${props.covered ? ' covered' : ''}`}
      viewBox={`${b.minX} ${-b.maxY} ${b.width} ${b.height}`}
      preserveAspectRatio="xMidYMid meet"
      role="group"
      aria-label="Star map of my projects. Each constellation is a skill area; each named star is a project or write-up. The planets hold About, Toolkit and Contact."
      aria-hidden={props.covered || undefined}
    >
      <defs>
        <radialGradient id={`${ns}-glow`}>
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="0.25" stopColor="var(--accent)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${ns}-nebula`}>
          <stop offset="0" stopColor="#ff7a9c" stopOpacity="0.32" />
          <stop offset="0.5" stopColor="#8a5cff" stopOpacity="0.12" />
          <stop offset="1" stopColor="#8a5cff" stopOpacity="0" />
        </radialGradient>
        {bodies.map((body) => (
          <radialGradient key={body.id} id={`${ns}-planet-${body.id}`} cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="0.25" stopColor={body.color} />
            <stop offset="1" stopColor={body.color2} />
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
            style={{ '--accent': c.color, '--delay': `${ci * 0.25}s` } as CSSProperties}
          >
            {c.id === 'security' &&
              (() => {
                const [cx, cy] = pt(0.1, 0.2)
                return <ellipse className="nebula" cx={cx} cy={cy} rx={portrait ? 2.6 : 3.2} ry={portrait ? 3.2 : 2.6} fill={`url(#${ns}-nebula)`} />
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
              const item = starItem(s)
              const twinkle = { animationDelay: `${((ci * 7 + si * 3) % 11) * 0.37}s` }
              if (!item) {
                return <circle key={s.key} className="star-minor" cx={x} cy={y} r={px(c.forming ? 2 : 2.4)} style={twinkle} />
              }
              const r = px(item.featured ? 5 : 3.6)
              const rightSide = x > b.minX + b.width - b.width * 0.22
              return (
                <SkyLink
                  key={s.key}
                  {...props}
                  id={item.id}
                  className={`star${item.featured ? ' featured' : ''}`}
                  label={`${item.name}, ${c.name}${item.featured ? ', featured' : ''}`}
                >
                  <circle className="hit" cx={x} cy={y} r={px(22)} />
                  <circle className="halo" cx={x} cy={y} r={r * 4.5} fill={`url(#${ns}-glow)`} style={twinkle} />
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
                    {item.name}
                  </text>
                </SkyLink>
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
        return (
          <SkyLink
            key={body.id}
            {...props}
            id={body.id}
            className={`body ${body.kind}`}
            style={{ '--accent': body.color, '--accent-2': body.color2 } as CSSProperties}
            label={`${body.name}, ${body.caption}`}
          >
            <circle className="hit" cx={x} cy={y} r={Math.max(r * 1.6, px(26))} />
            <circle cx={x} cy={y} r={r * 2.4} fill={`url(#${ns}-glow)`} opacity={0.7} />
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
                <circle cx={x} cy={y} r={r} fill={`url(#${ns}-planet-${body.id})`} />
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
          </SkyLink>
        )
      })}
    </svg>
  )
}
