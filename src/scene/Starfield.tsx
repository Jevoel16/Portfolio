import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { cloudTexture, dotTexture } from './textures'

const PALETTE = ['#ffffff', '#dfe8ff', '#b9cfff', '#ffe9c4', '#ffd2a8']

/** Deterministic pseudo-random numbers, so the sky looks the same on every visit. */
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
}

export function Starfield({ count, animate }: { count: number; animate: boolean }) {
  const ref = useRef<THREE.Points>(null)
  const geometry = useMemo(() => {
    const rand = rng(16)
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const c = new THREE.Color()
    for (let i = 0; i < count; i++) {
      // Points in a thick spherical shell around the constellations.
      const r = 30 + rand() * 90
      const theta = rand() * Math.PI * 2
      const phi = Math.acos(2 * rand() - 1)
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
      c.set(PALETTE[Math.floor(rand() * PALETTE.length)]).multiplyScalar(0.55 + rand() * 0.45)
      colors.set([c.r, c.g, c.b], i * 3)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return g
  }, [count])

  useFrame((_, dt) => {
    if (animate && ref.current) ref.current.rotation.y += dt * 0.004
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.55}
        map={dotTexture()}
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

const CLOUDS: { pos: [number, number, number]; scale: number; color: string; opacity: number }[] = [
  { pos: [0.5, 0.3, -6], scale: 9, color: '#ff7a9c', opacity: 0.3 },
  { pos: [-1.5, -0.6, -8], scale: 12, color: '#8a5cff', opacity: 0.22 },
  { pos: [-14, 6, -30], scale: 34, color: '#3a5bd9', opacity: 0.16 },
  { pos: [16, -7, -34], scale: 38, color: '#1fa38a', opacity: 0.1 },
  { pos: [8, 9, -40], scale: 30, color: '#6a3fd1', opacity: 0.12 },
]

/** Soft coloured clouds; the brightest pair sits behind the forming Cybersecurity stars. */
export function Nebula() {
  return (
    <group>
      {CLOUDS.map((c, i) => (
        <sprite key={i} position={c.pos} scale={[c.scale, c.scale, 1]}>
          <spriteMaterial
            map={cloudTexture()}
            color={c.color}
            opacity={c.opacity}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </group>
  )
}
