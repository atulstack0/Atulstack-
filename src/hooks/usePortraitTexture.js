import { useEffect, useState } from 'react'
import * as THREE from 'three'

// Loads the user's photo if present; falls back to a soft silhouette
// gradient so the scene still looks intentional before a photo is added.
export function usePortraitTexture(url) {
  const [texture, setTexture] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    const loader = new THREE.TextureLoader()
    loader.load(
      url,
      (tex) => {
        if (cancelled) return
        tex.colorSpace = THREE.SRGBColorSpace
        setTexture(tex)
      },
      undefined,
      () => {
        if (!cancelled) setFailed(true)
      },
    )
    return () => {
      cancelled = true
    }
  }, [url])

  return { texture, ready: Boolean(texture), failed }
}

let fallbackTexture = null
export function getFallbackPortraitTexture() {
  if (fallbackTexture) return fallbackTexture

  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#1d4ed8')
  gradient.addColorStop(1, '#0ea5e9')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  // simple silhouette: head + shoulders
  ctx.fillStyle = 'rgba(8, 16, 32, 0.55)'
  ctx.beginPath()
  ctx.arc(size / 2, size * 0.4, size * 0.18, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(size / 2, size * 0.92, size * 0.34, size * 0.4, 0, Math.PI, 0)
  ctx.fill()

  fallbackTexture = new THREE.CanvasTexture(canvas)
  fallbackTexture.colorSpace = THREE.SRGBColorSpace
  return fallbackTexture
}
