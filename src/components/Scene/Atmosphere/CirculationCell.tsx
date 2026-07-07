import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CirculationCellConfig } from '@/types/atmosphere';

interface CirculationCellProps {
  config: CirculationCellConfig;
  earthRadius: number;
  seasonalShift?: number;
  visible?: boolean;
}

export function CirculationCell({
  config,
  earthRadius,
  seasonalShift = 0,
  visible = true,
}: CirculationCellProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const tubeRef = useRef<THREE.Mesh>(null);

  const { curve, tubeGeometry, particlePositions, particleSpeeds } = useMemo(() => {
    const r = earthRadius;
    const shift = THREE.MathUtils.degToRad(seasonalShift);

    const ascLat = THREE.MathUtils.degToRad(config.ascentLat) + shift;
    const descLat = THREE.MathUtils.degToRad(config.descentLat) + shift;

    const points: THREE.Vector3[] = [];

    const descY = r * Math.sin(descLat);
    const descR = r * Math.cos(descLat);
    points.push(new THREE.Vector3(descR, descY, 0));

    const surfaceEndLat = ascLat;
    const surfaceY = r * Math.sin(surfaceEndLat);
    const surfaceR = r * Math.cos(surfaceEndLat);
    points.push(new THREE.Vector3(surfaceR * 0.8, surfaceY, 0));

    const topY = surfaceY + r * 0.4;
    points.push(new THREE.Vector3(surfaceR * 0.6, topY, 0));

    const topDescY = descY + r * 0.4;
    points.push(new THREE.Vector3(descR * 0.6, topDescY, 0));

    points.push(new THREE.Vector3(descR, descY, 0));

    const crv = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(crv, 64, 0.25, 8, false);

    const pCount = 50;
    const pPos = new Float32Array(pCount * 3);
    const pSpeeds = new Float32Array(pCount);

    for (let i = 0; i < pCount; i++) {
      const t = i / pCount;
      const pt = crv.getPoint(t);
      pPos[i * 3] = pt.x;
      pPos[i * 3 + 1] = pt.y;
      pPos[i * 3 + 2] = pt.z;
      pSpeeds[i] = t;
    }

    return {
      curve: crv,
      tubeGeometry: tubeGeo,
      particlePositions: pPos,
      particleSpeeds: pSpeeds,
    };
  }, [config, earthRadius, seasonalShift]);

  useFrame((_, delta) => {
    if (!particlesRef.current || !visible) return;
    const posAttr = particlesRef.current.geometry.attributes.position;
    const posArray = posAttr.array as Float32Array;

    for (let i = 0; i < particleSpeeds.length; i++) {
      particleSpeeds[i] += delta * 0.15;
      if (particleSpeeds[i] > 1) particleSpeeds[i] = 0;

      const pt = curve.getPoint(particleSpeeds[i]);
      posArray[i * 3] = pt.x + (Math.random() - 0.5) * 0.2;
      posArray[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.2;
      posArray[i * 3 + 2] = pt.z + (Math.random() - 0.5) * 0.2;
    }

    posAttr.needsUpdate = true;
  });

  useFrame((state) => {
    if (!tubeRef.current || !visible) return;
    const mat = tubeRef.current.material as THREE.MeshPhongMaterial;
    mat.opacity = 0.3 + 0.1 * Math.sin(state.clock.elapsedTime);
  });

  if (!visible) return null;

  const tubeColor = config.type === 'hadley' ? '#FF6B35' : config.type === 'ferrel' ? '#AB47BC' : '#26C6DA';

  return (
    <group>
      <mesh ref={tubeRef} geometry={tubeGeometry}>
        <meshPhongMaterial
          color={tubeColor}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={tubeColor}
          size={0.2}
          transparent
          opacity={0.9}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  );
}
