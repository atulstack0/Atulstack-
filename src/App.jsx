import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Loader from './components/Loader'
import Experience from './components/Experience'
import StoryOverlay from './components/StoryOverlay'
import { useScrollProgress } from './hooks/useScrollProgress'
import './styles/story.css'

export default function App() {
  const [loading, setLoading] = useState(true)
  const progress = useScrollProgress()

  return (
    <>
      {loading && <Loader onFinished={() => setLoading(false)} />}

      <div className={`scene-stage ${loading ? 'scene-stage--hidden' : ''}`}>
        <Canvas
          shadows
          camera={{ position: [9, 7.5, 13], fov: 45, near: 0.1, far: 120 }}
          dpr={[1, 1.6]}
          gl={{ antialias: true }}
        >
          <color attach="background" args={['#04060f']} />
          <Suspense fallback={null}>
            <Experience progress={progress} />
          </Suspense>
        </Canvas>
      </div>

      <div className={`story-stage ${loading ? 'story-stage--hidden' : ''}`}>
        <header className="site-header">
          <span className="site-header__mark">Atul.</span>
          <span
            className="site-header__hint"
            style={{ opacity: Math.max(0, 1 - progress * 14) }}
          >
            Scroll to begin the story ↓
          </span>
        </header>

        <StoryOverlay progress={progress} />

        <div className="progress-rail" aria-hidden="true">
          <div className="progress-rail__fill" style={{ height: `${progress * 100}%` }} />
        </div>
      </div>
    </>
  )
}
