import { useEffect, useRef, useState } from 'react'
import { AVATAR } from '../data/profile'
import { clientSceneSupport } from './useSceneSupport'

/** Longest the page waits before letting the visitor scroll, so slow phones never get stuck. */
export const BOOT_CAP_MS = 4000
/** Fonts, the avatar and the 3D sky. */
export const BOOT_TASKS = 3

const noop = () => {}

/**
 * Settles when every task has settled (a rejection counts as done) or after `ms`, whichever comes first.
 * `onSettle` gets the running count of finished tasks, for a progress readout.
 */
export function settleWithin(tasks: Promise<unknown>[], ms: number, onSettle?: (done: number) => void): Promise<'all' | 'timeout'> {
  let done = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  const all = Promise.all(tasks.map((t) => t.then(noop, noop).then(() => onSettle?.(++done)))).then(() => 'all' as const)
  const cap = new Promise<'timeout'>((resolve) => {
    timer = setTimeout(() => resolve('timeout'), ms)
  })
  return Promise.race([all, cap]).finally(() => clearTimeout(timer))
}

function deferred() {
  let resolve = noop
  const promise = new Promise<void>((r) => (resolve = r))
  return { promise, resolve }
}

function avatarDecoded(): Promise<unknown> {
  const img = new Image()
  img.src = AVATAR.src
  return img.decode()
}

const fontsLoaded = (): Promise<unknown> => document.fonts?.ready ?? Promise.resolve()

// Once open, the gate stays open for this page lifetime (e.g. coming back from a project page).
let booted = false

/**
 * Holds the scroll page in a short "boot" until the fonts, the avatar and the 3D sky are ready, so
 * none of them load in the middle of a camera flight. `sceneSettled` is true once the sky has
 * compiled or failed; without WebGL the sky isn't waited for.
 */
export function useBootGate(sceneSettled: boolean) {
  const [ready, setReady] = useState(() => booted)
  const [done, setDone] = useState(0)
  const scene = useRef<ReturnType<typeof deferred>>()
  scene.current ??= deferred()

  useEffect(() => {
    if (sceneSettled || !clientSceneSupport().webgl) scene.current!.resolve()
  }, [sceneSettled])

  useEffect(() => {
    if (booted) return
    let live = true
    void settleWithin([fontsLoaded(), avatarDecoded(), scene.current!.promise], BOOT_CAP_MS, (n) => live && setDone(n)).then(() => {
      if (!live) return
      booted = true
      setReady(true)
    })
    return () => {
      live = false
    }
  }, [])

  return { ready, done, total: BOOT_TASKS }
}
