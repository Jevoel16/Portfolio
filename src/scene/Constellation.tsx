import { useMemo, useRef, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import type { Constellation as ConstellationData, Star } from '../data/constellations'
import { labelPosition, orient } from '../data/constellations'
import { projectById } from '../data/projects'
import { coarsePointer } from '../hooks/device'
import { glowTexture } from './textures'

interface Props {
  data: ConstellationData
  portrait: boolean
  selectedId: string | null
  onSelect: (id: string) => void
  animate: boolean
}

export function position(s: Pick<Star, 'x' | 'y' | 'z'>, portrait: boolean): THREE.Vector3 {
  const [x, y] = orient(s.x, s.y, portrait)
  return new THREE.Vector3(x, y, s.z)
}

export function Constellation({ data, portrait, selectedId, onSelect, animate }: Props) {
  const points = useMemo(() => new Map(data.stars.map((s) => [s.key, position(s, portrait)])), [data, portrait])
  const labelPos = useMemo(() => {
    const [x, y] = labelPosition(data, portrait)
    return new THREE.Vector3(x, y, 0)
  }, [data, portrait])

  return (
    <group>
      {data.edges.map(([a, b]) => (
        <Line
          key={a + b}
          points={[points.get(a)!, points.get(b)!]}
          color={data.color}
          lineWidth={data.forming ? 1 : 1.4}
          transparent
          opacity={data.forming ? 0.35 : 0.55}
          dashed={data.forming}
          dashSize={0.18}
          gapSize={0.22}
        />
      ))}
      {data.stars.map((s, i) => (
        <StarSprite
          key={s.key}
          star={s}
          pos={points.get(s.key)!}
          color={data.color}
          phase={i * 1.7 + data.label.x}
          faint={!!data.forming}
          selectedId={selectedId}
          onSelect={onSelect}
          animate={animate}
          constellationName={data.name}
        />
      ))}
      <Html position={labelPos} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
        <div className="const-label-3d" style={{ color: data.color }}>
          {data.name}
          {data.forming && <span>in formation</span>}
        </div>
      </Html>
    </group>
  )
}

interface StarProps {
  star: Star
  pos: THREE.Vector3
  color: string
  phase: number
  faint: boolean
  selectedId: string | null
  onSelect: (id: string) => void
  animate: boolean
  constellationName: string
}

function StarSprite({ star, pos, color, phase, faint, selectedId, onSelect, animate, constellationName }: StarProps) {
  const sprite = useRef<THREE.Sprite>(null)
  const [hovered, setHovered] = useState(false)
  const [touch] = useState(coarsePointer)
  const project = star.projectId ? projectById.get(star.projectId) : undefined
  const selected = !!project && selectedId === project.id
  const base = project ? (project.featured ? 1.35 : 1.0) : faint ? 0.45 : 0.55

  useFrame(({ clock }) => {
    if (!sprite.current) return
    const twinkle = animate ? 1 + Math.sin(clock.elapsedTime * 1.6 + phase) * 0.08 : 1
    const target = base * twinkle * (hovered || selected ? 1.35 : 1)
    const s = THREE.MathUtils.lerp(sprite.current.scale.x, target, 0.15)
    sprite.current.scale.set(s, s, 1)
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    // Ignore the click that ends a drag.
    if (!project || e.delta > 6) return
    e.stopPropagation()
    onSelect(project.id)
  }

  return (
    <group position={pos}>
      <sprite ref={sprite} scale={[base, base, 1]}>
        <spriteMaterial
          map={glowTexture()}
          color={project?.featured ? '#fff3d6' : color}
          transparent
          opacity={faint ? 0.55 : 1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      {project && (
        <>
          {/* Larger invisible target, easier to hit than the bright core. */}
          <mesh
            onClick={onClick}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHovered(true)
              document.body.style.cursor = 'pointer'
            }}
            onPointerOut={() => {
              setHovered(false)
              document.body.style.cursor = ''
            }}
          >
            <sphereGeometry args={[touch ? 0.85 : 0.6, 12, 12]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          <Html center position={[0, -0.55, 0]} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
            <div
              className={`star-label-3d${hovered || selected ? ' visible' : ''}${project.featured ? ' featured' : ''}`}
              aria-hidden="true"
            >
              {project.name}
              {(hovered || selected) && <small>{constellationName}</small>}
            </div>
          </Html>
        </>
      )}
    </group>
  )
}
