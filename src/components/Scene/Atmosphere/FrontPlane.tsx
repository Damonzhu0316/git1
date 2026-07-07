import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface FrontPlaneProps {
  color: string;
  slopeAngle: number;
  width: number;
  height: number;
  position: [number, number, number];
  moveDirection?: number;
  moveSpeed?: number;
  visible?: boolean;
}

export function FrontPlane({
  color,
  slopeAngle,
  width,
  height,
  position,
  moveDirection = 0,
  moveSpeed = 0,
  visible = true,
}: FrontPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const posRef = useRef(new THREE.Vector3(...position));

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(width, height);
  }, [width, height]);

  useFrame((_, delta) => {
    if (!meshRef.current || moveSpeed === 0) return;
    const dir = new THREE.Vector3(
      Math.cos(THREE.MathUtils.degToRad(moveDirection)),
      0,
      Math.sin(THREE.MathUtils.degToRad(moveDirection))
    );
    posRef.current.add(dir.multiplyScalar(moveSpeed * delta));
    meshRef.current.position.copy(posRef.current);
  });

  if (!visible) return null;

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={position}
      rotation={[
        THREE.MathUtils.degToRad(slopeAngle),
        THREE.MathUtils.degToRad(moveDirection),
        0,
      ]}
    >
      <meshPhongMaterial
        color={color}
        transparent
        opacity={0.6}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
