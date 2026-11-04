// Pure camera maths for the scroll-driven sky, kept free of three.js so it can be unit-tested.
import { bodyById, type BodyId } from '../data/bodies'
import { constellationById, orient, skyBounds, targetFor } from '../data/constellations'
import type { ConstellationId } from '../data/projects'

export type Vec3 = [number, number, number]

export interface Waypoint {
  /** Point the camera looks at, already shifted so the subject clears the text column. */
  target: Vec3
  distance: number
  /** Sideways and vertical lean of the camera, as a fraction of the distance. */
  tilt: [number, number]
}

export interface Pose {
  pos: Vec3
  target: Vec3
}

export interface View {
  portrait: boolean
  /** Viewport width / height. */
  aspect: number
  /** Vertical field of view in degrees. */
  fov: number
}

const tanHalf = (fov: number) => Math.tan((fov * Math.PI) / 360)

/** On wide screens the text column sits on the left, so subjects are framed in the right part. */
function shiftForText(distance: number, view: View) {
  if (view.aspect < 1.1) return 0
  return distance * tanHalf(view.fov) * view.aspect * 0.42
}

/**
 * Camera waypoint for a `data-cam` key: `home` (the whole sky), `body:<id>` (a planet or the beacon)
 * or `const:<id>` (a constellation). Undefined for unknown keys.
 */
export function waypointFor(key: string, view: View): Waypoint | undefined {
  const { portrait } = view
  const t = tanHalf(view.fov)

  if (key === 'home') {
    const b = skyBounds(portrait)
    const distance = Math.max(b.height / (2 * t), b.width / (2 * t * view.aspect)) * 0.95
    return { target: [(b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2, 0], distance, tilt: [0, 0] }
  }

  const [kind, id] = key.split(':')
  if (kind === 'body' && bodyById.has(id as BodyId)) {
    const hit = targetFor(id, portrait)!
    const distance = portrait ? 7.5 : 6
    return { target: [hit.x - shiftForText(distance, view), hit.y, hit.z], distance, tilt: [0.18, 0.08] }
  }

  if (kind === 'const') {
    const c = constellationById.get(id as ConstellationId)
    if (!c || c.stars.length === 0) return undefined
    const pts = c.stars.map((s) => orient(s.x, s.y, portrait))
    const xs = pts.map((p) => p[0])
    const ys = pts.map((p) => p[1])
    const w = Math.max(...xs) - Math.min(...xs) + 2
    const h = Math.max(...ys) - Math.min(...ys) + 2
    // Fit the figure into the free part of the screen (right ~55% on wide screens).
    const usable = view.aspect >= 1.1 ? 0.55 : 1
    const distance = Math.max(5.5, h / (2 * t), w / (2 * t * view.aspect * usable))
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2
    return { target: [cx - shiftForText(distance, view), cy, 0], distance, tilt: [-0.12, 0.05] }
  }

  return undefined
}

/**
 * Which pair of waypoints the viewport focus line sits between. `centers` are the waypoint
 * elements' vertical centres (in the same coordinates as `focus`), top to bottom.
 */
export function track(centers: number[], focus: number): { i: number; t: number } {
  const last = centers.length - 1
  if (last <= 0 || focus <= centers[0]) return { i: 0, t: 0 }
  if (focus >= centers[last]) return { i: last, t: 0 }
  let i = 0
  while (i < last - 1 && focus >= centers[i + 1]) i++
  const span = centers[i + 1] - centers[i]
  return { i, t: span > 0 ? (focus - centers[i]) / span : 0 }
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const lerp = (a: number, b: number, k: number) => a + (b - a) * k
const clamp01 = (t: number) => (Number.isFinite(t) ? Math.min(1, Math.max(0, t)) : 0)

function poseOf(target: Vec3, distance: number, [tx, ty]: [number, number]): Pose {
  const len = Math.hypot(tx, ty, 1)
  return { target, pos: [target[0] + (tx / len) * distance, target[1] + (ty / len) * distance, target[2] + distance / len] }
}

/**
 * Camera pose between waypoint `i` and `i + 1` at progress `t`. Long hops pull the camera back
 * mid-flight, so moving between distant subjects reads as a flight rather than a pan.
 */
export function poseAt(waypoints: Waypoint[], i: number, t: number): Pose {
  const a = waypoints[Math.min(Math.max(i, 0), waypoints.length - 1)]
  const b = waypoints[Math.min(Math.max(i + 1, 0), waypoints.length - 1)]
  const e = ease(clamp01(t))
  const target: Vec3 = [lerp(a.target[0], b.target[0], e), lerp(a.target[1], b.target[1], e), lerp(a.target[2], b.target[2], e)]
  const travel = Math.hypot(b.target[0] - a.target[0], b.target[1] - a.target[1], b.target[2] - a.target[2])
  const distance = lerp(a.distance, b.distance, e) + Math.sin(Math.PI * e) * travel * 0.35
  const tilt: [number, number] = [lerp(a.tilt[0], b.tilt[0], e), lerp(a.tilt[1], b.tilt[1], e)]
  return poseOf(target, distance, tilt)
}
