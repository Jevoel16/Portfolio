import { describe, expect, it } from 'vitest'
import { bodies } from '../data/bodies'
import { SECTIONS, brakeTarget, hrefForSection, isTooFast, locationForSection, scrollVelocity, sectionForLocation, sectionIndexAt, sectionProgress } from './sections'

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

describe('sectionProgress', () => {
  const anchors = [0, 400, 2400, 3000, 3600]

  it('runs from 0 at the top to 1 at the bottom', () => {
    expect(sectionProgress(anchors, 0, 4000)).toBe(0)
    expect(sectionProgress(anchors, 4000, 4000)).toBe(1)
  })

  it('reaches k / (n - 1) exactly when section k becomes active', () => {
    anchors.forEach((y, k) => expect(sectionProgress(anchors, y, 4000)).toBeCloseTo(k / 4))
  })

  it('never goes backwards while scrolling down', () => {
    let prev = -1
    for (let y = 0; y <= 4000; y += 50) {
      const p = sectionProgress(anchors, y, 4000)
      expect(p).toBeGreaterThanOrEqual(prev)
      prev = p
    }
  })

  it('treats a last section that cannot reach the focus line as reached at the bottom', () => {
    expect(sectionProgress([0, 400, 5000], 1000, 1000)).toBe(1)
    expect(sectionProgress([0, 400, 5000], 700, 1000)).toBeCloseTo(0.75)
  })

  it('handles empty pages, zero-length segments and bad input', () => {
    expect(sectionProgress(anchors, 100, 0)).toBe(0)
    expect(sectionProgress([0], 100, 1000)).toBe(0)
    expect(sectionProgress([0, 300, 300, 900], 300, 900)).toBeCloseTo(2 / 3)
    expect(sectionProgress(anchors, Number.NaN, 4000)).toBe(0)
  })
})

describe('fast-scroll brake helpers', () => {
  it('measures signed speed across the samples', () => {
    expect(scrollVelocity([])).toBe(0)
    expect(scrollVelocity([{ y: 0, t: 0 }])).toBe(0)
    expect(scrollVelocity([{ y: 0, t: 10 }, { y: 0, t: 10 }])).toBe(0)
    expect(scrollVelocity([{ y: 0, t: 0 }, { y: 150, t: 50 }, { y: 300, t: 100 }])).toBe(3)
    expect(scrollVelocity([{ y: 300, t: 0 }, { y: 0, t: 100 }])).toBe(-3)
  })

  it('only brakes clearly fast scrolling', () => {
    expect(isTooFast(1, 800)).toBe(false)
    expect(isTooFast(3, 800)).toBe(false)
    expect(isTooFast(3.3, 800)).toBe(true)
    expect(isTooFast(-3.3, 800)).toBe(true)
    expect(isTooFast(2.6, 400)).toBe(true)
  })

  it('finds the active section at a scroll offset', () => {
    const anchors = [-300, 400, 2400, Number.NaN, 3600]
    expect(sectionIndexAt(anchors, 0)).toBe(0)
    expect(sectionIndexAt(anchors, 400)).toBe(1)
    expect(sectionIndexAt(anchors, 3000)).toBe(2)
    expect(sectionIndexAt(anchors, 9000)).toBe(4)
  })

  it('stops at the neighbouring section, never off the page', () => {
    expect(brakeTarget(2, 1)).toBe(3)
    expect(brakeTarget(2, -1)).toBe(1)
    expect(brakeTarget(0, -1)).toBe(0)
    expect(brakeTarget(SECTIONS.length - 1, 1)).toBe(SECTIONS.length - 1)
  })
})
