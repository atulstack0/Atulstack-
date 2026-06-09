import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import Helicopter from './Helicopter'

function LoaderScene() {
  const group = useRef()

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    group.current.position.y = Math.sin(t * 1.6) * 0.25
    group.current.rotation.y = t * 0.5
    group.current.rotation.z = Math.sin(t * 1.2) * 0.06
  })

  return (
    <group ref={group} scale={1.3}>
      <Helicopter spin={1} />
      <ambientLight intensity={0.6} color="#9db4ff" />
      <directionalLight position={[4, 6, 4]} intensity={1.1} color="#dbe6ff" />
      <pointLight position={[-3, -1, 2]} intensity={0.8} color="#7c3aed" />
    </group>
  )
}

export default function Loader({ onFinished }) {
  const [progress, setProgress] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    let raf
    const start = performance.now()
    const DURATION = 2200

    const tick = (now) => {
      const elapsed = now - start
      const next = Math.min(100, Math.round((elapsed / DURATION) * 100))
      setProgress(next)
      if (next < 100) {
        raf = requestAnimationFrame(tick)
      } else {
        setLeaving(true)
        setTimeout(onFinished, 700)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [onFinished])

  return (
    <div className={`loader ${leaving ? 'loader--leaving' : ''}`}>
      <div className="loader__canvas">
        <Canvas camera={{ position: [3.4, 1.6, 4.2], fov: 42 }} dpr={[1, 1.6]}>
          <color attach="background" args={['#04060f']} />
          <LoaderScene />
        </Canvas>
      </div>

      <div className="loader__overlay">
        <p className="loader__eyebrow">Inbound transmission</p>
        <h1 className="loader__title">Atul is on approach…</h1>
        <div className="loader__bar">
          <div className="loader__bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="loader__percent">{progress}%</p>
      </div>
    </div>
  )
}
