import { describe, expect, it } from 'vitest'
import { bodies } from '../data/bodies'
import { constellations } from '../data/constellations'
import { poseAt, track, waypointFor, type View, type Waypoint } from './cameraPath'

const views: View[] = [
  { portrait: false, aspect: 16 / 9, fov: 50 },
  { portrait: true, aspect: 375 / 812, fov: 50 },
]

const keys = ['home', ...bodies.map((b) => `body:${b.id}`), ...constellations.map((c) => `const:${c.id}`)]

const finite = (v: number[]) => v.every(Number.isFinite)

describe('camera waypoints', () => {
  it('exist for every body and constellation in both orientations', () => {
    for (const view of views) {
      for (const key of keys) {
        const wp = waypointFor(key, view)
        expect(wp, key).toBeDefined()
        expect(finite([...wp!.target, wp!.distance])).toBe(true)
        expect(wp!.distance).toBeGreaterThan(0)
      }
    }
  })

  it('rejects unknown keys', () => {
    expect(waypointFor('body:nope', views[0])).toBeUndefined()
    expect(waypointFor('const:nope', views[0])).toBeUndefined()
    expect(waypointFor('nope', views[0])).toBeUndefined()
  })
})

describe('track', () => {
  const centers = [100, 500, 900]

  it('clamps before the first and after the last waypoint', () => {
    expect(track(centers, -50)).toEqual({ i: 0, t: 0 })
    expect(track(centers, 2000)).toEqual({ i: 2, t: 0 })
  })

  it('interpolates between neighbours', () => {
    expect(track(centers, 300)).toEqual({ i: 0, t: 0.5 })
    expect(track(centers, 800)).toEqual({ i: 1, t: 0.75 })
  })

  it('handles a single waypoint', () => {
    expect(track([400], 900)).toEqual({ i: 0, t: 0 })
  })
})

describe('poseAt', () => {
  const view = views[0]
  const wps = keys.map((k) => waypointFor(k, view)!) as Waypoint[]

  it('lands exactly on each waypoint at its start', () => {
    wps.forEach((wp, i) => {
      const pose = poseAt(wps, i, 0)
      pose.target.forEach((v, axis) => expect(v).toBeCloseTo(wp.target[axis], 6))
    })
  })

  it('stays finite for any progress, including out-of-range and NaN', () => {
    for (const t of [-1, 0, 0.25, 0.5, 0.99, 1, 7, Number.NaN]) {
      const pose = poseAt(wps, 1, t)
      expect(finite([...pose.pos, ...pose.target])).toBe(true)
    }
  })

  it('snaps to the nearer waypoint under reduced motion', () => {
    const same = (a: ReturnType<typeof poseAt>, b: ReturnType<typeof poseAt>) =>
      [...a.pos, ...a.target].forEach((v, k) => expect(v).toBeCloseTo([...b.pos, ...b.target][k], 6))
    same(poseAt(wps, 0, 0.4, true), poseAt(wps, 0, 0))
    same(poseAt(wps, 0, 0.6, true), poseAt(wps, 1, 0))
  })
})
