import { useSyncExternalStore } from 'react'
import { useMediaQuery } from './useMediaQuery'

interface NetworkInformation {
  saveData?: boolean
  effectiveType?: string
}

interface SceneSupport {
  webgl: boolean
  /** Draw fewer background stars on data saver or slow connections. */
  lite: boolean
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

function isLite(): boolean {
  const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection
  return !!conn?.saveData || (!!conn?.effectiveType && ['slow-2g', '2g', '3g'].includes(conn.effectiveType))
}

// Probed once per page load; a stable object keeps useSyncExternalStore from re-rendering.
let support: SceneSupport | undefined
const clientSupport = () =>
  (support ??= {
    webgl: new URLSearchParams(window.location.search).get('mode') !== 'static' && hasWebGL(),
    lite: isLite(),
  })
const SERVER: SceneSupport = { webgl: false, lite: false }
const noSubscribe = () => () => {}

/**
 * Whether the 3D sky can run here. `?mode=static` forces the SVG fallback, for testing it.
 * The prerendered page always starts with the static map; the scene mounts after hydration.
 */
export function useSceneSupport() {
  return useSyncExternalStore(noSubscribe, clientSupport, () => SERVER)
}

export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')

/** Touch-first devices (phones, tablets), where there is no hover. */
export const useCoarsePointer = () => useMediaQuery('(pointer: coarse)')
