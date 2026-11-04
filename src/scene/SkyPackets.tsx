import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { pointScale } from './pointScale'
import type { Edge } from './skyLayout'

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uScale;
  attribute vec3 aEnd;
  attribute float aOffset;
  attribute float aSpeed;
  attribute vec3 color;
  varying vec3 vColor;
  varying float vFade;
  void main() {
    float k = fract(uTime * aSpeed + aOffset);
    vec3 p = mix(position, aEnd, k);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = 0.22 * uScale / -mv.z;
    gl_Position = projectionMatrix * mv;
    vColor = color;
    // Fade in leaving one star and out arriving at the next.
    vFade = smoothstep(0.0, 0.15, k) * (1.0 - smoothstep(0.85, 1.0, k));
  }
`

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vFade;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float a = (1.0 - smoothstep(0.0, 1.0, d)) * vFade;
    gl_FragColor = vec4(mix(vColor, vec3(1.0), 0.5), a * 0.9);
  }
`

/**
 * Data packets travelling along constellation edges, like traffic on a network map.
 * One draw call; positions are computed on the GPU from time, so the CPU does nothing per frame.
 */
export function SkyPackets({ edges }: { edges: Edge[] }) {
  const live = useMemo(() => edges.filter((e) => !e.dashed), [edges])

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const n = live.length
    const start = new Float32Array(n * 3)
    const end = new Float32Array(n * 3)
    const color = new Float32Array(n * 3)
    const offset = new Float32Array(n)
    const speed = new Float32Array(n)
    live.forEach((e, i) => {
      // Alternate direction per edge, and vary speed so packets don't move in lockstep.
      const [a, b] = i % 2 ? [e.to, e.from] : [e.from, e.to]
      a.toArray(start, i * 3)
      b.toArray(end, i * 3)
      e.color.toArray(color, i * 3)
      offset[i] = (i * 0.37) % 1
      speed[i] = 0.12 + ((i * 7) % 5) * 0.025
    })
    g.setAttribute('position', new THREE.BufferAttribute(start, 3))
    g.setAttribute('aEnd', new THREE.BufferAttribute(end, 3))
    g.setAttribute('color', new THREE.BufferAttribute(color, 3))
    g.setAttribute('aOffset', new THREE.BufferAttribute(offset, 1))
    g.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1))
    return g
  }, [live])
  useEffect(() => () => geometry.dispose(), [geometry])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: { uTime: { value: 0 }, uScale: { value: 600 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )
  useEffect(() => () => material.dispose(), [material])

  useFrame(({ clock, gl, camera }) => {
    material.uniforms.uTime.value = clock.elapsedTime
    material.uniforms.uScale.value = pointScale(gl, camera)
  })

  // Points move in the shader, so the CPU-side bounding sphere is wrong; never cull them.
  return <points geometry={geometry} material={material} frustumCulled={false} />
}
