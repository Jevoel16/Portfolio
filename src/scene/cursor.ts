/** Pointer cursor while hovering something clickable in the canvas (stars, planets). */
export function setPointerCursor(on: boolean) {
  document.body.style.cursor = on ? 'pointer' : ''
}
