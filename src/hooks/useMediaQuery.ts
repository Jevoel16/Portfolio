import { useCallback, useSyncExternalStore } from 'react'

/** Same query in CSS (static map) and JS (3D scene), so both skies rotate together. */
export const PORTRAIT_QUERY = '(max-aspect-ratio: 1/1)'

/** Hydration uses `serverValue` first, so prerendered markup never mismatches. */
export function useMediaQuery(query: string, serverValue = false) {
  const subscribe = useCallback(
    (notify: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', notify)
      return () => mql.removeEventListener('change', notify)
    },
    [query],
  )
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  )
}
