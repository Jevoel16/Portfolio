import { describe, expect, it } from 'vitest'
import { sceneTransition } from './sceneStatus'

describe('sceneTransition', () => {
  it('goes from loading to ready when the sky renders', () => {
    expect(sceneTransition('loading', 'READY')).toBe('ready')
  })

  it('goes from loading to failed when the chunk or WebGL fails', () => {
    expect(sceneTransition('loading', 'FAIL')).toBe('failed')
  })

  it('falls back to failed when a ready sky crashes later', () => {
    expect(sceneTransition('ready', 'FAIL')).toBe('failed')
  })

  it('ignores READY again once ready', () => {
    expect(sceneTransition('ready', 'READY')).toBe('ready')
  })

  it('never leaves failed', () => {
    expect(sceneTransition('failed', 'READY')).toBe('failed')
    expect(sceneTransition('failed', 'FAIL')).toBe('failed')
  })
})
