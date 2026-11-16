import { useCallback, useSyncExternalStore } from 'react'

export type ThemeChoice = 'system' | 'light' | 'dark'
export type Scheme = 'light' | 'dark'

/** Same key and parsing as the pre-paint script in index.html; keep the two in step. */
export const THEME_KEY = 'sprucetrap-theme'

export const THEMES: readonly { id: ThemeChoice; label: string; icon: string }[] = [
  { id: 'system', label: 'System', icon: 'M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8 21h8M12 17v4' },
  {
    id: 'light',
    label: 'Light',
    icon: 'M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8zM12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41',
  },
  { id: 'dark', label: 'Dark', icon: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' },
]

/** Anything but `light` or `dark` means System. */
export function parseTheme(saved: string | null | undefined): ThemeChoice {
  return saved === 'light' || saved === 'dark' ? saved : 'system'
}

export function resolveScheme(choice: ThemeChoice, prefersLight: boolean): Scheme {
  if (choice !== 'system') return choice
  return prefersLight ? 'light' : 'dark'
}

const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

function currentChoice(): ThemeChoice {
  return parseTheme(document.documentElement.dataset.theme)
}

/** System removes the attribute and the saved value; Light and Dark set and save it. */
export function applyTheme(choice: ThemeChoice) {
  const root = document.documentElement
  try {
    if (choice === 'system') localStorage.removeItem(THEME_KEY)
    else localStorage.setItem(THEME_KEY, choice)
  } catch {
    /* storage blocked: the theme still applies for this visit */
  }
  if (choice === 'system') delete root.dataset.theme
  else root.dataset.theme = choice
  notify()
}

const LIGHT_QUERY = '(prefers-color-scheme: light)'

function subscribe(l: () => void) {
  listeners.add(l)
  // Another tab changed the theme: follow it.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== THEME_KEY) return
    const next = parseTheme(e.newValue)
    if (next === 'system') delete document.documentElement.dataset.theme
    else document.documentElement.dataset.theme = next
    notify()
  }
  const media = window.matchMedia(LIGHT_QUERY)
  window.addEventListener('storage', onStorage)
  media.addEventListener('change', l)
  return () => {
    listeners.delete(l)
    window.removeEventListener('storage', onStorage)
    media.removeEventListener('change', l)
  }
}

/** The picker's value; prerendered HTML always shows System until hydration. */
export function useThemeChoice() {
  const choice = useSyncExternalStore(subscribe, currentChoice, () => 'system' as ThemeChoice)
  return [choice, useCallback((c: ThemeChoice) => applyTheme(c), [])] as const
}

/** The scheme actually on screen, for code that can't read CSS (the WebGL sky). */
export function useResolvedScheme(): Scheme {
  return useSyncExternalStore(
    subscribe,
    () => resolveScheme(currentChoice(), window.matchMedia(LIGHT_QUERY).matches),
    () => 'dark' as Scheme,
  )
}
