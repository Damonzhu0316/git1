import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { MOON_RADIUS, MOON_ORBIT_RADIUS } from '@/utils/constants';
import { getEarthPosition, getDayOfYear } from '@/utils/astronomy';
import { useStore } from '@/store/useStore';

const MOON_ORBIT_PERIOD = 27.3;
const MOON_TEXTURE = '/textures/moon_1024.jpg';

function MoonMesh() {
  const texture = useTexture(MOON_TEXTURE);
  texture.colorSpace = THREE.SRGBColorSpace;
  const [hovered, setHovered] = useState(false);

  return (
    <mesh
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <sphereGeometry args={[MOON_RADIUS, 32, 32]} />
      <meshStandardMaterial
        map={texture}
        roughness={hovered ? 0.5 : 0.8}
        metalness={hovered ? 0.1 : 0}
      />
    </mesh>
  );
}

export default function Moon() {
  const moonGroupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!moonGroupRef.current) return;
    const state = useStore.getState();
    const date = state.currentDate;
    const earthPos = getEarthPosition(date);
    const focused = state.focusEarth;
    const dayOfYear = getDayOfYear(date);
    const moonAngle = (dayOfYear / MOON_ORBIT_PERIOD) * Math.PI * 2;

    if (focused) {
      moonGroupRef.current.position.set(
        MOON_ORBIT_RADIUS * Math.cos(moonAngle),
        MOON_ORBIT_RADIUS * 0.2 * Math.sin(moonAngle * 0.5),
        MOON_ORBIT_RADIUS * Math.sin(moonAngle),
      );
    } else {
      moonGroupRef.current.position.set(
        earthPos[0] + MOON_ORBIT_RADIUS * Math.cos(moonAngle),
        earthPos[1] + MOON_ORBIT_RADIUS * 0.2 * Math.sin(moonAngle * 0.5),
        earthPos[2] + MOON_ORBIT_RADIUS * Math.sin(moonAngle),
      );
    }
  });

  return (
    <group ref={moonGroupRef}>
      <MoonMesh />
    </group>
  );
}