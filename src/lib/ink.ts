// The data colours (constellations, planets) are pastels tuned for the night sky.
// In Light they are darkened toward the ink colour until they pass AA on the dawn sky.

export const INK = '#141a33'
/** The Light backgrounds text sits on: cream and the pale blue at the top of the sky. */
const LIGHT_BACKGROUNDS = ['#f4ecdc', '#cfe1f0']
const TARGET = 4.6

const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
const toHex = (rgb: number[]) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`

function luminance(hex: string) {
  const [r, g, b] = channels(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

function mix(a: string, b: string, t: number) {
  const [ca, cb] = [channels(a), channels(b)]
  return toHex(ca.map((v, i) => v + (cb[i] - v) * t))
}

/** The least-darkened version of `hex` that passes AA on every Light background. */
export function inkFor(hex: string) {
  for (let step = 0; step <= 20; step++) {
    const c = mix(hex, INK, step / 20)
    if (LIGHT_BACKGROUNDS.every((bg) => contrast(c, bg) >= TARGET)) return c
  }
  return INK
}

/** A CSS value that is the data colour in Dark and its ink version in Light. */
export const themedAccent = (hex: string) => `light-dark(${inkFor(hex)}, ${hex})`
