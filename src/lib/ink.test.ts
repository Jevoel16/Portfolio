import { describe, expect, it } from 'vitest'
import { bodies } from '../data/bodies'
import { constellations } from '../data/constellations'
import { contrast, inkFor, themedAccent } from './ink'

describe('inkFor', () => {
  it('passes AA on cream and on the pale sky for every data colour', () => {
    const colours = [...constellations.map((c) => c.color), ...bodies.flatMap((b) => [b.color, b.color2])]
    for (const c of colours) {
      const ink = inkFor(c)
      expect(contrast(ink, '#f4ecdc')).toBeGreaterThanOrEqual(4.5)
      expect(contrast(ink, '#cfe1f0')).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('leaves a colour alone when it already passes', () => {
    expect(inkFor('#141a33')).toBe('#141a33')
  })
})

it('wraps the pair in light-dark()', () => {
  expect(themedAccent('#f5c86b')).toMatch(/^light-dark\(#[0-9a-f]{6}, #f5c86b\)$/)
})
