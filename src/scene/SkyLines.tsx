import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import type { Edge } from './skyLayout'

/** All constellation edges in two draw calls: solid lines, and dashed ones for a forming figure. */
export function SkyLines({ edges }: { edges: Edge[] }) {
  const solid = useMemo(() => segments(edges.filter((e) => !e.dashed)), [edges])
  const dashed = useMemo(() => segments(edges.filter((e) => e.dashed)), [edges])
  return (
    <>
      {solid && <Line segments points={solid.points} vertexColors={solid.colors} lineWidth={1.4} transparent opacity={0.55} />}
      {dashed && (
        <Line segments points={dashed.points} vertexColors={dashed.colors} lineWidth={1} transparent opacity={0.35} dashed dashSize={0.18} gapSize={0.22} />
      )}
    </>
  )
}

function segments(edges: Edge[]) {
  if (!edges.length) return null
  return {
    points: edges.flatMap((e) => [e.from, e.to]),
    colors: edges.flatMap((e) => [e.color, e.color]),
  }
}
