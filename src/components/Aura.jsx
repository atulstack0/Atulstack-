import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 260

const vertexShader = /* glsl */ `
  attribute vec3 aData; // radius, angular speed, phase
  attribute float aSeed;
  uniform float uTime;
  uniform float uIntensity;
  varying float vSeed;
  varying float vIntensity;

  void main() {
    float angle = aData.y * uTime + aData.z;
    float radius = aData.x * (0.6 + 0.45 * uIntensity);
    vec3 pos = position;
    pos.x = cos(angle) * radius;
    pos.z = sin(angle) * radius * 0.82;
    pos.y += sin(uTime * 1.6 + aData.z) * 0.18 * uIntensity;

    vSeed = aSeed;
    vIntensity = uIntensity;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    // Cap size so close-up shots don't create pixel-wide splats that blow out
    float dist = max(1.2, -mvPosition.z);
    gl_PointSize = (1.8 + aSeed * 3.2) * (0.5 + uIntensity * 0.6) * (160.0 / dist);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = /* glsl */ `
  varying float vSeed;
  varying float vIntensity;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float glow = smoothstep(0.5, 0.0, d);

    vec3 electricBlue = vec3(0.22, 0.72, 1.0);
    vec3 aiViolet     = vec3(0.55, 0.38, 0.95);
    vec3 color = mix(electricBlue, aiViolet, vSeed);

    // Keep each particle soft so 260 overlapping ones stay colourful, not white.
    float alpha = glow * vIntensity * 0.55;
    gl_FragColor = vec4(color, alpha);
  }
`

// Swirling electric-blue / violet "AI Jarvis" energy field that builds up
// around the character as the story progresses. `intensity` is 0 (off) -> 1 (full aura).
export default function Aura({ intensity = 0, ...props }) {
  const points = useRef()
  const ringA = useRef()
  const ringB = useRef()
  const beam = useRef()
  const smoothed = useRef(0)

  const geometry = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const data = new Float32Array(PARTICLE_COUNT * 3)
    const seeds = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3 + 1] = Math.random() * 2.6 - 0.4

      data[i * 3 + 0] = 0.7 + Math.random() * 0.9 // radius
      data[i * 3 + 1] = (Math.random() - 0.5) * 1.6 // angular speed (sign = direction)
      data[i * 3 + 2] = Math.random() * Math.PI * 2 // phase

      seeds[i] = Math.random()
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aData', new THREE.BufferAttribute(data, 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    return geo
  }, [])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )

  useFrame((state, delta) => {
    smoothed.current = THREE.MathUtils.damp(smoothed.current, intensity, 3, delta)
    const t = state.clock.elapsedTime

    material.uniforms.uTime.value = t
    material.uniforms.uIntensity.value = smoothed.current

    if (ringA.current) {
      ringA.current.rotation.z = t * 0.6
      ringA.current.material.opacity = smoothed.current * 0.8
      ringA.current.scale.setScalar(0.9 + smoothed.current * 0.25)
    }
    if (ringB.current) {
      ringB.current.rotation.z = -t * 0.4
      ringB.current.material.opacity = smoothed.current * 0.6
      ringB.current.scale.setScalar(1.15 + smoothed.current * 0.35)
    }
    if (beam.current) {
      beam.current.material.opacity = smoothed.current * 0.07
      beam.current.scale.x = beam.current.scale.z = 0.8 + smoothed.current * 0.5
    }
  })

  return (
    <group {...props} dispose={null}>
      <points ref={points} geometry={geometry} material={material} />

      <mesh ref={ringA} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.4, 0]}>
        <torusGeometry args={[0.95, 0.012, 8, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0} toneMapped={false} />
      </mesh>
      <mesh ref={ringB} rotation={[Math.PI / 2.4, 0, 0]} position={[0, 1.1, 0]}>
        <torusGeometry args={[1.15, 0.008, 8, 64]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0} toneMapped={false} />
      </mesh>

      <mesh ref={beam} position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.55, 0.85, 2.6, 24, 1, true]} />
        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          toneMapped={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}
