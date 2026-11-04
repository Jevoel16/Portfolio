import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { StarPoint } from './skyLayout'
import { setPointerCursor } from './cursor'

interface Props {
  stars: StarPoint[]
  selectedId: string | null
  hoveredId: string | null
  onHover: (id: string | null) => void
  onSelect: (id: string) => void
  animate: boolean
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uAnimate;
  uniform float uScale;
  attribute float size;
  attribute float phase;
  attribute float alpha;
  attribute float highlight;
  attribute vec3 color;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float twinkle = 1.0 + sin(uTime * 1.6 + phase) * 0.08 * uAnimate;
    gl_PointSize = size * twinkle * (1.0 + 0.35 * highlight) * uScale / -mv.z;
    gl_Position = projectionMatrix * mv;
    vColor = color;
    vAlpha = alpha;
  }
`

// Same falloff as the old glow sprite texture: hot white core, coloured halo.
const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float core = 1.0 - smoothstep(0.0, 0.16, d);
    float halo = 0.35 * (1.0 - smoothstep(0.1, 0.45, d)) + 0.08 * (1.0 - smoothstep(0.4, 1.0, d));
    vec3 col = mix(vColor, vec3(1.0), core * 0.85);
    gl_FragColor = vec4(col, vAlpha * clamp(core + halo, 0.0, 1.0));
  }
`

/**
 * Every constellation star in one draw call. Twinkle runs on the GPU; hover and selection only
 * touch a one-float attribute. Clicks use the Points raycaster and pick the star nearest the ray.
 */
export function SkyStars({ stars, selectedId, hoveredId, onHover, onSelect, animate }: Props) {
  const points = useRef<THREE.Points>(null)
  const { gl, camera, invalidate } = useThree()
  const size = useRef(new THREE.Vector2())

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const n = stars.length
    const pos = new Float32Array(n * 3)
    const col = new Float32Array(n * 3)
    stars.forEach((s, i) => {
      s.pos.toArray(pos, i * 3)
      s.color.toArray(col, i * 3)
    })
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    g.setAttribute('size', new THREE.BufferAttribute(Float32Array.from(stars, (s) => s.size), 1))
    g.setAttribute('alpha', new THREE.BufferAttribute(Float32Array.from(stars, (s) => s.alpha), 1))
    g.setAttribute('phase', new THREE.BufferAttribute(Float32Array.from(stars, (s) => s.phase), 1))
    g.setAttribute('highlight', new THREE.BufferAttribute(new Float32Array(n), 1))
    return g
  }, [stars])
  useEffect(() => () => geometry.dispose(), [geometry])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: { uTime: { value: 0 }, uAnimate: { value: 1 }, uScale: { value: 600 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )
  useEffect(() => () => material.dispose(), [material])

  useFrame(({ clock }) => {
    const u = material.uniforms
    u.uTime.value = clock.elapsedTime
    u.uAnimate.value = animate ? 1 : 0
    // Pixels per sky unit at distance 1: matches sprite sizing so stars keep their world size.
    gl.getDrawingBufferSize(size.current)
    const fov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov)
    u.uScale.value = size.current.y / (2 * Math.tan(fov / 2))

    // Ease each star's highlight toward hovered/selected, and keep rendering until it settles.
    const attr = geometry.getAttribute('highlight') as THREE.BufferAttribute
    let moving = false
    stars.forEach((s, i) => {
      const goal = s.id && (s.id === hoveredId || s.id === selectedId) ? 1 : 0
      const cur = attr.getX(i)
      if (Math.abs(goal - cur) > 0.01) {
        attr.setX(i, cur + (goal - cur) * 0.18)
        moving = true
      } else if (cur !== goal) {
        attr.setX(i, goal)
        moving = true
      }
    })
    if (moving) {
      attr.needsUpdate = true
      invalidate()
    }
  })

  /** Nearest clickable star to the pointer ray, if any is within the raycaster threshold. */
  const pick = (e: ThreeEvent<PointerEvent | MouseEvent>) => {
    let best: string | undefined
    let bestDist = Infinity
    for (const hit of e.intersections) {
      if (hit.object !== points.current || hit.index === undefined) continue
      const id = stars[hit.index]?.id
      const d = hit.distanceToRay ?? Infinity
      if (id && d < bestDist) {
        best = id
        bestDist = d
      }
    }
    return best
  }

  return (
    <points
      ref={points}
      geometry={geometry}
      material={material}
      onPointerMove={(e) => {
        const id = pick(e) ?? null
        if (id !== hoveredId) {
          onHover(id)
          setPointerCursor(!!id)
        }
      }}
      onPointerOut={() => {
        onHover(null)
        setPointerCursor(false)
      }}
      onClick={(e) => {
        // Ignore the click that ends a drag.
        if (e.delta > 6) return
        const id = pick(e)
        if (!id) return
        e.stopPropagation()
        onSelect(id)
      }}
    />
  )
}
