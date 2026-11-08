import { useCallback, useEffect, useRef, useState } from 'react'

/** Prerendered HTML shows the full line, so no-JS visitors can still read it. */
export function useTypewriter(text: string, { running, instant, cps = 38 }: { running: boolean; instant: boolean; cps?: number }) {
  const [count, setCount] = useState(text.length)
  const timer = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    if (instant) {
      setCount(text.length)
      return
    }
    setCount(0)
    if (!running) return
    timer.current = setInterval(() => {
      setCount((c) => {
        if (c + 1 >= text.length) clearInterval(timer.current)
        return Math.min(c + 1, text.length)
      })
    }, 1000 / cps)
    return () => clearInterval(timer.current)
  }, [text, running, instant, cps])

  const finish = useCallback(() => {
    clearInterval(timer.current)
    setCount(text.length)
  }, [text])

  return { shown: text.slice(0, count), typing: count < text.length && running && !instant, finish }
}
