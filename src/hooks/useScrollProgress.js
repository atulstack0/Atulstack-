import { useEffect, useRef, useState } from 'react'

// Tracks how far the page has been scrolled, returned as 0 (top) -> 1 (bottom).
export function useScrollProgress() {
  const [progress, setProgress] = useState(0)
  const frame = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      if (frame.current) return
      frame.current = requestAnimationFrame(() => {
        frame.current = null
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const next = docHeight > 0 ? scrollTop / docHeight : 0
        setProgress(Math.min(1, Math.max(0, next)))
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frame.current) {
        cancelAnimationFrame(frame.current)
        frame.current = null
      }
    }
  }, [])

  return progress
}
