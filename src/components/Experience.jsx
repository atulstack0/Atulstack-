import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Helicopter from './Helicopter'
import Character from './Character'
import Aura from './Aura'
import Environment from './Environment'
import { lerp, mapRange } from '../utils/math'

const tmpVec = new THREE.Vector3()
const tmpLook = new THREE.Vector3()
const tmpFollow = new THREE.Vector3()

// Camera position keyframes — the viewer's vantage point through the story.
// During the walk (progress > ~0.3) the camera settles into a steady spot
// that the character approaches, so the "look" target below can take over.
const CAMERA_KEYS = [
  { p: 0.0, pos: [9, 7.5, 13], look: [0, 3, -1] },
  { p: 0.16, pos: [6.4, 3.6, 9], look: [1.4, 1.6, -1] },
  { p: 0.3, pos: [3.4, 2.05, 6.6], look: [1, 1.55, 0.4] },
  { p: 0.55, pos: [1.1, 2.0, 6.7], look: [0.6, 1.7, 2] },
  { p: 0.82, pos: [0.45, 1.92, 6.55], look: [0.2, 1.8, 3.6] },
  { p: 1.0, pos: [0.25, 1.88, 6.4], look: [0, 1.85, 4.6] },
]

function sampleKeys(keys, progress, out, key) {
  let i = 0
  while (i < keys.length - 2 && progress > keys[i + 1].p) i++
  const a = keys[i]
  const b = keys[i + 1]
  const span = b.p - a.p
  const t = span > 0 ? (progress - a.p) / span : 0
  const ease = t * t * (3 - 2 * t)
  out.set(
    lerp(a[key][0], b[key][0], ease),
    lerp(a[key][1], b[key][1], ease),
    lerp(a[key][2], b[key][2], ease),
  )
  return out
}

const HELI_SKY = [3.4, 9.5, -6]
const HELI_GROUND = [2.5, 0.92, -1.6]
const CHAR_START = [1.05, 0, -0.8]
const CHAR_END = [0, 0, 4.8]
const FACE_HEIGHT = 1.92

export default function Experience({ progress = 0 }) {
  const heli = useRef()
  const character = useRef()
  const aura = useRef()
  const sun = useRef()
  const camTarget = useRef(new THREE.Vector3(0, 1.6, 0))

  // Story phases — every visual beat derives from this single scroll value.
  const descend = mapRange(progress, 0.0, 0.17)
  const settle = mapRange(progress, 0.16, 0.24)
  const emerge = mapRange(progress, 0.27, 0.4)
  const walk = mapRange(progress, 0.36, 0.94)
  const rotorSpin = 1 - mapRange(progress, 0.2, 0.34)
  const auraIntensity = mapRange(progress, 0.44, 0.78)
  const faceReveal = mapRange(progress, 0.3, 0.5)
  const walkBlend = Math.min(1, walk * 3.2) * (1 - mapRange(progress, 0.9, 0.97))
  // How much the camera's gaze should lock onto the character rather than the scripted path.
  const followBlend = mapRange(progress, 0.26, 0.44)

  useFrame(({ camera }, delta) => {
    const smoothing = 1 - Math.pow(0.0001, delta)

    // Helicopter: descends from the sky and settles onto the pad with a soft bounce.
    if (heli.current) {
      const x = lerp(HELI_SKY[0], HELI_GROUND[0], descend)
      const z = lerp(HELI_SKY[2], HELI_GROUND[2], descend)
      const baseY = lerp(HELI_SKY[1], HELI_GROUND[1], descend)
      const bounce = Math.sin(settle * Math.PI) * 0.18 * (1 - settle)
      heli.current.position.set(x, baseY + bounce, z)
      heli.current.rotation.y = lerp(0.5, 0, descend)
    }

    // Camera: a scripted dolly for the arrival, settling into a fixed vantage
    // that the character then walks toward.
    sampleKeys(CAMERA_KEYS, progress, tmpVec, 'pos')
    sampleKeys(CAMERA_KEYS, progress, tmpLook, 'look')
    camera.position.lerp(tmpVec, smoothing)

    // Character: steps out once landed, then walks straight toward the camera.
    if (character.current) {
      character.current.visible = emerge > 0.02
      const x = lerp(CHAR_START[0], CHAR_END[0], walk)
      const z = lerp(CHAR_START[2], CHAR_END[2], walk)
      const riseIn = Math.min(1, emerge * 1.4)
      character.current.position.set(x, 0, z)
      character.current.scale.setScalar(0.92 + riseIn * 0.08)

      // Always face the viewer — naturally turning to the camera as the walk begins.
      const faceAngle = Math.atan2(camera.position.x - x, camera.position.z - z)
      character.current.rotation.y = lerp(Math.PI * 0.32, faceAngle, Math.min(1, walk * 1.6))

      tmpFollow.set(x, FACE_HEIGHT, z)
    } else {
      tmpFollow.copy(tmpLook)
    }

    // Blend the scripted look-path into a direct gaze on the character's face.
    tmpLook.lerp(tmpFollow, followBlend)
    camTarget.current.lerp(tmpLook, smoothing)
    camera.lookAt(camTarget.current)

    // Aura: glowing field that travels with the character.
    if (aura.current && character.current) {
      aura.current.position.copy(character.current.position)
    }

    if (sun.current) sun.current.intensity = lerp(0.6, 1.4, descend)
  })

  return (
    <>
      <ambientLight intensity={0.35} color="#9db4ff" />
      <directionalLight
        ref={sun}
        position={[8, 12, 6]}
        intensity={0.8}
        color="#dbe6ff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-6, 4, -4]} intensity={0.6} color="#7c3aed" />

      <Environment />

      <group ref={heli}>
        <Helicopter spin={rotorSpin} />
      </group>

      <group ref={character}>
        <Character walk={walkBlend} reveal={faceReveal} />
      </group>

      <group ref={aura}>
        <Aura intensity={auraIntensity} />
      </group>
    </>
  )
}
