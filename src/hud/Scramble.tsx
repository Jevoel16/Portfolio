import { useEffect, useState } from 'react'

const GLYPHS = '01<>/\\[]{}#$%&*+=?ABCDEFXYZ'

/** Text that "decrypts" for ~350 ms whenever `active` turns on: random glyphs resolving left to right. */
export function Scramble({ text, active, enabled = true }: { text: string; active: boolean; enabled?: boolean }) {
  const [shown, setShown] = useState(text)

  useEffect(() => {
    if (!active || !enabled) {
      setShown(text)
      return
    }
    const start = performance.now()
    let id = 0
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / 350)
      const solved = Math.floor(k * text.length)
      setShown(
        text
          .split('')
          .map((ch, i) => (i < solved || ch === ' ' ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(''),
      )
      if (k < 1) id = requestAnimationFrame(step)
    }
    id = requestAnimationFrame(step)
    return () => cancelAnimationFrame(id)
  }, [active, enabled, text])

  return <>{shown}</>
}
