import { describe, expect, it } from 'vitest'
import { DIALOGUE, MAX_LINE } from './dialogue'

describe('avatar dialogue', () => {
  it('has lines to say', () => {
    expect(DIALOGUE.length).toBeGreaterThan(1)
  })

  it('keeps every line non-empty and short enough for the bubble', () => {
    for (const line of DIALOGUE) {
      expect(line.trim().length).toBeGreaterThan(0)
      expect(line.length).toBeLessThanOrEqual(MAX_LINE)
    }
  })
})
