import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { profile } from '../data/portfolioData'
import { getFallbackPortraitTexture, usePortraitTexture } from '../hooks/usePortraitTexture'

// Stylised low-poly figure carrying a suitcase. `walk` (0-1) blends in the
// stride animation, and `reveal` (0-1) fades the portrait face into view.
export default function Character({ walk = 0, reveal = 1, ...props }) {
  const group = useRef()
  const leftLeg = useRef()
  const rightLeg = useRef()
  const leftArm = useRef()
  const suitcaseArm = useRef()
  const bob = useRef()
  const faceMat = useRef()

  const { texture } = usePortraitTexture(profile.photo)
  const portrait = texture || getFallbackPortraitTexture()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const stride = Math.sin(t * 6) * walk

    if (leftLeg.current) leftLeg.current.rotation.x = stride * 0.6
    if (rightLeg.current) rightLeg.current.rotation.x = -stride * 0.6
    if (leftArm.current) leftArm.current.rotation.x = -stride * 0.5
    if (suitcaseArm.current) suitcaseArm.current.rotation.x = stride * 0.18
    if (bob.current) bob.current.position.y = Math.abs(Math.sin(t * 6)) * 0.05 * walk

    if (faceMat.current) {
      faceMat.current.opacity = reveal
    }
  })

  return (
    <group ref={group} {...props} dispose={null}>
      <group ref={bob}>
        {/* Legs */}
        <group ref={leftLeg} position={[-0.16, 0.95, 0]}>
          <mesh castShadow position={[0, -0.45, 0]}>
            <capsuleGeometry args={[0.11, 0.7, 4, 8]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
        </group>
        <group ref={rightLeg} position={[0.16, 0.95, 0]}>
          <mesh castShadow position={[0, -0.45, 0]}>
            <capsuleGeometry args={[0.11, 0.7, 4, 8]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
        </group>

        {/* Torso */}
        <mesh castShadow position={[0, 1.45, 0]}>
          <capsuleGeometry args={[0.26, 0.6, 6, 12]} />
          <meshStandardMaterial color="#0f1b3d" metalness={0.2} roughness={0.6} />
        </mesh>

        {/* Free arm */}
        <group ref={leftArm} position={[-0.34, 1.62, 0]}>
          <mesh castShadow position={[0, -0.34, 0]}>
            <capsuleGeometry args={[0.085, 0.55, 4, 8]} />
            <meshStandardMaterial color="#142454" />
          </mesh>
        </group>

        {/* Suitcase arm */}
        <group ref={suitcaseArm} position={[0.34, 1.62, 0]}>
          <mesh castShadow position={[0, -0.34, 0]}>
            <capsuleGeometry args={[0.085, 0.55, 4, 8]} />
            <meshStandardMaterial color="#142454" />
          </mesh>
          {/* Smart suitcase */}
          <group position={[0.05, -0.78, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.34, 0.46, 0.16]} />
              <meshStandardMaterial color="#111827" metalness={0.5} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.085]}>
              <boxGeometry args={[0.26, 0.32, 0.01]} />
              <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.9} />
            </mesh>
            <mesh position={[0, 0.27, 0]}>
              <torusGeometry args={[0.05, 0.015, 8, 16, Math.PI]} />
              <meshStandardMaterial color="#4b5563" />
            </mesh>
          </group>
        </group>

        {/* Head */}
        <group position={[0, 2.05, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.22, 24, 24]} />
            <meshStandardMaterial color="#f1d8c0" roughness={0.7} />
          </mesh>
          {/* Portrait plane (your photo) facing forward */}
          <mesh position={[0, 0, 0.205]}>
            <circleGeometry args={[0.205, 32]} />
            <meshBasicMaterial ref={faceMat} map={portrait} transparent opacity={reveal} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
