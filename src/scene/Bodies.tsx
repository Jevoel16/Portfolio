import { useMemo, useRef, type ReactNode } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { bodies, type Body } from '../data/bodies'
import { orient } from '../data/constellations'
import { setPointerCursor } from './cursor'
import { glowTexture, planetTexture, ringTexture } from './textures'

interface Props {
  portrait: boolean
  selectedId: string | null
  hoveredId: string | null
  onHover: (id: string | null) => void
  onSelect: (id: string) => void
  animate: boolean
  /** Larger hit targets on touch screens. */
  touch: boolean
}

export function Bodies(props: Props) {
  return (
    <group>
      {/* Only the planets are lit; stars and lines use unlit materials. */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[-6, 8, 10]} intensity={2.2} />
      {bodies.map((b) => (
        <BodyObject key={b.id} body={b} {...props} />
      ))}
    </group>
  )
}

function BodyObject({ body, portrait, selectedId, hoveredId, onHover, onSelect, animate, touch }: Props & { body: Body }) {
  const group = useRef<THREE.Group>(null)
  const hovered = hoveredId === body.id
  const selected = selectedId === body.id
  const pos = useMemo(() => {
    const [x, y] = orient(body.x, body.y, portrait)
    return new THREE.Vector3(x, y, body.z)
  }, [body, portrait])

  useFrame(({ invalidate }) => {
    if (!group.current) return
    const goal = hovered || selected ? 1.15 : 1
    const cur = group.current.scale.x
    if (Math.abs(goal - cur) < 0.001) return
    group.current.scale.setScalar(THREE.MathUtils.lerp(cur, goal, 0.12))
    // On-demand rendering: keep drawing until the hover scale settles.
    invalidate()
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    // Ignore the click that ends a drag.
    if (e.delta > 6) return
    e.stopPropagation()
    onSelect(body.id)
  }

  let visual: ReactNode
  if (body.kind === 'beacon') visual = <Beacon body={body} animate={animate} />
  else visual = <Planet body={body} animate={animate} ringed={body.kind === 'ringed'} />

  return (
    <group position={pos}>
      <group ref={group}>{visual}</group>
      <mesh
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover(body.id)
          setPointerCursor(true)
        }}
        onPointerOut={() => {
          onHover(null)
          setPointerCursor(false)
        }}
      >
        <sphereGeometry args={[Math.max(body.radius * 1.6, touch ? 1 : 0.7), 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

function Planet({ body, animate, ringed }: { body: Body; animate: boolean; ringed: boolean }) {
  const sphere = useRef<THREE.Mesh>(null)
  const ringGeo = useMemo(() => {
    const inner = body.radius * 1.35
    const outer = body.radius * 2.3
    const g = new THREE.RingGeometry(inner, outer, 96, 1)
    // RingGeometry's UVs are planar; remap u to the radius so the strip texture reads as bands.
    const p = g.attributes.position
    const uv = g.attributes.uv
    for (let i = 0; i < p.count; i++) {
      const r = Math.hypot(p.getX(i), p.getY(i))
      uv.setXY(i, (r - inner) / (outer - inner), 0.5)
    }
    return g
  }, [body.radius])

  useFrame((_, dt) => {
    if (animate && sphere.current) sphere.current.rotation.y += dt * 0.12
  })

  return (
    <>
      <sprite scale={[body.radius * 5, body.radius * 5, 1]} position={[0, 0, -0.05]}>
        <spriteMaterial map={glowTexture()} color={body.color} opacity={0.55} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <mesh ref={sphere} rotation={[0.25, 0, ringed ? -0.35 : 0.1]}>
        <sphereGeometry args={[body.radius, 48, 32]} />
        <meshStandardMaterial map={planetTexture(body.color, body.color2)} roughness={0.9} metalness={0} emissive={body.color2} emissiveIntensity={0.08} />
      </mesh>
      {ringed && (
        <mesh geometry={ringGeo} rotation={[1.2, 0.2, -0.35]}>
          <meshBasicMaterial map={ringTexture()} color={body.color} transparent opacity={0.85} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
    </>
  )
}

const PULSES = 3

function Beacon({ body, animate }: { body: Body; animate: boolean }) {
  const rings = useRef<(THREE.Mesh | null)[]>([])
  const core = useRef<THREE.Sprite>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    rings.current.forEach((m, i) => {
      if (!m) return
      // Each ring grows from the core and fades out, staggered so one is always visible.
      const k = animate ? ((t * 0.45 + i / PULSES) % 1) : 0.35 + i * 0.2
      m.scale.setScalar(0.4 + k * 2.6)
      ;(m.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.7
    })
    if (core.current) {
      const s = body.radius * 5 * (animate ? 1 + Math.sin(t * 3) * 0.1 : 1)
      core.current.scale.set(s, s, 1)
    }
  })

  return (
    <>
      <sprite ref={core} scale={[body.radius * 5, body.radius * 5, 1]}>
        <spriteMaterial map={glowTexture()} color="#e9fff8" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <Billboard>
        {Array.from({ length: PULSES }, (_, i) => (
          <mesh key={i} ref={(m) => (rings.current[i] = m)}>
            <ringGeometry args={[body.radius * 0.92, body.radius, 64]} />
            <meshBasicMaterial color={i % 2 ? body.color2 : body.color} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
      </Billboard>
    </>
  )
}
