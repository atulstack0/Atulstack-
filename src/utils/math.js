export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))

export const lerp = (start, end, t) => start + (end - start) * t

// Remaps `value` from [a -> b] into 0..1, clamped, then eases with smoothstep.
export const mapRange = (value, a, b) => {
  const t = clamp((value - a) / (b - a))
  return t * t * (3 - 2 * t)
}
