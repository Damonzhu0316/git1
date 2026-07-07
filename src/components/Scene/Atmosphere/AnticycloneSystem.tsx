import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Hemisphere } from '@/types/atmosphere';

interface AnticycloneSystemProps {
  hemisphere: Hemisphere;
  visible?: boolean;
}

const EARTH_RADIUS = 5;

export function AnticycloneSystem({ hemisphere, visible = true }: AnticycloneSystemProps) {
  const groupRef = useRef<THREE.Group>(null);

  const isNorth = hemisphere === 'north';
  const rotationDir = isNorth ? -1 : 1;

  useFrame((_, delta) => {
    if (!groupRef.current || !visible) return;
    groupRef.current.rotation.y += delta * rotationDir * 0.3;
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {[1, 1.5, 2, 2.5, 3].map((radius, i) => (
        <mesh key={i} position={[0, EARTH_RADIUS + 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius - 0.05, radius, 64]} />
          <meshBasicMaterial color="#1E88E5" transparent opacity={0.4 - i * 0.05} side={THREE.DoubleSide} />
        </mesh>
      ))}

      <mesh position={[0, EARTH_RADIUS + 0.5, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1, 16]} />
        <meshBasicMaterial color="#0D47A1" transparent opacity={0.8} />
      </mesh>

      <mesh position={[0, EARTH_RADIUS + 3, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.3, 1, 16]} />
        <meshBasicMaterial color="#42A5F5" transparent opacity={0.6} />
      </mesh>

      {Array.from({ length: 40 }).map((_, i) => {
        const angle = (i / 40) * Math.PI * 2;
        const radius = 1 + Math.random() * 2;
        return (
          <mesh
            key={i}
            position={[
              radius * Math.cos(angle),
              EARTH_RADIUS + 0.5 + Math.random() * 0.5,
              radius * Math.sin(angle),
            ]}
          >
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color="#1E88E5" transparent opacity={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}
