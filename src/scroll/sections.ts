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
