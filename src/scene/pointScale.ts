import * as THREE from 'three'

const size = new THREE.Vector2()

/**
 * Drawing-buffer pixels per sky unit at distance 1. Point shaders divide by depth, so points keep
 * the same world size as a sprite would, at any DPR and zoom.
 */
export function pointScale(gl: THREE.WebGLRenderer, camera: THREE.Camera) {
  gl.getDrawingBufferSize(size)
  const fov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov)
  return size.y / (2 * Math.tan(fov / 2))
}
