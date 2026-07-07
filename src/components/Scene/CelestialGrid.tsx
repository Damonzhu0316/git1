import { forwardRef, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EARTH_RADIUS, EARTH_TILT } from '@/utils/constants';
import { getEarthPosition } from '@/utils/astronomy';
import { useStore } from '@/store/useStore';

export default function CelestialGrid() {
  const showEquatorPlane = useStore((s) => s.showEquatorPlane);
  const showEclipticPlane = useStore((s) => s.showEclipticPlane);
  const showGridLines = useStore((s) => s.showGridLines);
  const showSunRay = useStore((s) => s.showSunRay);

  const earthGroupRef = useRef<THREE.Group>(null);
  const equatorGroupRef = useRef<THREE.Group>(null);
  const sunRayRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const state = useStore.getState();
    const earthPos = getEarthPosition(state.currentDate);
    const target = state.focusEarth ? [0, 0, 0] : [earthPos[0], earthPos[1], earthPos[2]] as const;

    if (earthGroupRef.current) {
      earthGroupRef.current.position.set(target[0], target[1], target[2]);
    }
    if (equatorGroupRef.current) {
      equatorGroupRef.current.position.set(target[0], target[1], target[2]);
    }
    if (sunRayRef.current) {
      if (state.focusEarth) {
        sunRayRef.current.position.set(0, 0, 0);
        sunRayRef.current.lookAt(-earthPos[0], -earthPos[1], -earthPos[2]);
      } else {
        sunRayRef.current.position.set(0, 0, 0);
        sunRayRef.current.lookAt(earthPos[0], earthPos[1], earthPos[2]);
      }
    }
  });

  return (
    <group>
      {/* 赤道面 */}
      {showEquatorPlane && (
        <group ref={equatorGroupRef} rotation-x={EARTH_TILT * (Math.PI / 180)}>
          <mesh rotation-x={-Math.PI / 2}>
            <ringGeometry args={[EARTH_RADIUS * 1.5, EARTH_RADIUS * 1.7, 128]} />
            <meshBasicMaterial color="#ff4444" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        </group>
      )}

      {/* 黄道面 */}
      {showEclipticPlane && (
        <mesh rotation-x={-Math.PI / 2}>
          <ringGeometry args={[13.5, 14, 128]} />
          <meshBasicMaterial color="#44aaff" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}

      {/* 经纬网 */}
      {showGridLines && <GridLinesGroup ref={earthGroupRef} />}

      {/* 太阳光线 */}
      {showSunRay && (
        <group ref={sunRayRef}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 50, 8]} />
            <meshBasicMaterial color="#ffdd44" transparent opacity={0.5} depthWrite={false} />
          </mesh>
        </group>
      )}
    </group>
  );
}

const GridLinesGroup = forwardRef<THREE.Group>((_props, ref) => {
  const latLines = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    for (let lat = -75; lat <= 75; lat += 30) {
      const r = EARTH_RADIUS * 1.01 * Math.cos((lat * Math.PI) / 180);
      const y = EARTH_RADIUS * 1.01 * Math.sin((lat * Math.PI) / 180);
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 128; i++) {
        const theta = (i / 128) * Math.PI * 2;
        pts.push(new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)));
      }
      lines.push(pts);
    }
    return lines;
  }, []);

  const lonLines = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    for (let lon = 0; lon < 360; lon += 30) {
      const theta = (lon * Math.PI) / 180;
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 128; i++) {
        const phi = (i / 128) * Math.PI;
        pts.push(new THREE.Vector3(
          EARTH_RADIUS * 1.01 * Math.sin(phi) * Math.cos(theta),
          EARTH_RADIUS * 1.01 * Math.cos(phi),
          EARTH_RADIUS * 1.01 * Math.sin(phi) * Math.sin(theta),
        ));
      }
      lines.push(pts);
    }
    return lines;
  }, []);

  const gridMaterial = useMemo(() => new THREE.LineBasicMaterial({
    color: '#44ff88', transparent: true, opacity: 0.4, depthWrite: false,
  }), []);

  return (
    <group ref={ref}>
      {latLines.map((pts, i) => (
        <line key={`lat-${i}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(pts.flatMap(v => [v.x, v.y, v.z])), 3]}
              count={pts.length}
              itemSize={3}
            />
          </bufferGeometry>
          <primitive object={gridMaterial} attach="material" />
        </line>
      ))}
      {lonLines.map((pts, i) => (
        <line key={`lon-${i}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(pts.flatMap(v => [v.x, v.y, v.z])), 3]}
              count={pts.length}
              itemSize={3}
            />
          </bufferGeometry>
          <primitive object={gridMaterial} attach="material" />
        </line>
      ))}
    </group>
  );
});