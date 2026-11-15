/** Lifecycle of the lazy 3D sky: it loads once, then either renders or falls back to the static map for good. */
export type SceneStatus = 'loading' | 'ready' | 'failed'
export type SceneEvent = 'READY' | 'FAIL'

const TRANSITIONS: Record<SceneStatus, Partial<Record<SceneEvent, SceneStatus>>> = {
  loading: { READY: 'ready', FAIL: 'failed' },
  ready: { FAIL: 'failed' },
  failed: {},
}

/** Returns the next status, or the same one when the event isn't allowed from here. */
export function sceneTransition(status: SceneStatus, event: SceneEvent): SceneStatus {
  return TRANSITIONS[status][event] ?? status
}
