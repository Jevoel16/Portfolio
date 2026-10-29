import * as THREE from 'three'

// All textures are drawn in code, so the 3D scene downloads no images.

function radial(size: number, stops: [number, string][]) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  for (const [o, c] of stops) g.addColorStop(o, c)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

let dot: THREE.Texture | null = null
let glow: THREE.Texture | null = null
let cloud: THREE.Texture | null = null

/** Small soft dot for the background starfield. */
export const dotTexture = () =>
  (dot ??= radial(64, [
    [0, 'rgba(255,255,255,1)'],
    [0.2, 'rgba(255,255,255,0.85)'],
    [0.5, 'rgba(255,255,255,0.15)'],
    [1, 'rgba(255,255,255,0)'],
  ]))

/** Bright core with a wide halo, tinted per constellation through the sprite color. */
export const glowTexture = () =>
  (glow ??= radial(128, [
    [0, 'rgba(255,255,255,1)'],
    [0.08, 'rgba(255,255,255,0.95)'],
    [0.22, 'rgba(255,255,255,0.35)'],
    [0.5, 'rgba(255,255,255,0.08)'],
    [1, 'rgba(255,255,255,0)'],
  ]))

/** Very soft blob for nebula clouds. */
export const cloudTexture = () =>
  (cloud ??= radial(256, [
    [0, 'rgba(255,255,255,0.55)'],
    [0.4, 'rgba(255,255,255,0.18)'],
    [1, 'rgba(255,255,255,0)'],
  ]))

const planets = new Map<string, THREE.Texture>()

/** Banded gas-giant surface; a few bands of noise keep it from looking like a flat gradient. */
export function planetTexture(color: string, color2: string) {
  const key = color + color2
  const cached = planets.get(key)
  if (cached) return cached
  const w = 256
  const h = 128
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  const a = new THREE.Color(color)
  const b = new THREE.Color(color2)
  const c = new THREE.Color()
  let seed = key.length * 97
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  for (let y = 0; y < h; y++) {
    const t = 0.5 + 0.5 * Math.sin(y * 0.19 + Math.sin(y * 0.05) * 3) * Math.cos(y * 0.07)
    c.copy(a).lerp(b, t * 0.8 + rand() * 0.12)
    ctx.fillStyle = `#${c.getHexString()}`
    ctx.fillRect(0, y, w, 1)
  }
  // Soft storms and streaks.
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.03 + rand() * 0.06})`
    ctx.beginPath()
    ctx.ellipse(rand() * w, rand() * h, 6 + rand() * 30, 1 + rand() * 3, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  planets.set(key, tex)
  return tex
}

let ring: THREE.Texture | null = null

/** Radial strip for planetary rings: mapped across the ring's width by RingGeometry's UVs. */
export const ringTexture = () => {
  if (ring) return ring
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 4
  const ctx = canvas.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, 256, 0)
  g.addColorStop(0, 'rgba(255,255,255,0)')
  g.addColorStop(0.15, 'rgba(255,255,255,0.55)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.2)')
  g.addColorStop(0.45, 'rgba(255,255,255,0.7)')
  g.addColorStop(0.7, 'rgba(255,255,255,0.35)')
  g.addColorStop(0.85, 'rgba(255,255,255,0.12)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 4)
  ring = new THREE.CanvasTexture(canvas)
  ring.colorSpace = THREE.SRGBColorSpace
  return ring
}

let streak: THREE.Texture | null = null

/** Bright head fading into a tail, for shooting stars. */
export const streakTexture = () => {
  if (streak) return streak
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 8
  const ctx = canvas.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, 256, 0)
  g.addColorStop(0, 'rgba(255,255,255,0)')
  g.addColorStop(0.85, 'rgba(255,255,255,0.6)')
  g.addColorStop(1, 'rgba(255,255,255,1)')
  ctx.fillStyle = g
  ctx.fillRect(0, 2, 256, 4)
  streak = new THREE.CanvasTexture(canvas)
  streak.colorSpace = THREE.SRGBColorSpace
  return streak
}
