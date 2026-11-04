import { describe, expect, it } from 'vitest'
import { bodies } from '../data/bodies'
import { SECTIONS, hrefForSection, locationForSection, sectionForLocation } from './sections'

describe('scroll sections', () => {
  it('round-trips every section through its location', () => {
    for (const id of SECTIONS) {
      const { pathname, hash } = locationForSection(id)
      expect(sectionForLocation(pathname, hash)).toBe(id)
    }
  })

  it('keeps every body on its own indexable path', () => {
    for (const b of bodies) {
      expect(SECTIONS).toContain(b.id)
      expect(hrefForSection(b.id)).toBe(`/${b.id}`)
    }
  })

  it('treats the root, trailing slashes and unknown hashes as expected', () => {
    expect(sectionForLocation('/')).toBe('home')
    expect(sectionForLocation('/', '#nope')).toBe('home')
    expect(sectionForLocation('/contact/')).toBe('contact')
    expect(hrefForSection('projects')).toBe('/#projects')
  })

  it('ignores paths that are not on the scroll page', () => {
    expect(sectionForLocation('/projects/rankit')).toBeUndefined()
    expect(sectionForLocation('/blog')).toBeUndefined()
    expect(sectionForLocation('/nope')).toBeUndefined()
  })
})
