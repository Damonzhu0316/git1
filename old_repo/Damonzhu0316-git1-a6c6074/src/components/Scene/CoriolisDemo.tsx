import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { EARTH_RADIUS, EARTH_TILT } from '@/utils/constants';

const PARTICLE_COUNT = 12;
const SPEED = 0.22; // 纬度变化速度 (弧度/秒)
const CORIOLIS_STRENGTH = 2.0; // 科里奥利力视觉强度
const TRAIL_OPACITY = 0.55;
const SURFACE_OFFSET = 1.015;

/* ========== 轨迹线（静态） ========== */
function TrajectoryLines({
  targetLat,
  coriolisSign,
  color,
}: {
  targetLat: number;
  coriolisSign: number;
  color: string;
}) {
  const lineCount = 8;
  const steps = 200;

  const mat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: TRAIL_OPACITY,
        depthWrite: false,
      }),
    [color],
  );

  const lines = useMemo(() => {
    const result: THREE.Line[] = [];
    const R = EARTH_RADIUS * SURFACE_OFFSET;
    const dLat = targetLat / steps;

    for (let i = 0; i < lineCount; i++) {
      const startLon = (i / lineCount) * Math.PI * 2;
      const pts: THREE.Vector3[] = [];
      let lat = 0;
      let lon = startLon;

      for (let j = 0; j <= steps; j++) {
        lat = (j / steps) * targetLat;
        // 科里奥利力导致的经度偏移：正比于 sin(|lat|) * dLat
        const absLat = Math.abs(lat);
        lon += coriolisSign * CORIOLIS_STRENGTH * Math.sin(absLat) * Math.abs(dLat);

        const cosLat = Math.cos(lat);
        pts.push(
          new THREE.Vector3(
            R * cosLat * Math.cos(lon),
            R * Math.sin(lat),
            R * cosLat * Math.sin(lon),
          ),
        );
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      result.push(new THREE.Line(geo, mat));
    }
    return result;
  }, [targetLat, coriolisSign, mat]);

  return (
    <group>
      {lines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </group>
  );
}

/* ========== 运动粒子（单个纬度带） ========== */
interface ParticleData {
  lat: number;
  lon: number;
}

function CoriolisParticles({
  color,
  targetLat,
  coriolisSign,
}: {
  color: string;
  targetLat: number;
  coriolisSign: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particlesRef = useRef<ParticleData[]>(
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      lat: 0,
      lon: (i / PARTICLE_COUNT) * Math.PI * 2,
    })),
  );

  const geo = useMemo(() => new THREE.SphereGeometry(0.045, 8, 8), []);
  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({ color, depthWrite: false }),
    [color],
  );

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const particles = particlesRef.current;
    const dir = targetLat > 0 ? 1 : -1;
    const R = EARTH_RADIUS * SURFACE_OFFSET;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];
      p.lat += dir * SPEED * delta;

      // 科里奥利力偏移：d(lon) ∝ sin(|lat|) * speed
      const absLat = Math.abs(p.lat);
      p.lon += coriolisSign * CORIOLIS_STRENGTH * Math.sin(absLat) * SPEED * delta;

      // 到达目标纬度后重置回赤道
      if ((dir > 0 && p.lat >= targetLat) || (dir < 0 && p.lat <= targetLat)) {
        p.lat = 0;
        p.lon = (i / PARTICLE_COUNT) * Math.PI * 2;
      }

      const cosLat = Math.cos(p.lat);
      dummy.position.set(
        R * cosLat * Math.cos(p.lon),
        R * Math.sin(p.lat),
        R * cosLat * Math.sin(p.lon),
      );
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geo, mat, PARTICLE_COUNT]} />
  );
}

/* ========== 导出 ========== */
export default function CoriolisDemo() {
  const show = useStore((s) => s.showCoriolis);
  if (!show) return null;

  const degToRad = (deg: number) => (deg * Math.PI) / 180;

  return (
    <group rotation-x={EARTH_TILT * (Math.PI / 180)}>
      {/* 赤道区：绿色粒子，无偏转 */}  
      <TrajectoryLines
        targetLat={degToRad(55)}
        coriolisSign={0}
        color="#44ff44"
      />
      <CoriolisParticles
        color="#44ff44"
        targetLat={degToRad(55)}
        coriolisSign={0}
      />

      {/* 40°N 北半球：红色粒子，向右偏转 */}
      <TrajectoryLines
        targetLat={degToRad(40)}
        coriolisSign={1}
        color="#ff4444"
      />
      <CoriolisParticles
        color="#ff4444"
        targetLat={degToRad(40)}
        coriolisSign={1}
      />

      {/* 40°S 南半球：蓝色粒子，向左偏转 */}
      <TrajectoryLines
        targetLat={degToRad(-40)}
        coriolisSign={-1}
        color="#4444ff"
      />
      <CoriolisParticles
        color="#4444ff"
        targetLat={degToRad(-40)}
        coriolisSign={-1}
      />
    </group>
  );
}