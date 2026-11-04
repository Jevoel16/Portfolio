import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { SECTIONS, locationForSection, sectionForLocation, type SectionId } from './sections'

/** The section under this line (fraction of the viewport height from the top) is the active one. */
const FOCUS = 0.42
/** Jumps longer than this many viewports get the hyperspace overlay. */
const WARP_VIEWPORTS = 1.5

function sectionInFocus(): SectionId {
  const doc = document.documentElement
  // At the very bottom the last section may be too short to reach the focus line.
  if (window.scrollY + window.innerHeight >= doc.scrollHeight - 2) return SECTIONS[SECTIONS.length - 1]
  const line = window.innerHeight * FOCUS
  let current: SectionId = SECTIONS[0]
  for (const id of SECTIONS) {
    const el = document.getElementById(id)
    if (el && el.getBoundingClientRect().top <= line) current = id
  }
  return current
}

/**
 * Keeps the URL and the scroll position in step, both ways:
 * - navigating to `/about`, `/#projects`, … scrolls to that section (instantly on first load);
 * - scrolling replaces the URL with the section in view, so the title, canonical and Back stay right.
 * Also writes `--scroll` (0–1 page progress) on <html> for the HUD rail.
 */
export function useSectionSync({ reduced, onWarp }: { reduced: boolean; onWarp: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [active, setActive] = useState<SectionId>(() => sectionForLocation(location.pathname, location.hash) ?? 'home')
  const first = useRef(true)
  // While a programmatic scroll is running, the URL already says where it is going.
  const autoScrolling = useRef(false)
  const current = useRef(location)
  current.current = location
  const warp = useRef(onWarp)
  warp.current = onWarp

  // URL → scroll.
  useEffect(() => {
    const isFirst = first.current
    first.current = false
    if ((location.state as { fromScroll?: boolean } | null)?.fromScroll) return
    const id = sectionForLocation(location.pathname, location.hash)
    if (!id || (isFirst && id === 'home')) return
    const el = document.getElementById(id)
    if (!el) return

    const distance = Math.abs(el.getBoundingClientRect().top)
    const smooth = !isFirst && !reduced
    if (smooth && distance > window.innerHeight * WARP_VIEWPORTS) warp.current()
    setActive(id)
    autoScrolling.current = smooth
    el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
    if (!smooth) return

    // 'scrollend' isn't everywhere yet; the timeout is the fallback.
    const done = () => {
      autoScrolling.current = false
      window.removeEventListener('scrollend', done)
    }
    window.addEventListener('scrollend', done, { once: true })
    const t = setTimeout(done, 1400)
    return () => {
      clearTimeout(t)
      done()
    }
    // location.key changes on every navigation, including clicks on the link to the current section.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  // Scroll → URL.
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      doc.style.setProperty('--scroll', max > 0 ? (window.scrollY / max).toFixed(4) : '0')
      if (autoScrolling.current) return
      const id = sectionInFocus()
      setActive(id)
      const loc = current.current
      if (sectionForLocation(loc.pathname, loc.hash) === id) return
      navigate(locationForSection(id), { replace: true, preventScrollReset: true, state: { fromScroll: true } })
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scrollend', onScroll)
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('scrollend', onScroll)
      window.removeEventListener('resize', onScroll)
      document.documentElement.style.removeProperty('--scroll')
    }
  }, [navigate])

  return active
}
