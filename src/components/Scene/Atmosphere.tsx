import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EARTH_RADIUS } from '@/utils/constants';
import { getEarthPosition } from '@/utils/astronomy';
import { useStore } from '@/store/useStore';

export default function Atmosphere() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!ref.current) return;
    const state = useStore.getState();
    const earthPos = getEarthPosition(state.currentDate);
    if (state.focusEarth) {
      ref.current.position.set(0, 0, 0);
    } else {
      ref.current.position.set(earthPos[0], earthPos[1], earthPos[2]);
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[EARTH_RADIUS * 1.075, 64, 64]} />
      <meshBasicMaterial color="#4488ff" transparent opacity={0.08} depthWrite={false} />
    </mesh>
  );
}