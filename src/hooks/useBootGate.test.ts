import { afterEach, describe, expect, it, vi } from 'vitest'
import { settleWithin } from './useBootGate'

describe('settleWithin', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('settles once every task is done and reports progress', async () => {
    const progress: number[] = []
    const result = await settleWithin([Promise.resolve(1), Promise.resolve(2)], 1000, (n) => progress.push(n))
    expect(result).toBe('all')
    expect(progress).toEqual([1, 2])
  })

  it('counts a failed task as done', async () => {
    const result = await settleWithin([Promise.reject(new Error('no avatar')), Promise.resolve()], 1000)
    expect(result).toBe('all')
  })

  it('gives up after the cap when a task hangs', async () => {
    vi.useFakeTimers()
    const pending = settleWithin([new Promise(() => {}), Promise.resolve()], 4000)
    await vi.advanceTimersByTimeAsync(4000)
    await expect(pending).resolves.toBe('timeout')
  })
})
