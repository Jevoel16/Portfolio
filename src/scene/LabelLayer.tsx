import { useLayoutEffect, useRef, type CSSProperties, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Scramble } from '../hud/Scramble'
import type { SkyLabel } from './skyLayout'

interface LayerProps {
  labels: SkyLabel[]
  hoveredId: string | null
  selectedId: string | null
  layerRef: RefObject<HTMLDivElement>
  animate: boolean
}

/**
 * Every sky label in one plain DOM layer over the canvas. React only renders the text and
 * classes; positions are written straight to `transform` by LabelProjector each frame.
 */
export function LabelLayer({ labels, hoveredId, selectedId, layerRef, animate }: LayerProps) {
  return (
    <div ref={layerRef} className="label-layer" aria-hidden="true">
      {labels.map((l) => {
        const active = !!l.id && (l.id === hoveredId || l.id === selectedId)
        if (l.kind === 'reticle') {
          return (
            <div key={l.key} data-key={l.key} className="sky-label">
              <div className={`reticle${active ? ' locked' : ''}`} style={{ '--accent': l.color } as CSSProperties} />
            </div>
          )
        }
        const className =
          l.kind === 'constellation'
            ? 'const-label-3d'
            : l.kind === 'body'
              ? `body-label-3d${active ? ' active' : ''}`
              : `star-label-3d${active ? ' visible' : ''}${l.featured ? ' featured' : ''}`
        return (
          <div key={l.key} data-key={l.key} className="sky-label">
            <div className={className} style={{ color: l.kind === 'star' ? undefined : l.color } as CSSProperties}>
              {l.kind === 'star' ? <Scramble text={l.title} active={active} enabled={animate} /> : l.title}
              {l.sub && (l.kind !== 'star' || active) && (l.kind === 'star' ? <small>{l.sub}</small> : <span>{l.sub}</span>)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface ProjectorProps {
  labels: SkyLabel[]
  layerRef: RefObject<HTMLDivElement>
  /** The swaying group the labelled objects live in, so labels follow the sway. */
  groupRef: RefObject<THREE.Object3D>
}

/** Inside the canvas: projects each label's sky position to screen pixels after every render. */
export function LabelProjector({ labels, layerRef, groupRef }: ProjectorProps) {
  const { camera, size } = useThree()
  const els = useRef<(HTMLElement | null)[]>([])
  const v = useRef(new THREE.Vector3())

  useLayoutEffect(() => {
    const layer = layerRef.current
    els.current = labels.map((l) => layer?.querySelector<HTMLElement>(`[data-key="${l.key}"]`) ?? null)
  }, [labels, layerRef])

  useFrame(() => {
    const group = groupRef.current
    // Matrices are normally refreshed during render, which runs after this; refresh them now so
    // labels don't trail one frame behind the camera.
    camera.updateMatrixWorld()
    group?.updateMatrixWorld()
    labels.forEach((l, i) => {
      const el = els.current[i]
      if (!el) return
      const p = v.current.copy(l.pos)
      if (group) p.applyMatrix4(group.matrixWorld)
      p.project(camera)
      // Behind the camera or far off screen: hide instead of drawing it mirrored.
      if (p.z > 1 || Math.abs(p.x) > 1.3 || Math.abs(p.y) > 1.3) {
        el.style.visibility = 'hidden'
        return
      }
      el.style.visibility = ''
      const x = (p.x * 0.5 + 0.5) * size.width
      const y = (-p.y * 0.5 + 0.5) * size.height
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`
    })
  })

  return null
}
