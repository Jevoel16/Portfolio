import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { streakTexture } from './textures'

const COUNT = 2
const DURATION = 1.1

interface Streak {
  start: THREE.Vector3
  dir: THREE.Vector3
  /** Seconds until this streak starts; negative while it is flying. */
  wait: number
  age: number
}

const randomStreak = (): Streak => {
  const angle = -0.35 - Math.random() * 0.5 + (Math.random() < 0.5 ? 0 : Math.PI)
  return {
    start: new THREE.Vector3((Math.random() - 0.5) * 60, 8 + Math.random() * 14, -28 - Math.random() * 10),
    dir: new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0),
    wait: 2 + Math.random() * 7,
    age: 0,
  }
}

/** Occasional meteors far behind the constellations. Purely decorative. */
export function ShootingStars() {
  const meshes = useRef<(THREE.Mesh | null)[]>([])
  const streaks = useRef<Streak[]>(Array.from({ length: COUNT }, randomStreak))

  useFrame((_, dt) => {
    streaks.current.forEach((s, i) => {
      const m = meshes.current[i]
      if (!m) return
      if (s.wait > 0) {
        s.wait -= dt
        m.visible = false
        return
      }
      s.age += dt
      const k = s.age / DURATION
      if (k >= 1) {
        streaks.current[i] = randomStreak()
        m.visible = false
        return
      }
      m.visible = true
      m.position.copy(s.start).addScaledVector(s.dir, k * 26)
      m.rotation.z = Math.atan2(s.dir.y, s.dir.x)
      ;(m.material as THREE.MeshBasicMaterial).opacity = Math.sin(k * Math.PI)
    })
  })

  return (
    <>
      {Array.from({ length: COUNT }, (_, i) => (
        <mesh key={i} ref={(m) => (meshes.current[i] = m)} visible={false}>
          {/* The texture's bright end points along +x, which the rotation turns into the direction of travel. */}
          <planeGeometry args={[7, 0.12]} />
          <meshBasicMaterial map={streakTexture()} color="#dfe8ff" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </>
  )
}
