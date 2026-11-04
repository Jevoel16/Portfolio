import type { CSSProperties, ReactNode } from 'react'
import { useReveal } from '../scroll/useReveal'

interface Props {
  className?: string
  style?: CSSProperties
  /** Stagger, in ms, for items revealed together. */
  delay?: number
  children: ReactNode
}

/** Wrapper that plays the scan-line "signal acquired" reveal when it first scrolls into view. */
export function Reveal({ className, style, delay = 0, children }: Props) {
  const [ref, state] = useReveal<HTMLDivElement>()
  return (
    <div ref={ref} className={className} data-reveal={state} style={{ ...style, '--reveal-delay': `${delay}ms` } as CSSProperties}>
      {children}
    </div>
  )
}
