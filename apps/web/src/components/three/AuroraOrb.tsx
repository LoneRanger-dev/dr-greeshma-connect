"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Stars, MeshDistortMaterial, Sphere } from "@react-three/drei";
import * as THREE from "three";

function OrbScene() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const { mouse } = useThree();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      // Gentle parallax tracking
      meshRef.current.position.x = THREE.MathUtils.lerp(
        meshRef.current.position.x, mouse.x * 0.4, 0.04
      );
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y, mouse.y * 0.25, 0.04
      );
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.04);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.08 + Math.sin(t * 0.6) * 0.02;
    }
  });

  return (
    <>
      {/* Ambient + coloured point lights */}
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 4, 3]} intensity={30} color="#0EA5A4" />
      <pointLight position={[-4, -3, -2]} intensity={20} color="#7C6CF0" />
      <pointLight position={[0, -4, 4]} intensity={10} color="#E8B4B8" />

      {/* Background star field */}
      <Stars
        radius={80}
        depth={40}
        count={2500}
        factor={3}
        saturation={0.5}
        fade
        speed={0.5}
      />

      {/* Main orb with floating animation */}
      <Float speed={1.6} rotationIntensity={0.45} floatIntensity={0.7}>
        <Sphere ref={meshRef} args={[1.45, 80, 80]}>
          <MeshDistortMaterial
            color="#0EA5A4"
            distort={0.38}
            speed={2.2}
            roughness={0.08}
            metalness={0.75}
            emissive="#7C6CF0"
            emissiveIntensity={0.45}
          />
        </Sphere>

        {/* Outer glow halo */}
        <Sphere ref={glowRef} args={[1.75, 32, 32]}>
          <meshBasicMaterial
            color="#0EA5A4"
            transparent
            opacity={0.09}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </Sphere>
      </Float>

      {/* Small floating accent orbs */}
      <Float speed={2.2} rotationIntensity={1} floatIntensity={1.2}>
        <Sphere args={[0.25, 32, 32]} position={[2.5, 1.2, -1]}>
          <MeshDistortMaterial
            color="#7C6CF0"
            distort={0.5}
            speed={3}
            roughness={0.1}
            metalness={0.8}
            emissive="#7C6CF0"
            emissiveIntensity={0.6}
          />
        </Sphere>
      </Float>

      <Float speed={1.8} rotationIntensity={0.8} floatIntensity={1}>
        <Sphere args={[0.18, 32, 32]} position={[-2.2, -1.5, -0.5]}>
          <MeshDistortMaterial
            color="#E8B4B8"
            distort={0.4}
            speed={2.5}
            roughness={0.15}
            metalness={0.6}
            emissive="#E8B4B8"
            emissiveIntensity={0.5}
          />
        </Sphere>
      </Float>
    </>
  );
}

export function AuroraOrb() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 48 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <OrbScene />
    </Canvas>
  );
}
