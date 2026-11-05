import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../hooks/useMotion'

/** Viewport corner brackets plus a faint scanline/grain veil: the "observatory screen" frame. */
export function HudFrame() {
  return (
    <div className="hud-frame" aria-hidden="true">
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />
      <span className="scanlines" />
    </div>
  )
}

const BOOT_KEY = 'sprucetrap-booted'

interface BootLineProps {
  stats: string
  /** False while the page is still loading the sky; the kicker shows the load progress. */
  ready: boolean
  done: number
  total: number
}

/**
 * Hero kicker: load progress while the page boots, then a one-line "uplink" typed once per session,
 * then the sky's stats. Prerendered HTML shows the stats; reduced motion skips the typing.
 */
export function BootLine({ stats, ready, done, total }: BootLineProps) {
  const reduced = useReducedMotion()
  const [text, setText] = useState<string | null>(null)
  // Set after mount, so prerendered HTML (and no-JS visitors) keep the stats.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!ready) return
    let booted = true
    try {
      booted = sessionStorage.getItem(BOOT_KEY) === '1'
      sessionStorage.setItem(BOOT_KEY, '1')
    } catch {
      /* storage blocked: just skip the animation */
    }
    if (booted || reduced) return
    const line = '> establishing uplink… ok'
    let i = 0
    const id = setInterval(() => {
      i += 1
      setText(line.slice(0, i))
      if (i >= line.length) {
        clearInterval(id)
        setTimeout(() => setText(null), 450)
      }
    }, 600 / line.length)
    return () => clearInterval(id)
  }, [ready, reduced])

  const loading = mounted && !ready ? `> calibrating sky… ${done}/${total}` : null
  return (
    <p className="hero-kicker mono">
      <span className="signal">{loading ?? text ?? stats}</span>
    </p>
  )
}

const pad = (n: number) => String(Math.floor(n)).padStart(2, '0')

/**
 * Bottom-left readout: pointer position as right ascension / declination, the locked target and
 * session uptime. Values are written straight to the DOM so pointer moves never re-render React.
 */
export function Telemetry({ target }: { target: string | null }) {
  const coords = useRef<HTMLSpanElement>(null)
  const uptime = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!coords.current) return
      const ra = (e.clientX / window.innerWidth) * 24
      const dec = 90 - (e.clientY / window.innerHeight) * 180
      const sign = dec < 0 ? '−' : '+'
      coords.current.textContent = `RA ${pad(ra)}h${pad((ra % 1) * 60)}m  DEC ${sign}${pad(Math.abs(dec))}°${pad((Math.abs(dec) % 1) * 60)}′`
    }
    const start = performance.now()
    const tick = () => {
      if (!uptime.current) return
      const s = (performance.now() - start) / 1000
      uptime.current.textContent = `UP ${pad(s / 60)}:${pad(s % 60)}`
    }
    tick()
    const id = setInterval(tick, 1000)
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      clearInterval(id)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <p className="telemetry mono" aria-hidden="true">
      <span ref={coords}>RA 00h00m  DEC +00°00′</span>
      <span>TGT {target ? target.replace(/^post:/, 'log/') : '——'}</span>
      <span ref={uptime}>UP 00:00</span>
    </p>
  )
}
