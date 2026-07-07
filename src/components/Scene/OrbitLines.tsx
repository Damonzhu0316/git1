import { useMemo, useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { EARTH_ORBIT_RADIUS, MOON_ORBIT_RADIUS, ORBIT_ECCENTRICITY } from '@/utils/constants';
import { getEarthPosition } from '@/utils/astronomy';
import { useStore } from '@/store/useStore';

extend({ Line_: THREE.Line });

const SEGMENTS = 256;

function OrbitRing({ points }: { points: THREE.Vector3[] }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setFromPoints(points);
    return g;
  }, [points]);
  const mat = useMemo(() => new THREE.LineBasicMaterial({
    color: '#334466',
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  }), []);
  const line = useMemo(() => new THREE.Line(geo, mat), [geo, mat]);

  return <primitive object={line} />;
}

export default function OrbitLines() {
  const moonOrbitRef = useRef<THREE.Group>(null);
  const focusEarth = useStore((s) => s.focusEarth);

  const earthOrbitPoints = useMemo(() => {
    const a = EARTH_ORBIT_RADIUS;
    const b = a * Math.sqrt(1 - ORBIT_ECCENTRICITY * ORBIT_ECCENTRICITY);
    const c = a * ORBIT_ECCENTRICITY; // 太阳在右焦点(原点)，椭圆中心偏移
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      const angle = (i / SEGMENTS) * Math.PI * 2;
      pts.push(new THREE.Vector3(a * Math.cos(angle) - c, 0, b * Math.sin(angle)));
    }
    return pts;
  }, []);

  const moonOrbitPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      const angle = (i / SEGMENTS) * Math.PI * 2;
      pts.push(new THREE.Vector3(
        MOON_ORBIT_RADIUS * Math.cos(angle),
        0,
        MOON_ORBIT_RADIUS * Math.sin(angle),
      ));
    }
    return pts;
  }, []);

  useFrame(() => {
    if (!moonOrbitRef.current) return;
    const state = useStore.getState();
    if (state.focusEarth) {
      moonOrbitRef.current.position.set(0, 0, 0);
    } else {
      const earthPos = getEarthPosition(state.currentDate);
      moonOrbitRef.current.position.set(earthPos[0], earthPos[1], earthPos[2]);
    }
  });

  return (
    <group>
      <OrbitRing points={earthOrbitPoints} />

      {/* 月球轨道 */}
      <group ref={moonOrbitRef}>
        <OrbitRing points={moonOrbitPoints} />
      </group>
    </group>
  );
}