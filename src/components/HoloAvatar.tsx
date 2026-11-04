import { useEffect, useRef, useState } from 'react'
import { DIALOGUE } from '../data/dialogue'
import { AVATAR } from '../data/profile'
import { usePrefersReducedMotion } from '../hooks/useSceneSupport'
import { useTypewriter } from '../hud/useTypewriter'

const BARS = 7

/**
 * Spruce, projected as a hologram over the contact beacon. He starts talking when the section scrolls
 * into view; "Next" (or a click on the bubble) skips to the end of the line, then to the next line.
 */
export function HoloAvatar() {
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  // `idle` is the prerendered state (fully visible); `standby` waits off-screen to boot up.
  const [phase, setPhase] = useState<'idle' | 'standby' | 'online'>('idle')
  const seen = phase === 'online'
  const [line, setLine] = useState(0)
  const [glitch, setGlitch] = useState(0)
  const text = DIALOGUE[line]
  const { shown, typing, finish } = useTypewriter(text, { running: seen, instant: reduced })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      setPhase('online')
      return
    }
    setPhase('standby')
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setPhase('online')
        io.disconnect()
      },
      { threshold: 0.45 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const next = () => {
    if (typing) {
      finish()
      return
    }
    setLine((l) => (l + 1) % DIALOGUE.length)
    setGlitch((g) => g + 1)
  }

  const last = line === DIALOGUE.length - 1

  return (
    <div ref={ref} className={`holo ${phase}${typing ? ' talking' : ''}`}>
      <div className="holo-figure">
        <div className="holo-frame" key={glitch} data-glitch={glitch > 0 || undefined}>
          <img src={AVATAR.src} width={AVATAR.width} height={AVATAR.height} alt={AVATAR.alt} loading="lazy" decoding="async" />
          <span className="holo-scan" aria-hidden="true" />
        </div>
        <span className="holo-beam" aria-hidden="true" />
        <span className="holo-pad" aria-hidden="true" />
      </div>

      <div className="holo-speech">
        <p className="holo-name mono">
          <span className="pulse-dot" aria-hidden="true" /> SPRUCE <span className="holo-channel">// ch.{String(line + 1).padStart(2, '0')}</span>
          <span className={`voice${typing ? ' on' : ''}`} aria-hidden="true">
            {Array.from({ length: BARS }, (_, i) => (
              <span key={i} style={{ animationDelay: `${(i * 97) % 420}ms` }} />
            ))}
          </span>
        </p>
        {/* Typed visually; screen readers get the whole line once, from the live region below. */}
        <p className="holo-line" aria-hidden="true" onClick={next}>
          {shown}
          <span className={`caret${typing ? ' typing' : ''}`} />
        </p>
        <p className="sr-only" aria-live="polite">
          {seen ? text : DIALOGUE[0]}
        </p>
        <button type="button" className="btn ghost holo-next" onClick={next}>
          {typing ? 'Skip' : last ? 'Replay' : 'Next'} <span aria-hidden="true">›</span>
        </button>
      </div>
    </div>
  )
}
