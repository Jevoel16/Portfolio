import { useEffect, useState, type RefObject } from 'react'

const isTall = (w: number, h: number) => h > w * 0.95

/** True when the sky stage is taller than it is wide, so the sky map rotates to fit. */
export function usePortrait(ref: RefObject<HTMLElement>, active: boolean) {
  const [portrait, setPortrait] = useState(() => isTall(window.innerWidth, window.innerHeight * 0.7))
  useEffect(() => {
    const el = ref.current
    if (!active || !el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width && height) setPortrait(isTall(width, height))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, active])
  return portrait
}
