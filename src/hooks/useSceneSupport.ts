import { useEffect, useState } from 'react'

interface NetworkInformation {
  saveData?: boolean
  effectiveType?: string
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

/**
 * Whether the 3D sky can run here. `?mode=static` forces the SVG fallback, for testing it.
 * `lite` asks the scene to draw fewer background stars on data saver or slow connections.
 */
export function useSceneSupport() {
  const [support] = useState(() => ({
    webgl: new URLSearchParams(window.location.search).get('mode') !== 'static' && hasWebGL(),
    lite: isLite(),
  }))
  return support
}

export function usePrefersReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)'
  const [reduced, setReduced] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setReduced(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  return reduced
}
