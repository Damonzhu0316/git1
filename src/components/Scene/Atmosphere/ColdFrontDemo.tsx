import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FrontPlane } from './FrontPlane';

const EARTH_RADIUS = 5;

export function ColdFrontDemo({ visible = true }: { visible?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current || !visible) return;
    timeRef.current += delta * 0.3;
    groupRef.current.position.x = Math.sin(timeRef.current) * 2;
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      <FrontPlane
        color="#1E88E5"
        slopeAngle={60}
        width={8}
        height={4}
        position={[0, EARTH_RADIUS + 0.5, 0]}
        moveDirection={90}
        moveSpeed={0}
      />

      {Array.from({ length: 20 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            -0.5 - Math.random() * 2,
            EARTH_RADIUS + 1.2 + Math.random() * 1.5,
            (Math.random() - 0.5) * 4,
          ]}
        >
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color="#90A4AE" transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}
