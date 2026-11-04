import { describe, expect, it } from 'vitest'
import { bodies } from './bodies'
import { constellationById, constellations, starForId, starItem } from './constellations'
import { postBySlug } from '../content/posts'
import { projects } from './projects'

// Guards the hand-edited data files: a typo here breaks a star, a panel or a URL silently.
describe('portfolio data', () => {
  it('has unique ids across projects and bodies', () => {
    const ids = [...projects.map((p) => p.id), ...bodies.map((b) => b.id)]
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('uses lowercase hyphenated slugs for project ids', () => {
    for (const p of projects) expect(p.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })

  it('gives every project a star in its own constellation', () => {
    for (const p of projects) {
      const entry = starForId.get(p.id)
      expect(entry, `${p.id} has no star`).toBeDefined()
      expect(entry!.constellation.id).toBe(p.constellation)
    }
  })

  it('only points stars at real projects', () => {
    const ids = new Set(projects.map((p) => p.id))
    for (const c of constellations)
      for (const s of c.stars) if (s.projectId) expect(ids.has(s.projectId), s.projectId).toBe(true)
  })

  it('only points write-up stars at published posts', () => {
    for (const c of constellations)
      for (const s of c.stars)
        if (s.postSlug) {
          expect(postBySlug.has(s.postSlug), s.postSlug).toBe(true)
          expect(starItem(s)?.id).toBe(`post:${s.postSlug}`)
        }
  })

  it('only draws edges between stars of the same constellation', () => {
    for (const c of constellations) {
      const keys = new Set(c.stars.map((s) => s.key))
      expect(keys.size).toBe(c.stars.length)
      for (const [a, b] of c.edges) expect(keys.has(a) && keys.has(b), `${c.id}: ${a}-${b}`).toBe(true)
    }
  })

  it('links every project to an https GitHub repository', () => {
    for (const p of projects) {
      const url = new URL(p.url)
      expect(url.protocol).toBe('https:')
      expect(url.hostname).toBe('github.com')
    }
  })

  it('references known constellations', () => {
    for (const p of projects) expect(constellationById.has(p.constellation)).toBe(true)
  })
})
