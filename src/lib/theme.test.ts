import { describe, expect, it } from 'vitest'
import { parseTheme, resolveScheme, THEMES } from './theme'

describe('parseTheme', () => {
  it('keeps light and dark', () => {
    expect(parseTheme('light')).toBe('light')
    expect(parseTheme('dark')).toBe('dark')
  })

  it('treats anything else as System', () => {
    for (const saved of [null, undefined, '', 'redteam', 'LIGHT', 'system']) expect(parseTheme(saved)).toBe('system')
  })
})

describe('resolveScheme', () => {
  it('follows the device only for System', () => {
    expect(resolveScheme('system', true)).toBe('light')
    expect(resolveScheme('system', false)).toBe('dark')
    expect(resolveScheme('light', false)).toBe('light')
    expect(resolveScheme('dark', true)).toBe('dark')
  })
})

it('offers System, Light and Dark in that order', () => {
  expect(THEMES.map((t) => t.id)).toEqual(['system', 'light', 'dark'])
})
