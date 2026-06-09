import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// Stylised low-poly helicopter built from primitives — no external model needed.
// `spin` (0-1) controls rotor speed so it can spool up/down with the story.
export default function Helicopter({ spin = 1, ...props }) {
  const mainRotor = useRef()
  const tailRotor = useRef()
  const beacon = useRef()

  useFrame((state, delta) => {
    const speed = 26 * spin + 0.4
    if (mainRotor.current) mainRotor.current.rotation.y += delta * speed
    if (tailRotor.current) tailRotor.current.rotation.x += delta * speed * 1.6
    if (beacon.current) {
      const pulse = 0.6 + Math.sin(state.clock.elapsedTime * 6) * 0.4
      beacon.current.material.emissiveIntensity = pulse
    }
  })

  return (
    <group {...props} dispose={null}>
      {/* Body */}
      <mesh castShadow position={[0, 0, 0]}>
        <capsuleGeometry args={[0.55, 1.4, 6, 12]} />
        <meshStandardMaterial color="#e6e9ef" metalness={0.4} roughness={0.35} />
      </mesh>

      {/* Cockpit glass */}
      <mesh castShadow position={[0.95, 0.05, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshPhysicalMaterial
          color="#7fd4ff"
          transmission={0.6}
          roughness={0.1}
          metalness={0.1}
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* Tail boom */}
      <mesh castShadow position={[-1.55, 0.18, 0]} rotation={[0, 0, 0.06]}>
        <cylinderGeometry args={[0.13, 0.22, 1.9, 10]} />
        <meshStandardMaterial color="#cfd6e2" metalness={0.4} roughness={0.4} />
      </mesh>

      {/* Tail fin */}
      <mesh castShadow position={[-2.45, 0.55, 0]}>
        <boxGeometry args={[0.08, 0.7, 0.4]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Tail rotor */}
      <group ref={tailRotor} position={[-2.55, 0.5, 0]}>
        <mesh>
          <boxGeometry args={[0.04, 0.9, 0.07]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.04, 0.9, 0.07]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Skids */}
      {[-0.5, 0.5].map((z) => (
        <group key={z} position={[0, -0.78, z]}>
          <mesh>
            <boxGeometry args={[1.7, 0.06, 0.06]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0.7, 0.22, 0]} rotation={[0, 0, -0.6]}>
            <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[-0.7, 0.22, 0]} rotation={[0, 0, 0.6]}>
            <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      ))}

      {/* Rotor mast + main rotor */}
      <mesh position={[0, 0.78, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.3, 8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <group ref={mainRotor} position={[0, 0.95, 0]}>
        <mesh>
          <boxGeometry args={[4.4, 0.05, 0.16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[4.4, 0.05, 0.16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* Beacon light */}
      <mesh ref={beacon} position={[0, 1.18, 0]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1} />
      </mesh>
      <pointLight color="#38bdf8" intensity={2.4} distance={6} position={[0, 1.2, 0]} />
    </group>
  )
}
