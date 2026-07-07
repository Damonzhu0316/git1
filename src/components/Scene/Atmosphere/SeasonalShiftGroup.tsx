import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { getSeasonalShift } from '@/data/atmosphere/pressureWindData';

interface SeasonalShiftGroupProps {
  children: React.ReactNode;
  earthRadius: number;
}

export function SeasonalShiftGroup({ children, earthRadius }: SeasonalShiftGroupProps) {
  const groupRef = useRef<THREE.Group>(null);
  const month = useStore((s) => s.month);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const shiftLat = getSeasonalShift(month);
    const shiftRad = THREE.MathUtils.degToRad(shiftLat);

    const targetY = earthRadius * Math.sin(shiftRad);
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      delta * 2
    );
  });

  return <group ref={groupRef}>{children}</group>;
}
