import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PressureZoneConfig } from '@/types/atmosphere';

interface PressureZoneRingProps {
  config: PressureZoneConfig;
  earthRadius: number;
  seasonalShift?: number;
  visible?: boolean;
}

export function PressureZoneRing({
  config,
  earthRadius,
  seasonalShift = 0,
  visible = true,
}: PressureZoneRingProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef(0);

  const { geometry, position } = useMemo(() => {
    const latCenterRad = THREE.MathUtils.degToRad(config.latCenter + seasonalShift);
    const latSpanRad = THREE.MathUtils.degToRad(config.latSpan);

    const innerRadius = earthRadius * Math.cos(latCenterRad + latSpanRad / 2);
    const outerRadius = earthRadius * Math.cos(latCenterRad - latSpanRad / 2);
    const avgRadius = (innerRadius + outerRadius) / 2;
    const tubeRadius = Math.abs(outerRadius - innerRadius) / 2 + 0.05;

    const geo = new THREE.TorusGeometry(avgRadius, tubeRadius, 16, 100);
    const y = earthRadius * Math.sin(latCenterRad);
    const pos = new THREE.Vector3(0, y, 0);

    return { geometry: geo, position: pos };
  }, [config, earthRadius, seasonalShift]);

  useFrame((_, delta) => {
    if (!meshRef.current || !visible) return;
    pulseRef.current += delta * (config.type === 'low' ? 2 : 1);
    const pulse = 0.7 + 0.3 * Math.sin(pulseRef.current);
    const material = meshRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = pulse * 0.4;
  });

  if (!visible) return null;

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={position}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <meshBasicMaterial
        color={config.color}
        transparent
        opacity={0.4}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
