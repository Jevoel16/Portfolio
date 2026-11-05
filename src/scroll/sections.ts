import { bodyById, type BodyId } from '../data/bodies'
import { pathFor, selectionFromPath } from '../routes'

/** Sections of the scroll page, top to bottom. Ids double as the element ids and URL hashes. */
export const SECTIONS = ['home', 'about', 'projects', 'toolkit', 'writeups', 'contact'] as const
export type SectionId = (typeof SECTIONS)[number]

export const SECTION_LABELS: Record<SectionId, string> = {
  home: 'Home',
  about: 'About',
  projects: 'Projects',
  toolkit: 'Toolkit',
  writeups: 'Write-ups',
  contact: 'Contact',
}

const isSection = (id: string): id is SectionId => (SECTIONS as readonly string[]).includes(id)

/**
 * The section a URL points at: `/about`, `/toolkit` and `/contact` keep their own (indexable) paths,
 * the other sections live on `/` with a hash. Undefined for paths that aren't on the scroll page.
 */
export function sectionForLocation(pathname: string, hash = ''): SectionId | undefined {
  const selection = selectionFromPath(pathname)
  if (selection === null) {
    const h = hash.replace(/^#/, '')
    return isSection(h) ? h : 'home'
  }
  if (selection && bodyById.has(selection as BodyId) && isSection(selection)) return selection
  return undefined
}

/** Where a section lives, as a router location. */
export function locationForSection(id: SectionId): { pathname: string; hash: string } {
  if (bodyById.has(id as BodyId)) return { pathname: pathFor(id), hash: '' }
  return { pathname: '/', hash: id === 'home' ? '' : `#${id}` }
}

/** Same as locationForSection, as one href string. */
export const hrefForSection = (id: SectionId) => {
  const { pathname, hash } = locationForSection(id)
  return pathname + hash
}

/**
 * Page progress (0–1) paced by section, so section `k` of `n` sits at exactly `k / (n - 1)` and the
 * rail's evenly spaced ticks light up as the fill reaches them. `anchors[i]` is the scroll offset at
 * which section `i` becomes active; `max` is the largest scroll offset.
 */
export function sectionProgress(anchors: number[], scrollY: number, max: number): number {
  const last = anchors.length - 1
  if (last <= 0 || !(max > 0)) return 0
  const y = Number.isFinite(scrollY) ? Math.min(max, Math.max(0, scrollY)) : 0
  // The first section starts at the top and the bottom of the page always counts as the last one.
  const a = anchors.map((v, i) => (i === 0 ? 0 : Math.min(max, Math.max(0, Number.isFinite(v) ? v : max))))
  a[last] = Math.min(a[last], max)
  if (y >= a[last]) return 1
  let i = 0
  while (i < last - 1 && y >= a[i + 1]) i++
  const span = a[i + 1] - a[i]
  const frac = span > 0 ? Math.min(1, Math.max(0, (y - a[i]) / span)) : 1
  return Math.min(1, (i + frac) / last)
}

/** A scroll position sample for the fast-scroll brake. */
export interface ScrollSample {
  y: number
  /** Timestamp in ms. */
  t: number
}

/** Average scroll speed (px/ms, signed) across the samples, oldest first. */
export function scrollVelocity(samples: ScrollSample[]): number {
  if (samples.length < 2) return 0
  const a = samples[0]
  const b = samples[samples.length - 1]
  const dt = b.t - a.t
  return dt > 0 ? (b.y - a.y) / dt : 0
}

/** Floor and per-viewport-height factor of the brake speed: about 4 viewports a second. */
const BRAKE_MIN_SPEED = 2.5
const BRAKE_VIEWPORT_FACTOR = 0.004

/** Whether a scroll speed (px/ms) is fast enough to skip past sections without seeing them. */
export function isTooFast(velocity: number, viewportHeight: number): boolean {
  return Math.abs(velocity) > Math.max(BRAKE_MIN_SPEED, viewportHeight * BRAKE_VIEWPORT_FACTOR)
}

/** Index of the section active at scroll offset `y`, given each section's activation offset. */
export function sectionIndexAt(anchors: number[], y: number): number {
  let i = 0
  anchors.forEach((a, k) => {
    if (Number.isFinite(a) && a <= y) i = k
  })
  return i
}

/** The neighbouring section a brake stops at, clamped to the page. */
export function brakeTarget(from: number, direction: 1 | -1): number {
  return Math.min(SECTIONS.length - 1, Math.max(0, from + direction))
}
