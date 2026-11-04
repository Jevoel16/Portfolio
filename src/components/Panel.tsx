import { useEffect, useRef, type PointerEvent, type ReactNode } from 'react'

interface Props {
  accent: string
  /** id of the heading inside children that names the dialog. */
  labelledBy: string
  closeLabel: string
  onClose: () => void
  children: ReactNode
}

/** Dialog shell shared by every panel: side sheet on desktop, bottom sheet on phones. */
export function Panel({ accent, labelledBy, closeLabel, onClose, children }: Props) {
  const panelRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const drag = useRef<{ y: number; dy: number } | null>(null)

  // Bottom sheet on phones: drag the handle down to dismiss, or let go early to snap back.
  const onDragStart = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse') return
    drag.current = { y: e.clientY, dy: 0 }
    e.currentTarget.setPointerCapture(e.pointerId)
    panelRef.current?.classList.add('dragging')
  }
  const onDragMove = (e: PointerEvent<HTMLElement>) => {
    if (!drag.current || !panelRef.current) return
    drag.current.dy = Math.max(0, e.clientY - drag.current.y)
    panelRef.current.style.transform = `translateY(${drag.current.dy}px)`
  }
  const onDragEnd = () => {
    const panel = panelRef.current
    if (!drag.current || !panel) return
    const { dy } = drag.current
    drag.current = null
    panel.classList.remove('dragging')
    panel.style.transform = ''
    if (dy > Math.min(120, panel.offsetHeight * 0.25)) onClose()
  }

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    // preventScroll: focusing must not nudge the fixed full-screen layout on mobile browsers.
    closeRef.current?.focus({ preventScroll: true })
    return () => previous?.focus?.({ preventScroll: true })
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusable = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      <div className="panel-backdrop" onClick={onClose} aria-hidden="true" />
      <aside
        ref={panelRef}
        className="panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        style={{ '--accent': accent } as React.CSSProperties}
      >
        <span
          className="panel-handle"
          aria-hidden="true"
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
        />
        <button ref={closeRef} type="button" className="panel-close" onClick={onClose} aria-label={closeLabel}>
          ×
        </button>
        {children}
      </aside>
    </>
  )
}
