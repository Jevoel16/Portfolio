/** True on touch-first devices (phones, tablets), where there is no hover. */
export const coarsePointer = () => window.matchMedia('(pointer: coarse)').matches
