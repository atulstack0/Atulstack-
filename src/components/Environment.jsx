import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Stars({ count = 1200 }) {
  const points = useRef()

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const radius = 40 + Math.random() * 60
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 0.6) // keep them mostly above horizon
      arr[i * 3 + 0] = radius * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = Math.abs(radius * Math.cos(phi)) + 4
      arr[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
    }
    return arr
  }, [count])

  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.006
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#bcd4ff" size={0.18} sizeAttenuation transparent opacity={0.7} />
    </points>
  )
}

function LandingPad() {
  const ring = useRef()

  useFrame((state) => {
    if (ring.current) {
      const pulse = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.5
      ring.current.material.emissiveIntensity = 0.6 + pulse * 0.6
    }
  })

  return (
    <group position={[0, 0.01, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[6.5, 48]} />
        <meshStandardMaterial color="#11182c" roughness={0.9} />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[2.5, 2.65, 64]} />
        <meshStandardMaterial color="#1d4ed8" emissive="#38bdf8" emissiveIntensity={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <ringGeometry args={[1.7, 1.78, 64]} />
        <meshStandardMaterial color="#0ea5e9" emissive="#60a5fa" emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}

export default function Environment() {
  return (
    <group>
      <Stars />
      <fog attach="fog" args={['#040711', 14, 60]} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[40, 64]} />
        <meshStandardMaterial color="#070b18" roughness={1} />
      </mesh>

      <LandingPad />

      {/* Distant skyline silhouettes for depth */}
      {[-14, -9, 12, 17].map((x, i) => (
        <mesh key={x} position={[x, 1.4 + i * 0.3, -16 - i * 2]}>
          <boxGeometry args={[2.4 + i, 2.8 + i * 1.4, 2.4 + i]} />
          <meshStandardMaterial color="#0b1224" />
        </mesh>
      ))}
    </group>
  )
}
