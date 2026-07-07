import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FrontPlane } from './FrontPlane';

const EARTH_RADIUS = 5;

export function WarmFrontDemo({ visible = true }: { visible?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current || !visible) return;
    timeRef.current += delta * 0.2;
    groupRef.current.position.x = Math.sin(timeRef.current) * 1.5;
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      <FrontPlane
        color="#E53935"
        slopeAngle={30}
        width={10}
        height={3}
        position={[0, EARTH_RADIUS + 0.3, 0]}
        moveDirection={90}
        moveSpeed={0}
      />

      {Array.from({ length: 30 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            0.5 + Math.random() * 4,
            EARTH_RADIUS + 1 + Math.random() * 2,
            (Math.random() - 0.5) * 6,
          ]}
        >
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial color="#B0BEC5" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}
