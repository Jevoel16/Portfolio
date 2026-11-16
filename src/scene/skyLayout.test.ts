import { describe, expect, it } from 'vitest'
import { skyLayout } from './skyLayout'

describe('skyLayout', () => {
  it('draws the same sky in both schemes, darker in Light', () => {
    const dark = skyLayout(false)
    const light = skyLayout(false, true)
    expect(light.stars).toHaveLength(dark.stars.length)
    expect(light.edges).toHaveLength(dark.edges.length)
    dark.stars.forEach((s, i) => expect(light.stars[i].color.getHSL({ h: 0, s: 0, l: 0 }).l).toBeLessThan(s.color.getHSL({ h: 0, s: 0, l: 0 }).l))
  })
})
