import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Hemisphere } from '@/types/atmosphere';

interface CycloneSystemProps {
  hemisphere: Hemisphere;
  visible?: boolean;
}

const EARTH_RADIUS = 5;

export function CycloneSystem({ hemisphere, visible = true }: CycloneSystemProps) {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const isNorth = hemisphere === 'north';
  const rotationDir = isNorth ? 1 : -1;

  const { spiralCurve, particleData } = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const pCount = 100;
    const pPos = new Float32Array(pCount * 3);
    const pSpeeds = new Float32Array(pCount);

    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const angle = t * Math.PI * 4 * rotationDir;
      const radius = 3 * (1 - t) + 0.3;
      const y = EARTH_RADIUS + 0.5 + t * 1.5;
      points.push(new THREE.Vector3(
        radius * Math.cos(angle),
        y,
        radius * Math.sin(angle)
      ));
    }

    const curve = new THREE.CatmullRomCurve3(points);

    for (let i = 0; i < pCount; i++) {
      const t = i / pCount;
      const pt = curve.getPoint(t);
      pPos[i * 3] = pt.x + (Math.random() - 0.5) * 0.5;
      pPos[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.3;
      pPos[i * 3 + 2] = pt.z + (Math.random() - 0.5) * 0.5;
      pSpeeds[i] = t;
    }

    return { spiralCurve: curve, particleData: { positions: pPos, speeds: pSpeeds } };
  }, [rotationDir]);

  useFrame((_, delta) => {
    if (!particlesRef.current || !visible) return;
    const posAttr = particlesRef.current.geometry.attributes.position;
    const posArray = posAttr.array as Float32Array;

    for (let i = 0; i < particleData.speeds.length; i++) {
      particleData.speeds[i] += delta * 0.1;
      if (particleData.speeds[i] > 1) particleData.speeds[i] = 0;

      const pt = spiralCurve.getPoint(particleData.speeds[i]);
      posArray[i * 3] = pt.x;
      posArray[i * 3 + 1] = pt.y;
      posArray[i * 3 + 2] = pt.z;
    }

    posAttr.needsUpdate = true;
  });

  useFrame((_, delta) => {
    if (!groupRef.current || !visible) return;
    groupRef.current.rotation.y += delta * rotationDir * 0.5;
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {[1, 1.5, 2, 2.5, 3].map((radius, i) => (
        <mesh key={i} position={[0, EARTH_RADIUS + 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius - 0.05, radius, 64]} />
          <meshBasicMaterial color="#E53935" transparent opacity={0.4 - i * 0.05} side={THREE.DoubleSide} />
        </mesh>
      ))}

      <mesh position={[0, EARTH_RADIUS + 0.5, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1, 16]} />
        <meshBasicMaterial color="#B71C1C" transparent opacity={0.8} />
      </mesh>

      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particleData.positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial color="#E53935" size={0.12} transparent opacity={0.8} sizeAttenuation />
      </points>

      <mesh position={[0, EARTH_RADIUS + 2, 0]}>
        <coneGeometry args={[0.3, 1, 16]} />
        <meshBasicMaterial color="#FF6B35" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
