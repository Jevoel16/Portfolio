import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router'
import { complete, QUICK_COMMANDS, runCommand } from './commands'
import { setTheme } from './theme'

interface Line {
  id: number
  text: string
  kind: 'in' | 'out' | 'err'
}

const WELCOME: Omit<Line, 'id'>[] = [
  { text: 'sprucetrap observatory — uplink established', kind: 'out' },
  { text: 'type `help`, or tap a command below. esc to close.', kind: 'out' },
]

let nextId = 0
const toLines = (items: Omit<Line, 'id'>[]) => items.map((l) => ({ ...l, id: nextId++ }))

/** Opens with ⌘K / Ctrl+K or "/" anywhere, or with any element that dispatches `open-terminal`. */
export function openTerminal() {
  window.dispatchEvent(new Event('open-terminal'))
}

/**
 * A small command line over the site: every command maps to a route, so it doubles as fast,
 * keyboard-only navigation. On phones it is a bottom sheet with tappable quick commands.
 */
export function CommandTerminal() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [lines, setLines] = useState<Line[]>(() => toLines(WELCOME))
  const history = useRef<string[]>([])
  const cursor = useRef(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const navigate = useNavigate()

  const show = useCallback(() => {
    returnFocus.current = document.activeElement as HTMLElement | null
    setOpen(true)
  }, [])
  const hide = useCallback(() => {
    setOpen(false)
    returnFocus.current?.focus?.({ preventScroll: true })
  }, [])

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing = target.closest('input, textarea, [contenteditable="true"]')
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        show()
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('open-terminal', show)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('open-terminal', show)
    }
  }, [show])

  useEffect(() => {
    if (open) inputRef.current?.focus({ preventScroll: true })
  }, [open])

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [lines])

  const run = (raw: string) => {
    const text = raw.trim()
    if (text) {
      history.current = [text, ...history.current.filter((h) => h !== text)].slice(0, 30)
    }
    cursor.current = -1
    const result = runCommand(text)
    const out = result.lines.map((l) => (l.startsWith('!') ? { text: l.slice(1), kind: 'err' as const } : { text: l, kind: 'out' as const }))
    setLines((prev) => (result.clear ? [] : [...prev, ...toLines([{ text: `visitor@sprucetrap:~$ ${text}`, kind: 'in' }, ...out])]))
    setInput('')
    if (result.theme) setTheme(result.theme)
    if (result.navigate) navigate(result.navigate)
    if (result.close) setTimeout(hide, result.navigate ? 250 : 0)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Keep keys inside the terminal: Escape must not also close a panel underneath.
    e.stopPropagation()
    if (e.key === 'Escape') {
      e.preventDefault()
      hide()
    } else if (e.key === 'Tab' && e.target === inputRef.current) {
      e.preventDefault()
      setInput((v) => complete(v))
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      if (e.target !== inputRef.current || !history.current.length) return
      e.preventDefault()
      const max = history.current.length - 1
      cursor.current = e.key === 'ArrowUp' ? Math.min(cursor.current + 1, max) : Math.max(cursor.current - 1, -1)
      setInput(cursor.current < 0 ? '' : history.current[cursor.current])
    }
  }

  if (!open) return null

  return (
    <>
      <div className="terminal-backdrop" onClick={hide} aria-hidden="true" />
      <div className="terminal" role="dialog" aria-modal="true" aria-label="Command terminal" onKeyDown={onKeyDown}>
        <div className="terminal-bar mono">
          <span aria-hidden="true">● ● ●</span>
          <span>visitor@sprucetrap — tty1</span>
          <button type="button" className="terminal-close" onClick={hide} aria-label="Close terminal">
            esc
          </button>
        </div>
        <div ref={logRef} className="terminal-log mono" aria-live="polite">
          {lines.map((l) => (
            <p key={l.id} className={l.kind}>
              {l.text}
            </p>
          ))}
        </div>
        <form
          className="terminal-input mono"
          onSubmit={(e) => {
            e.preventDefault()
            run(input)
          }}
        >
          <label htmlFor="terminal-cmd">visitor@sprucetrap:~$</label>
          <input
            ref={inputRef}
            id="terminal-cmd"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
          />
        </form>
        <ul className="terminal-quick" aria-label="Quick commands">
          {QUICK_COMMANDS.map((c) => (
            <li key={c}>
              <button type="button" className="mono" onClick={() => run(c)}>
                {c}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
