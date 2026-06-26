"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

// ── Warm floating light motes — tiny glowing particles drifting inside the womb ──
function Motes({ count = 52 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 0.6 + Math.random() * 1.5;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.055;
      ref.current.rotation.x = state.clock.elapsedTime * 0.028;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.022}
        color="#F5C6CB"
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ── Main womb + fetus scene ──
function WombScene() {
  const sceneRef = useRef<THREE.Group>(null);  // parallax target
  const fetusRef = useRef<THREE.Group>(null);  // heartbeat scale target
  const wombRef  = useRef<THREE.Mesh>(null);   // gentle breathing inner glow
  const ringRef  = useRef<THREE.Mesh>(null);   // slow drifting outer ring
  const { mouse } = useThree();

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Slow pointer parallax — the whole scene tracks the cursor softly
    if (sceneRef.current) {
      sceneRef.current.position.x = THREE.MathUtils.lerp(
        sceneRef.current.position.x, mouse.x * 0.35, 0.04,
      );
      sceneRef.current.position.y = THREE.MathUtils.lerp(
        sceneRef.current.position.y, mouse.y * 0.22, 0.04,
      );
    }

    // Heartbeat pulse — ~1.2s period (2π / 1.2 ≈ 5.24 rad/s), ±3% scale
    if (fetusRef.current) {
      fetusRef.current.scale.setScalar(1 + Math.sin(t * 5.24) * 0.03);
    }

    // Womb breathing — slower, independent of heartbeat
    if (wombRef.current) {
      (wombRef.current as THREE.Mesh).scale.setScalar(
        1 + Math.sin(t * 0.55) * 0.025,
      );
      (wombRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.12 + Math.sin(t * 0.45) * 0.04;
    }

    // Ring drift
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.048;
      ringRef.current.rotation.x = Math.PI / 5 + Math.sin(t * 0.28) * 0.06;
    }
  });

  return (
    <>
      {/* Warm OB-GYN lighting — rose-gold key, violet fill, teal accent */}
      <ambientLight intensity={0.22} />
      <pointLight position={[ 0,  0,  4]} intensity={30} color="#E8B4B8" />
      <pointLight position={[-3,  2,  1]} intensity={18} color="#7C6CF0" />
      <pointLight position={[ 3, -1,  2]} intensity={14} color="#0EA5A4" />
      <pointLight position={[ 0,  3, -2]} intensity={10} color="#F5C6CB" />

      <group ref={sceneRef}>

        {/* ── Womb atmosphere — three nested BackSide spheres, outer→inner ── */}

        {/* Outermost: barely-there violet boundary */}
        <Sphere args={[2.9, 40, 40]}>
          <meshBasicMaterial
            color="#7C6CF0"
            side={THREE.BackSide}
            transparent
            opacity={0.05}
            depthWrite={false}
          />
        </Sphere>

        {/* Mid: warm rose-gold haze with subtle organic distortion */}
        <Sphere args={[2.5, 40, 40]}>
          <MeshDistortMaterial
            color="#E8B4B8"
            distort={0.06}
            speed={0.45}
            roughness={0.5}
            metalness={0}
            emissive="#E8B4B8"
            emissiveIntensity={0.2}
            side={THREE.BackSide}
            transparent
            opacity={0.18}
          />
        </Sphere>

        {/* Inner: breathing core glow */}
        <mesh ref={wombRef}>
          <sphereGeometry args={[2.0, 32, 32]} />
          <meshBasicMaterial
            color="#F5C6CB"
            side={THREE.BackSide}
            transparent
            opacity={0.12}
            depthWrite={false}
          />
        </mesh>

        {/* ── Orbit rings ── */}

        {/* Primary rose-gold ring — slowly drifts */}
        <mesh ref={ringRef} rotation={[Math.PI / 5, 0, 0]}>
          <torusGeometry args={[2.3, 0.012, 8, 80]} />
          <meshBasicMaterial color="#E8B4B8" transparent opacity={0.28} />
        </mesh>

        {/* Secondary teal ring — static tilt */}
        <mesh rotation={[Math.PI / 3, Math.PI / 6, 0]}>
          <torusGeometry args={[2.0, 0.008, 8, 64]} />
          <meshBasicMaterial color="#0EA5A4" transparent opacity={0.15} />
        </mesh>

        {/* ── Floating light motes ── */}
        <Motes count={52} />

        {/* ── Stylised fetus silhouette — abstract curled form, glowing blobs ── */}
        <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.35}>
          <group ref={fetusRef}>

            {/* Soft overall aura — ties the blobs into one glowing form */}
            <Sphere args={[0.88, 24, 24]} position={[0.02, 0.07, 0]}>
              <meshBasicMaterial
                color="#F5C6CB"
                transparent
                opacity={0.07}
                depthWrite={false}
              />
            </Sphere>

            {/* Head */}
            <Sphere args={[0.28, 32, 32]} position={[0.06, 0.54, 0.05]}>
              <MeshDistortMaterial
                color="#FADADD"
                distort={0.12}
                speed={1.2}
                roughness={0.15}
                metalness={0.2}
                emissive="#FADADD"
                emissiveIntensity={1.15}
                transparent
                opacity={0.92}
              />
            </Sphere>

            {/* Neck / chin transition */}
            <Sphere args={[0.14, 24, 24]} position={[0.04, 0.29, 0.04]}>
              <MeshDistortMaterial
                color="#F5C6CB"
                distort={0.1}
                speed={1.0}
                roughness={0.2}
                metalness={0.2}
                emissive="#F5C6CB"
                emissiveIntensity={0.9}
                transparent
                opacity={0.85}
              />
            </Sphere>

            {/* Torso */}
            <Sphere args={[0.34, 32, 32]} position={[0, 0.05, 0]}>
              <MeshDistortMaterial
                color="#E8B4B8"
                distort={0.16}
                speed={1.0}
                roughness={0.2}
                metalness={0.25}
                emissive="#E8B4B8"
                emissiveIntensity={0.88}
                transparent
                opacity={0.88}
              />
            </Sphere>

            {/* Curled knees — tucked toward chest */}
            <Sphere args={[0.22, 28, 28]} position={[0.28, -0.26, 0.12]}>
              <MeshDistortMaterial
                color="#E8B4B8"
                distort={0.14}
                speed={0.9}
                roughness={0.22}
                metalness={0.2}
                emissive="#E8B4B8"
                emissiveIntensity={0.8}
                transparent
                opacity={0.82}
              />
            </Sphere>

            {/* Lower body / pelvis */}
            <Sphere args={[0.24, 28, 28]} position={[-0.06, -0.35, 0]}>
              <MeshDistortMaterial
                color="#DCA5B0"
                distort={0.12}
                speed={0.9}
                roughness={0.25}
                metalness={0.18}
                emissive="#DCA5B0"
                emissiveIntensity={0.76}
                transparent
                opacity={0.78}
              />
            </Sphere>

          </group>
        </Float>
      </group>

      {/* Warm bloom — lower threshold so rose-gold highlights glow richly */}
      <EffectComposer>
        <Bloom
          intensity={1.1}
          luminanceThreshold={0.25}
          luminanceSmoothing={0.92}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

// Export kept as AuroraOrb so Hero.tsx import is unchanged
export function AuroraOrb() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 48 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <WombScene />
    </Canvas>
  );
}
