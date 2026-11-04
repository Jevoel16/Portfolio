// Loaded on demand with React.lazy, so three.js only downloads when WebGL is available.
import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { poseAt, track, waypointFor, type Pose, type Waypoint } from '../scroll/cameraPath'
import { Bodies } from './Bodies'
import { ShootingStars } from './ShootingStars'
import { SkyLines } from './SkyLines'
import { SkyPackets } from './SkyPackets'
import { skyLayout } from './skyLayout'
import { SkyStars } from './SkyStars'
import { Nebula, Starfield } from './Starfield'

interface Props {
  portrait: boolean
  /** Body of the section in view, drawn slightly larger. */
  activeBody: string | null
  onReady: () => void
  reducedMotion: boolean
  /** Lower star count, for data saver and slow connections. */
  lite: boolean
}

/** Ambient motion is slow, so it renders at ~30 fps; camera flights render at full rate. */
const AMBIENT_FPS = 30
/** Vertical position of the focus line that drives the camera, as a fraction of the viewport. */
const FOCUS = 0.5
const noop = () => {}

/**
 * The night sky as a fixed backdrop behind the scrolling page. It takes no input: the page scroll
 * drives the camera between the waypoints marked with `data-cam` on the page's sections.
 */
export default function ScrollSky({ reducedMotion, lite, portrait, activeBody, onReady }: Props) {
  // Phones have dense screens and weak GPUs: fewer pixels and no MSAA keep the flight at frame rate.
  const narrow = useMemo(() => window.innerWidth < 760, [])
  const starCount = lite ? 1200 : narrow ? 2200 : 4500
  const layout = useMemo(() => skyLayout(portrait), [portrait])
  const animate = !reducedMotion

  return (
    <div className="space-canvas" aria-hidden="true">
      <Canvas
        dpr={narrow ? [1, 1.25] : [1, 1.5]}
        frameloop="demand"
        gl={{ antialias: !narrow, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: 50, near: 0.1, far: 400, position: [0, 0, 16] }}
        // The canvas is a fixed backdrop, so scrolling never moves it; don't re-measure on every scroll.
        resize={{ scroll: false, debounce: { scroll: 0, resize: 150 } }}
        // Purely decorative: the page above it owns every gesture, including scrolling.
        style={{ pointerEvents: 'none' }}
      >
        <SceneContent layout={layout} portrait={portrait} activeBody={activeBody} animate={animate} starCount={starCount} onReady={onReady} />
      </Canvas>
    </div>
  )
}

interface ContentProps {
  layout: ReturnType<typeof skyLayout>
  portrait: boolean
  activeBody: string | null
  animate: boolean
  starCount: number
  onReady: () => void
}

function SceneContent({ layout, portrait, activeBody, animate, starCount, onReady }: ContentProps) {
  const group = useRef<THREE.Group>(null)
  const readySent = useRef(false)

  useFrame(({ clock }) => {
    if (!readySent.current) {
      readySent.current = true
      requestAnimationFrame(onReady)
    }
    // A slow sway gives a sense of depth on top of the scroll flight.
    if (animate && group.current) {
      const t = clock.elapsedTime
      group.current.rotation.y = Math.sin(t * 0.07) * 0.05
      group.current.rotation.x = Math.sin(t * 0.05) * 0.02
    }
  })

  return (
    <>
      <AmbientTicker animate={animate} />
      <Starfield count={starCount} animate={animate} />
      {animate && <ShootingStars />}
      <group ref={group}>
        <Nebula />
        <SkyLines edges={layout.edges} />
        {animate && <SkyPackets edges={layout.edges} />}
        <SkyStars stars={layout.stars} selectedId={null} hoveredId={null} onHover={noop} onSelect={noop} animate={animate} />
        <Bodies portrait={portrait} selectedId={activeBody} hoveredId={null} onHover={noop} onSelect={noop} animate={animate} touch={false} />
      </group>
      <ScrollRig portrait={portrait} />
    </>
  )
}

/** Requests frames for ambient motion at a capped rate; nothing at all under reduced motion. */
function AmbientTicker({ animate }: { animate: boolean }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    if (!animate) return
    let id = 0
    let last = 0
    const tick = (t: number) => {
      if (t - last >= 1000 / AMBIENT_FPS - 2) {
        last = t
        invalidate()
      }
      id = requestAnimationFrame(tick)
    }
    // requestAnimationFrame also pauses by itself while the tab is hidden.
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [animate, invalidate])
  return null
}

/**
 * Maps the scroll position to a camera pose and eases the camera towards it. The flight follows the
 * reader's own scrolling, so it runs under reduced motion too; only the ambient effects stop.
 */
function ScrollRig({ portrait }: { portrait: boolean }) {
  const { camera, size, invalidate } = useThree()
  const goal = useRef<Pose | null>(null)
  const look = useRef(new THREE.Vector3())
  const goalPos = useRef(new THREE.Vector3())
  const goalTarget = useRef(new THREE.Vector3())
  // Only the very first pose snaps; a later resize (e.g. a phone's toolbar hiding) must fly, not jump.
  const snapNext = useRef(true)

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    const view = { portrait, aspect: size.width / Math.max(1, size.height), fov: cam.fov }
    let points: { el: HTMLElement; wp: Waypoint }[] = []
    let frame = 0

    const collect = () => {
      points = [...document.querySelectorAll<HTMLElement>('[data-cam]')].flatMap((el) => {
        const wp = waypointFor(el.dataset.cam ?? '', view)
        return wp ? [{ el, wp }] : []
      })
    }

    const update = () => {
      frame = 0
      if (points.length === 0) return
      const centers = points.map(({ el }) => {
        const r = el.getBoundingClientRect()
        // Tall sections steer from their upper part, where their heading is.
        return r.top + Math.min(r.height / 2, window.innerHeight * 0.45)
      })
      const { i, t } = track(centers, window.innerHeight * FOCUS)
      goal.current = poseAt(
        points.map((p) => p.wp),
        i,
        t,
      )
      goalPos.current.set(...goal.current.pos)
      goalTarget.current.set(...goal.current.target)
      // The first pose is applied at once, without a flight.
      if (snapNext.current) {
        snapNext.current = false
        camera.position.copy(goalPos.current)
        look.current.copy(goalTarget.current)
        camera.lookAt(look.current)
      }
      invalidate()
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    collect()
    update()
    // Section heights change as fonts and lazy content load; recollect so waypoints stay accurate.
    const ro = new ResizeObserver(onScroll)
    ro.observe(document.body)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [camera, size.width, size.height, portrait, invalidate])

  useFrame((_, dt) => {
    if (!goal.current) return
    // Frames can be far apart in on-demand mode; cap dt so a flight never jumps.
    const k = 1 - Math.exp(-Math.min(dt, 0.05) * 4)
    camera.position.lerp(goalPos.current, k)
    look.current.lerp(goalTarget.current, k)
    camera.lookAt(look.current)
    if (camera.position.distanceTo(goalPos.current) > 0.002 || look.current.distanceTo(goalTarget.current) > 0.002) invalidate()
  })

  return null
}
