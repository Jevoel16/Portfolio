import * as THREE from 'three'
import { bodies } from '../data/bodies'
import { bodyLabelPosition, constellations, labelPosition, orient, starItem } from '../data/constellations'

/** One point in the constellation star buffer. */
export interface StarPoint {
  /** Selection id, or undefined for decorative stars that can't be clicked. */
  id?: string
  pos: THREE.Vector3
  color: THREE.Color
  /** Glow diameter in sky units. */
  size: number
  alpha: number
  phase: number
}

export interface Edge {
  from: THREE.Vector3
  to: THREE.Vector3
  color: THREE.Color
  dashed: boolean
}

export interface SkyLabel {
  key: string
  kind: 'constellation' | 'star' | 'body' | 'reticle'
  pos: THREE.Vector3
  color: string
  title: string
  sub?: string
  /** Selection id the label belongs to, for hover and selected styling. */
  id?: string
  featured?: boolean
}

const FEATURED = new THREE.Color('#fff3d6')

/** Everything the 3D sky draws, in oriented sky coordinates, built once per orientation. */
export function skyLayout(portrait: boolean) {
  const stars: StarPoint[] = []
  const edges: Edge[] = []
  const labels: SkyLabel[] = []

  constellations.forEach((c) => {
    const color = new THREE.Color(c.color)
    const at = new Map(
      c.stars.map((s) => {
        const [x, y] = orient(s.x, s.y, portrait)
        return [s.key, new THREE.Vector3(x, y, s.z)] as const
      }),
    )
    c.stars.forEach((s, i) => {
      const item = starItem(s)
      const pos = at.get(s.key)!
      stars.push({
        id: item?.id,
        pos,
        color: item?.featured ? FEATURED : color,
        size: item ? (item.featured ? 1.35 : 1) : c.forming ? 0.45 : 0.55,
        alpha: c.forming ? 0.55 : 1,
        phase: i * 1.7 + c.label.x,
      })
      if (item) {
        // Target-lock brackets around the star itself, shown on hover and selection.
        labels.push({ key: `lock-${item.id}`, kind: 'reticle', pos, color: c.color, title: '', id: item.id })
        labels.push({
          key: `star-${item.id}`,
          kind: 'star',
          pos: pos.clone().add(new THREE.Vector3(0, -0.55, 0)),
          color: c.color,
          title: item.name,
          sub: c.name,
          id: item.id,
          featured: item.featured,
        })
      }
    })
    c.edges.forEach(([a, b]) => edges.push({ from: at.get(a)!, to: at.get(b)!, color, dashed: !!c.forming }))
    const [lx, ly] = labelPosition(c, portrait)
    labels.push({
      key: `const-${c.id}`,
      kind: 'constellation',
      pos: new THREE.Vector3(lx, ly, 0),
      color: c.color,
      title: c.name,
      sub: c.forming ? 'in formation' : undefined,
    })
  })

  bodies.forEach((b) => {
    const [x, y] = bodyLabelPosition(b, portrait)
    labels.push({ key: `body-${b.id}`, kind: 'body', pos: new THREE.Vector3(x, y, b.z), color: b.color, title: b.name, sub: b.caption, id: b.id })
  })

  return { stars, edges, labels }
}
