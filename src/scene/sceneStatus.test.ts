import { describe, expect, it, vi } from 'vitest'
import { sceneTransition, whenPageSettled } from './sceneStatus'

describe('sceneTransition', () => {
  it('starts loading from waiting', () => {
    expect(sceneTransition('waiting', 'START')).toBe('loading')
  })

  it('ignores READY and FAIL before the sky has started', () => {
    expect(sceneTransition('waiting', 'READY')).toBe('waiting')
    expect(sceneTransition('waiting', 'FAIL')).toBe('waiting')
  })

  it('goes from loading to ready when the sky renders', () => {
    expect(sceneTransition('loading', 'READY')).toBe('ready')
  })

  it('goes from loading to failed when the chunk or WebGL fails', () => {
    expect(sceneTransition('loading', 'FAIL')).toBe('failed')
  })

  it('falls back to failed when a ready sky crashes later', () => {
    expect(sceneTransition('ready', 'FAIL')).toBe('failed')
  })

  it('ignores READY and START again once ready', () => {
    expect(sceneTransition('ready', 'READY')).toBe('ready')
    expect(sceneTransition('ready', 'START')).toBe('ready')
  })

  it('never leaves failed', () => {
    expect(sceneTransition('failed', 'START')).toBe('failed')
    expect(sceneTransition('failed', 'READY')).toBe('failed')
    expect(sceneTransition('failed', 'FAIL')).toBe('failed')
  })
})

function fakeWindow(readyState: DocumentReadyState, idle = true) {
  const listeners: Record<string, () => void> = {}
  const win = {
    document: { readyState },
    addEventListener: vi.fn((type: string, fn: () => void) => (listeners[type] = fn)),
    removeEventListener: vi.fn(),
    ...(idle && {
      requestIdleCallback: vi.fn((fn: () => void) => {
        listeners.idle = fn
        return 7
      }),
      cancelIdleCallback: vi.fn(),
    }),
  }
  return { win: win as unknown as Window, listeners }
}

describe('whenPageSettled', () => {
  it('waits for the load event, then for an idle moment', () => {
    const { win, listeners } = fakeWindow('loading')
    const start = vi.fn()
    whenPageSettled(start, win)
    expect(start).not.toHaveBeenCalled()
    listeners.load()
    expect(start).not.toHaveBeenCalled()
    listeners.idle()
    expect(start).toHaveBeenCalledOnce()
  })

  it('goes straight to the idle wait when the page has already loaded', () => {
    const { win, listeners } = fakeWindow('complete')
    const start = vi.fn()
    whenPageSettled(start, win)
    listeners.idle()
    expect(start).toHaveBeenCalledOnce()
  })

  it('falls back to a short timeout without requestIdleCallback', () => {
    vi.useFakeTimers()
    const { win } = fakeWindow('complete', false)
    const start = vi.fn()
    whenPageSettled(start, win)
    vi.advanceTimersByTime(200)
    expect(start).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })

  it('cancels the pending idle callback on cleanup', () => {
    const { win } = fakeWindow('complete')
    const stop = whenPageSettled(vi.fn(), win)
    stop()
    expect(win.cancelIdleCallback).toHaveBeenCalledWith(7)
    expect(win.removeEventListener).toHaveBeenCalled()
  })
})
