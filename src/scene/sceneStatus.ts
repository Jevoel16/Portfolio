/** Lifecycle of the lazy 3D sky: it waits for the page to settle, loads once, then renders or falls back to the static map for good. */
export type SceneStatus = 'waiting' | 'loading' | 'ready' | 'failed'
export type SceneEvent = 'START' | 'READY' | 'FAIL'

const TRANSITIONS: Record<SceneStatus, Partial<Record<SceneEvent, SceneStatus>>> = {
  waiting: { START: 'loading' },
  loading: { READY: 'ready', FAIL: 'failed' },
  ready: { FAIL: 'failed' },
  failed: {},
}

/** Returns the next status, or the same one when the event isn't allowed from here. */
export function sceneTransition(status: SceneStatus, event: SceneEvent): SceneStatus {
  return TRANSITIONS[status][event] ?? status
}

/** Calls `start` once the page has loaded and the browser is idle, so the prerendered page paints before three.js runs. */
export function whenPageSettled(start: () => void, win: Window = window): () => void {
  let idle = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  const schedule = () => {
    if ('requestIdleCallback' in win) idle = win.requestIdleCallback(start, { timeout: 1500 })
    else timer = setTimeout(start, 200)
  }
  if (win.document.readyState === 'complete') schedule()
  else win.addEventListener('load', schedule, { once: true })
  return () => {
    win.removeEventListener('load', schedule)
    if (idle) win.cancelIdleCallback(idle)
    clearTimeout(timer)
  }
}
