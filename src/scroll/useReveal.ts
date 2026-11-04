import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'

/** useLayoutEffect on the client, a no-op-safe useEffect during prerendering. */
export const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * `idle`: prerendered or already on screen at mount, so it is shown as is (no flash, no shift).
 * `armed`: below the fold, hidden until it scrolls in. `in`: revealed, and the CSS transition plays.
 */
export type RevealState = 'idle' | 'armed' | 'in'

/** One-shot "signal acquired" reveal for an element, driven by an IntersectionObserver. */
export function useReveal<T extends Element>(): [RefObject<T>, RevealState] {
  const ref = useRef<T>(null)
  const [state, setState] = useState<RevealState>('idle')

  useIsoLayoutEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    const r = el.getBoundingClientRect()
    if (r.top < window.innerHeight && r.bottom > 0) return
    setState('armed')
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setState('in')
        io.disconnect()
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return [ref, state]
}
