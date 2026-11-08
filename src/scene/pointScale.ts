import * as THREE from 'three'

const size = new THREE.Vector2()

/** Pixels per sky unit at distance 1, so points keep a sprite's world size at any DPR. */
export function pointScale(gl: THREE.WebGLRenderer, camera: THREE.Camera) {
  gl.getDrawingBufferSize(size)
  const fov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov)
  return size.y / (2 * Math.tan(fov / 2))
}
