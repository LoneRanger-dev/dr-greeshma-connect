"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Stars, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

function OrbScene() {
  const meshRef  = useRef<THREE.Mesh>(null);
  const glowRef  = useRef<THREE.Mesh>(null);
  const ringRef  = useRef<THREE.Mesh>(null);
  const { mouse } = useThree();

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (meshRef.current) {
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, mouse.x * 0.45, 0.045);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, mouse.y * 0.3,  0.045);
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(t * 0.7) * 0.05);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.07 + Math.sin(t * 0.5) * 0.025;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = t * 0.12;
      ringRef.current.rotation.z = t * 0.08;
      ringRef.current.position.x = THREE.MathUtils.lerp(ringRef.current.position.x, mouse.x * 0.3, 0.03);
      ringRef.current.position.y = THREE.MathUtils.lerp(ringRef.current.position.y, mouse.y * 0.2, 0.03);
    }
  });

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.35} />
      <pointLight position={[4,  4,  3]} intensity={35} color="#0EA5A4" />
      <pointLight position={[-4, -3, -2]} intensity={22} color="#7C6CF0" />
      <pointLight position={[0,  -4,  4]} intensity={12} color="#E8B4B8" />
      <pointLight position={[2,   3, -3]} intensity={10} color="#0EA5A4" />

      {/* Star field */}
      <Stars radius={80} depth={40} count={2800} factor={3} saturation={0.6} fade speed={0.4} />

      {/* Main orb */}
      <Float speed={1.6} rotationIntensity={0.45} floatIntensity={0.7}>
        <Sphere ref={meshRef} args={[1.45, 96, 96]}>
          <MeshDistortMaterial
            color="#0EA5A4"
            distort={0.38}
            speed={2.2}
            roughness={0.06}
            metalness={0.78}
            emissive="#7C6CF0"
            emissiveIntensity={0.55}
          />
        </Sphere>

        {/* Outer glow halo */}
        <Sphere ref={glowRef} args={[1.8, 32, 32]}>
          <meshBasicMaterial color="#0EA5A4" transparent opacity={0.08} side={THREE.BackSide} depthWrite={false} />
        </Sphere>
      </Float>

      {/* Orbiting ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[2.1, 0.02, 8, 80]} />
        <meshBasicMaterial color="#7C6CF0" transparent opacity={0.3} />
      </mesh>

      {/* Accent orbs */}
      <Float speed={2.2} rotationIntensity={1} floatIntensity={1.2}>
        <Sphere args={[0.26, 32, 32]} position={[2.5, 1.2, -1]}>
          <MeshDistortMaterial
            color="#7C6CF0" distort={0.5} speed={3}
            roughness={0.1} metalness={0.8}
            emissive="#7C6CF0" emissiveIntensity={0.7}
          />
        </Sphere>
      </Float>

      <Float speed={1.8} rotationIntensity={0.8} floatIntensity={1}>
        <Sphere args={[0.18, 32, 32]} position={[-2.2, -1.5, -0.5]}>
          <MeshDistortMaterial
            color="#E8B4B8" distort={0.4} speed={2.5}
            roughness={0.15} metalness={0.6}
            emissive="#E8B4B8" emissiveIntensity={0.6}
          />
        </Sphere>
      </Float>

      <Float speed={2.5} rotationIntensity={1.2} floatIntensity={0.8}>
        <Sphere args={[0.13, 24, 24]} position={[1.8, -2.2, 0.8]}>
          <MeshDistortMaterial
            color="#0EA5A4" distort={0.45} speed={3.5}
            roughness={0.1} metalness={0.7}
            emissive="#0EA5A4" emissiveIntensity={0.8}
          />
        </Sphere>
      </Float>

      {/* Bloom post-processing */}
      <EffectComposer>
        <Bloom
          intensity={0.8}
          luminanceThreshold={0.4}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export function AuroraOrb() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 48 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <OrbScene />
    </Canvas>
  );
}
