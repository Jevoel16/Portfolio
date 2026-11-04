import { useCallback, useEffect, useSyncExternalStore } from 'react'
import type { Theme } from './commands'

const KEY = 'sprucetrap-theme'
const listeners = new Set<() => void>()

function read(): Theme {
  try {
    return localStorage.getItem(KEY) === 'redteam' ? 'redteam' : 'default'
  } catch {
    return 'default'
  }
}

/** Applies the HUD theme to <html>; it is a per-visitor nicety, so storage failures are ignored. */
export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* private mode or blocked storage: the theme still applies for this visit */
  }
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, () => (document.documentElement.dataset.theme as Theme) || 'default', () => 'default' as Theme)
  // Restore the saved theme after hydration, so prerendered HTML always matches the first render.
  useEffect(() => {
    if (read() !== 'default') setTheme(read())
  }, [])
  return [theme, useCallback((t: Theme) => setTheme(t), [])] as const
}

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

/** ↑↑↓↓←→←→BA toggles red team mode. */
export function useKonami(onUnlock: () => void) {
  useEffect(() => {
    let i = 0
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      i = key === KONAMI[i] ? i + 1 : key === KONAMI[0] ? 1 : 0
      if (i === KONAMI.length) {
        i = 0
        onUnlock()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onUnlock])
}
