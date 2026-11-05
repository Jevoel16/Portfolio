import { useEffect, useRef, type MutableRefObject } from 'react'
import { SECTIONS, brakeTarget, isTooFast, scrollVelocity, sectionIndexAt, type ScrollSample, type SectionId } from './sections'

/** How much scroll history the speed is measured over, and the least of it that counts. */
const WINDOW_MS = 120
const MIN_SPAN_MS = 32
/** Fallback release when 'scrollend' never arrives (older browsers, nothing to scroll). */
const RELEASE_MS = 1400
/** After release, trailing trackpad inertia is swallowed for at most this long… */
const INERTIA_MS = 800
/** …as long as its wheel events keep coming this close together. */
const INERTIA_GAP_MS = 100

const SCROLL_KEYS = new Set([' ', 'PageUp', 'PageDown', 'ArrowUp', 'ArrowDown', 'Home', 'End'])

interface Options {
  enabled: boolean
  reduced: boolean
  /** Shared with useSectionSync: true while a programmatic scroll owns the page. */
  autoScrolling: MutableRefObject<boolean>
  /** Scroll offset at which each section becomes active. */
  anchors: () => number[]
  /** Called as the brake starts, with the section it will stop at. */
  onBrake: (id: SectionId) => void
}

/**
 * Fast-scroll brake: when the page is flung faster than about four viewports a second, lock input,
 * glide to the neighbouring section in that direction and let the camera fly its normal transition.
 * Slow scrolling is never touched.
 */
export function useScrollBrake({ enabled, reduced, autoScrolling, anchors, onBrake }: Options) {
  const opts = useRef({ reduced, anchors, onBrake })
  opts.current = { reduced, anchors, onBrake }

  useEffect(() => {
    if (!enabled) return
    const root = document.documentElement
    let samples: ScrollSample[] = []
    let braking = false
    let releaseTimer: ReturnType<typeof setTimeout> | undefined
    let inertiaTimer: ReturnType<typeof setTimeout> | undefined
    let inertiaUntil = 0
    let lastWheelT = 0
    let lastWheelDelta = 0
    let filtering = false

    const isTyping = (e: Event) => {
      const t = e.target as HTMLElement | null
      return !!t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
    }

    const block = (e: Event) => {
      if (e.cancelable) e.preventDefault()
    }
    const onKey = (e: KeyboardEvent) => {
      if (SCROLL_KEYS.has(e.key) && !isTyping(e)) e.preventDefault()
    }
    // During the lock every wheel event is swallowed; afterwards only the decaying inertia tail.
    const onWheel = (e: WheelEvent) => {
      const now = performance.now()
      const delta = Math.abs(e.deltaY)
      const gap = now - lastWheelT
      const growing = delta > lastWheelDelta * 1.1 + 1
      lastWheelT = now
      lastWheelDelta = delta
      if (braking) return block(e)
      if (now < inertiaUntil && gap < INERTIA_GAP_MS && !growing) return block(e)
      stopFiltering()
    }

    const startFiltering = () => {
      if (filtering) return
      filtering = true
      window.addEventListener('wheel', onWheel, { passive: false })
    }
    const stopFiltering = () => {
      if (!filtering) return
      filtering = false
      window.removeEventListener('wheel', onWheel)
    }

    const release = () => {
      if (!braking) return
      braking = false
      clearTimeout(releaseTimer)
      root.classList.remove('scroll-braking')
      window.removeEventListener('touchmove', block)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scrollend', onScrollEnd)
      autoScrolling.current = false
      samples = []
      inertiaUntil = performance.now() + INERTIA_MS
      clearTimeout(inertiaTimer)
      inertiaTimer = setTimeout(stopFiltering, INERTIA_MS)
      // Let the scroll → URL sync catch up with where the glide ended.
      window.dispatchEvent(new Event('scroll'))
    }

    let targetY = 0
    // Only the glide's own end counts: cancelling the fling can fire a 'scrollend' of its own.
    const onScrollEnd = () => {
      if (Math.abs(window.scrollY - targetY) < 3) release()
    }

    const brake = (velocity: number, fromY: number) => {
      const max = root.scrollHeight - window.innerHeight
      // A last section too short to reach the focus line still counts as reached at the bottom.
      const a = opts.current.anchors().map((v) => Math.min(v, max - 2))
      const from = sectionIndexAt(a, fromY)
      const to = brakeTarget(from, velocity > 0 ? 1 : -1)
      if (to === from) return
      const el = document.getElementById(SECTIONS[to])
      if (!el) return

      braking = true
      autoScrolling.current = true
      root.classList.add('scroll-braking')
      window.addEventListener('touchmove', block, { passive: false })
      window.addEventListener('keydown', onKey)
      lastWheelDelta = 0
      startFiltering()

      // Same spot scrollIntoView picks: the section's top, less the header's scroll padding and margin.
      const margin = (parseFloat(getComputedStyle(root).scrollPaddingTop) || 0) + (parseFloat(getComputedStyle(el).scrollMarginTop) || 0)
      targetY = Math.min(max, Math.max(0, el.getBoundingClientRect().top + window.scrollY - margin))
      opts.current.onBrake(SECTIONS[to])
      if (Math.abs(window.scrollY - targetY) < 3) return release()
      window.addEventListener('scrollend', onScrollEnd)
      releaseTimer = setTimeout(release, RELEASE_MS)
      el.scrollIntoView({ behavior: opts.current.reduced ? 'auto' : 'smooth', block: 'start' })
    }

    const onScroll = () => {
      if (braking) {
        // 'scrollend' is the usual release, but not every browser sends it for a smooth scroll.
        onScrollEnd()
        return
      }
      if (autoScrolling.current) {
        samples = []
        return
      }
      const now = performance.now()
      samples.push({ y: window.scrollY, t: now })
      while (samples.length > 2 && now - samples[0].t > WINDOW_MS) samples.shift()
      if (now - samples[0].t > WINDOW_MS) samples.shift()
      if (samples.length < 2 || now - samples[0].t < MIN_SPAN_MS) return
      const v = scrollVelocity(samples)
      if (isTooFast(v, window.innerHeight)) brake(v, samples[0].y)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      release()
      clearTimeout(inertiaTimer)
      stopFiltering()
    }
  }, [enabled, autoScrolling])
}
