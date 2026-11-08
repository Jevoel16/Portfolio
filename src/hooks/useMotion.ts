import { useSyncExternalStore } from 'react'

export type Motion = 'full' | 'reduced'

const KEY = 'sprucetrap-motion'

/** Site motion setting: full by default on every device, paused by the header chip, not the OS. */
function readStored(): Motion {
  try {
    return localStorage.getItem(KEY) === 'reduced' ? 'reduced' : 'full'
  } catch {
    return 'full'
  }
}

let current: Motion | undefined
const listeners = new Set<() => void>()

const getMotion = (): Motion => (current ??= readStored())

/** Mirrors the setting on <html> so CSS can stop its own animations with `[data-motion='reduced']`. */
export function applyMotionAttribute() {
  document.documentElement.dataset.motion = getMotion()
}

export function setMotion(next: Motion) {
  current = next
  try {
    localStorage.setItem(KEY, next)
  } catch {
    /* storage blocked: the choice lasts for this page view only */
  }
  applyMotionAttribute()
  listeners.forEach((notify) => notify())
}

const subscribe = (notify: () => void) => {
  listeners.add(notify)
  return () => listeners.delete(notify)
}

/** Prerendered HTML and hydration assume full motion, matching the default. */
export const useMotion = () => useSyncExternalStore(subscribe, getMotion, () => 'full' as Motion)

export const useReducedMotion = () => useMotion() === 'reduced'
