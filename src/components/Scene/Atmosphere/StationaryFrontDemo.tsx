import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FrontPlane } from './FrontPlane';

const EARTH_RADIUS = 5;

export function StationaryFrontDemo({ visible = true }: { visible?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current || !visible) return;
    timeRef.current += delta * 0.15;
    // 准静止锋：来回小幅摆动，模拟僵持状态
    groupRef.current.position.x = Math.sin(timeRef.current) * 0.5;
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      <FrontPlane
        color="#7B1FA2"
        slopeAngle={45}
        width={9}
        height={3.5}
        position={[0, EARTH_RADIUS + 0.4, 0]}
        moveDirection={90}
        moveSpeed={0}
      />

      {/* 锋面附近大量降水云 */}
      {Array.from({ length: 35 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 3,
            EARTH_RADIUS + 1 + Math.random() * 2,
            (Math.random() - 0.5) * 5,
          ]}
        >
          <sphereGeometry args={[0.18 + Math.random() * 0.1, 8, 8]} />
          <meshBasicMaterial color="#9FA8DA" transparent opacity={0.65} />
        </mesh>
      ))}

      {/* 标注线 */}
      <mesh position={[0, EARTH_RADIUS + 2.5, 0]}>
        <boxGeometry args={[6, 0.03, 0.03]} />
        <meshBasicMaterial color="#7B1FA2" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
