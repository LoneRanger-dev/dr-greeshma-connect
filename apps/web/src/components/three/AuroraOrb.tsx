"use client";

import { Component, Suspense, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

// Kick off the GLB fetch immediately so it's cached before the component mounts
useGLTF.preload("/models/fetus.glb");

// ── X-Ray ShaderMaterial ──────────────────────────────────────────────────────
// Fresnel rim-glow: deep teal core → rose-gold (#E8B4B8) glowing edges.
// Nearly transparent at the surface facing the camera; opaque + emissive at
// silhouette edges so Bloom catches the rim. Slow pulse keeps it alive.

const XRAY_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec4 mvPosition  = modelViewMatrix * vec4(position, 1.0);
    vViewPosition    = -mvPosition.xyz;
    vNormal          = normalize(normalMatrix * normal);
    gl_Position      = projectionMatrix * mvPosition;
  }
`;

const XRAY_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3  uCoreColor;
  uniform vec3  uRimColor;
  uniform float uRimPower;

  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3  N       = normalize(vNormal);
    vec3  V       = normalize(vViewPosition);

    float facing  = abs(dot(V, N));
    float fresnel = pow(1.0 - facing, uRimPower);

    float pulse   = 0.82 + 0.18 * sin(uTime * 0.9);
    float rim     = fresnel * pulse;

    vec3 col = mix(uCoreColor, uRimColor, rim);
    col += uRimColor * rim * 0.55;

    float alpha = mix(0.07, 0.92, rim);
    gl_FragColor = vec4(col, alpha);
  }
`;

function makeXRayMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader:   XRAY_VERT,
    fragmentShader: XRAY_FRAG,
    uniforms: {
      uTime:      { value: 0 },
      uCoreColor: { value: new THREE.Color("#0EA5A4") },
      uRimColor:  { value: new THREE.Color("#E8B4B8") },
      uRimPower:  { value: 2.5 },
    },
    transparent: true,
    depthWrite:  false,
    side:        THREE.DoubleSide,
    blending:    THREE.NormalBlending,
  });
}

// ── Error boundary: catches useGLTF 404 / parse failures ─────────────────────
class FetusErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(err: Error) {
    console.warn(
      "[WombScene] fetus.glb failed to load — womb backdrop still visible:",
      err.message,
    );
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

// ── GLB loader — must live inside <Suspense> ──────────────────────────────────
function FetusModel() {
  const { scene } = useGLTF("/models/fetus.glb");

  const xrayMat = useMemo(makeXRayMaterial, []);

  const cloned = useMemo(() => {
    const clone = scene.clone(true);

    // Auto-scale: fit the longest axis to 2.5 scene units regardless of
    // what units the GLB was exported in (meters / cm / arbitrary)
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const autoScale = maxDim > 0 ? 2.5 / maxDim : 1;
    clone.scale.setScalar(autoScale);

    // Center at scene origin
    const center = new THREE.Vector3();
    box.getCenter(center);
    clone.position.copy(center).multiplyScalar(-autoScale);

    // Apply x-ray shader to every mesh in the hierarchy
    clone.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.material    = xrayMat;
        obj.renderOrder = 1;
      }
    });

    return clone;
  }, [scene, xrayMat]);

  useFrame((state) => {
    xrayMat.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return <primitive object={cloned} />;
}

// ── Warm floating light motes ─────────────────────────────────────────────────
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

// ── Main scene ────────────────────────────────────────────────────────────────
function WombScene() {
  const sceneRef = useRef<THREE.Group>(null);  // parallax
  const fetusRef = useRef<THREE.Group>(null);  // heartbeat + Y-rotation
  const wombRef  = useRef<THREE.Mesh>(null);   // breathing inner glow
  const ringRef  = useRef<THREE.Mesh>(null);   // drifting ring
  const { mouse } = useThree();

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (sceneRef.current) {
      sceneRef.current.position.x = THREE.MathUtils.lerp(
        sceneRef.current.position.x, mouse.x * 0.35, 0.04,
      );
      sceneRef.current.position.y = THREE.MathUtils.lerp(
        sceneRef.current.position.y, mouse.y * 0.22, 0.04,
      );
    }

    // Heartbeat ±3% at ~1.2 s + slow continuous rotation
    if (fetusRef.current) {
      fetusRef.current.scale.setScalar(1 + Math.sin(t * 5.24) * 0.03);
      fetusRef.current.rotation.y = t * 0.15;
    }

    if (wombRef.current) {
      wombRef.current.scale.setScalar(1 + Math.sin(t * 0.55) * 0.025);
      (wombRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.12 + Math.sin(t * 0.45) * 0.04;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.048;
      ringRef.current.rotation.x = Math.PI / 5 + Math.sin(t * 0.28) * 0.06;
    }
  });

  return (
    <>
      <ambientLight intensity={0.22} />
      <pointLight position={[ 0,  0,  4]} intensity={30} color="#E8B4B8" />
      <pointLight position={[-3,  2,  1]} intensity={18} color="#7C6CF0" />
      <pointLight position={[ 3, -1,  2]} intensity={14} color="#0EA5A4" />
      <pointLight position={[ 0,  3, -2]} intensity={10} color="#F5C6CB" />

      <group ref={sceneRef}>

        {/* ── Womb atmosphere ── */}
        <Sphere args={[2.9, 40, 40]}>
          <meshBasicMaterial
            color="#7C6CF0"
            side={THREE.BackSide}
            transparent
            opacity={0.05}
            depthWrite={false}
          />
        </Sphere>

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
        <mesh ref={ringRef} rotation={[Math.PI / 5, 0, 0]}>
          <torusGeometry args={[2.3, 0.012, 8, 80]} />
          <meshBasicMaterial color="#E8B4B8" transparent opacity={0.28} />
        </mesh>
        <mesh rotation={[Math.PI / 3, Math.PI / 6, 0]}>
          <torusGeometry args={[2.0, 0.008, 8, 64]} />
          <meshBasicMaterial color="#0EA5A4" transparent opacity={0.15} />
        </mesh>

        {/* ── Motes ── */}
        <Motes count={52} />

        {/* ── X-ray fetus model ──
         *  Float: gentle vertical bob.
         *  fetusRef: heartbeat scale + slow Y rotation.
         *  FetusErrorBoundary: suppresses 404/parse errors, logs a warning.
         *  Suspense fallback=null: womb backdrop stays visible while GLB loads.
         */}
        <Float speed={1.1} rotationIntensity={0.0} floatIntensity={0.3}>
          <group ref={fetusRef}>
            <FetusErrorBoundary>
              <Suspense fallback={null}>
                <FetusModel />
              </Suspense>
            </FetusErrorBoundary>
          </group>
        </Float>
      </group>

      <EffectComposer>
        <Bloom
          intensity={1.0}
          luminanceThreshold={0.28}
          luminanceSmoothing={0.92}
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
      <WombScene />
    </Canvas>
  );
}
