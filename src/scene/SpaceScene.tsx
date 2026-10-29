// Loaded on demand with React.lazy, so three.js only downloads when WebGL is available.
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { constellations, skyBounds, targetFor } from '../data/constellations'
import { Bodies } from './Bodies'
import { Constellation } from './Constellation'
import { ShootingStars } from './ShootingStars'
import { Nebula, Starfield } from './Starfield'

interface Props {
  portrait: boolean
  selectedId: string | null
  onSelect: (id: string) => void
  /** Tap or click on empty sky. */
  onDismiss: () => void
  onReady: () => void
  /** Whether the camera has left its home view, so the HUD can offer a way back. */
  onAwayChange: (away: boolean) => void
  /** Bumped by the HUD's Recenter button. */
  recenter: number
  reducedMotion: boolean
  /** Lower star count, for data saver and slow connections. */
  lite: boolean
  /** The part of the screen the constellations should be framed into (between the HUD bars). */
  stageRef: RefObject<HTMLElement>
}

export default function SpaceScene({ onDismiss, reducedMotion, lite, ...rest }: Props) {
  const [hidden, setHidden] = useState(document.hidden)
  const starCount = useMemo(() => (lite ? 1200 : window.innerWidth < 760 ? 2200 : 4500), [lite])

  // Nothing to draw while the tab is in the background.
  useEffect(() => {
    const onChange = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  return (
    <div className="space-canvas">
      <Canvas
        dpr={[1, 1.5]}
        frameloop={hidden ? 'never' : 'always'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: 50, near: 0.1, far: 400, position: [0, 0, 16] }}
        onPointerMissed={onDismiss}
        // The sky owns every gesture: drag to look, pinch to zoom. The page itself never scrolls.
        style={{ touchAction: 'none' }}
      >
        <SceneContent {...rest} animate={!reducedMotion} starCount={starCount} />
      </Canvas>
    </div>
  )
}

type ContentProps = Omit<Props, 'onDismiss' | 'reducedMotion' | 'lite'> & { animate: boolean; starCount: number }

function SceneContent({ portrait, selectedId, onSelect, onReady, animate, starCount, ...rig }: ContentProps) {
  const group = useRef<THREE.Group>(null)
  const readySent = useRef(false)

  useFrame(({ clock }) => {
    if (!readySent.current) {
      readySent.current = true
      requestAnimationFrame(onReady)
    }
    // A slow sway gives a sense of depth without fighting the camera controls.
    if (animate && group.current) {
      const t = clock.elapsedTime
      group.current.rotation.y = Math.sin(t * 0.07) * 0.05
      group.current.rotation.x = Math.sin(t * 0.05) * 0.02
    }
  })

  return (
    <>
      <Starfield count={starCount} animate={animate} />
      {animate && <ShootingStars />}
      <group ref={group}>
        <Nebula />
        {constellations.map((c) => (
          <Constellation key={c.id} data={c} portrait={portrait} selectedId={selectedId} onSelect={onSelect} animate={animate} />
        ))}
        <Bodies portrait={portrait} selectedId={selectedId} onSelect={onSelect} animate={animate} />
      </group>
      <CameraRig portrait={portrait} selectedId={selectedId} animate={animate} {...rig} />
    </>
  )
}

function CameraRig({
  portrait,
  selectedId,
  animate,
  stageRef,
  recenter,
  onAwayChange,
}: Pick<Props, 'portrait' | 'selectedId' | 'stageRef' | 'recenter' | 'onAwayChange'> & { animate: boolean }) {
  const { camera, size, gl } = useThree()
  const controls = useRef<OrbitControlsImpl>(null)
  const home = useRef({ center: new THREE.Vector3(), distance: 16 })
  const goal = useRef<{ pos: THREE.Vector3; target: THREE.Vector3 } | null>(null)
  const away = useRef(false)

  const homeGoal = () => {
    const { center, distance } = home.current
    return { target: center.clone(), pos: center.clone().add(new THREE.Vector3(0, 0, distance)) }
  }

  const goalFor = (id: string | null) => {
    const hit = id ? targetFor(id, portrait) : undefined
    if (!hit) return homeGoal()
    const target = new THREE.Vector3(hit.x, hit.y, hit.z)
    const narrow = window.innerWidth < 760
    const distance = (hit.body ? 7.5 : 6.5) * (narrow ? 1.1 : 1)
    if (narrow) {
      // The panel is a bottom sheet, so aim below the target to lift it into view.
      target.y -= hit.body ? 1.6 : 1.3
    } else {
      // The panel is a right-hand sheet: aim right of the target so it sits centred in the space left of it.
      const panelPx = Math.min(420, size.width - 24) + 12
      const halfWidth = distance * Math.tan(THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov / 2)) * (size.width / size.height)
      target.x += (panelPx / size.width) * halfWidth
    }
    return { target, pos: target.clone().add(new THREE.Vector3(0, 0, distance)) }
  }

  // Frame the sky into the stage rectangle: shift the projection so the stage's centre is the
  // view centre, then back the camera off until the whole sky fits.
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    const fit = () => {
      const canvasRect = gl.domElement.getBoundingClientRect()
      const stageRect = stageRef.current?.getBoundingClientRect()
      const fullW = canvasRect.width || size.width
      const fullH = canvasRect.height || size.height
      const top = stageRect ? stageRect.top - canvasRect.top : 0
      const h = stageRect?.height || fullH
      cam.setViewOffset(fullW, fullH, 0, fullH / 2 - (top + h / 2), fullW, fullH)
      cam.updateProjectionMatrix()

      const b = skyBounds(portrait)
      const t = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2))
      const distance = Math.max(b.height / (2 * t * (h / fullH)), (b.width * fullH) / (fullW * 2 * t))
      home.current = { center: new THREE.Vector3((b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2, 0), distance }
      if (controls.current) {
        controls.current.maxDistance = distance * 1.35
        controls.current.minDistance = 2.5
      }
      if (!selectedId) {
        const g = homeGoal()
        cam.position.copy(g.pos)
        controls.current?.target.copy(g.target)
        controls.current?.update()
      }
    }
    fit()
    const ro = new ResizeObserver(fit)
    if (stageRef.current) ro.observe(stageRef.current)
    return () => ro.disconnect()
    // selectedId is read only to decide whether to snap home; refitting on selection is not wanted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, gl, size.width, size.height, portrait, stageRef])

  const flyTo = (g: { pos: THREE.Vector3; target: THREE.Vector3 }) => {
    goal.current = g
    if (!animate && controls.current) {
      camera.position.copy(g.pos)
      controls.current.target.copy(g.target)
      controls.current.update()
      goal.current = null
    }
  }

  // Fly to the selected star or body, or back home when the panel closes.
  useEffect(() => {
    flyTo(goalFor(selectedId))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, animate])

  useEffect(() => {
    if (recenter) flyTo(homeGoal())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recenter])

  useFrame((_, dt) => {
    const c = controls.current
    if (!c) return
    if (goal.current) {
      const k = 1 - Math.exp(-dt * 3.2)
      camera.position.lerp(goal.current.pos, k)
      c.target.lerp(goal.current.target, k)
      c.update()
      if (camera.position.distanceTo(goal.current.pos) < 0.01) goal.current = null
    }
    const h = homeGoal()
    const isAway = camera.position.distanceTo(h.pos) > 0.6 || c.target.distanceTo(h.target) > 0.3
    if (isAway !== away.current) {
      away.current = isAway
      onAwayChange(isAway)
    }
  })

  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      enableZoom
      zoomSpeed={0.7}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.45}
      minAzimuthAngle={-0.75}
      maxAzimuthAngle={0.75}
      minPolarAngle={Math.PI / 2 - 0.6}
      maxPolarAngle={Math.PI / 2 + 0.6}
      onStart={() => {
        goal.current = null
      }}
    />
  )
}
