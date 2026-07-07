import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { WindBeltConfig } from '@/types/atmosphere';

interface WindBeltParticlesProps {
  config: WindBeltConfig;
  earthRadius: number;
  seasonalShift?: number;
  particleCount?: number;
  visible?: boolean;
}

export function WindBeltParticles({
  config,
  earthRadius,
  seasonalShift = 0,
  particleCount = 200,
  visible = true,
}: WindBeltParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount);

    const latStartRad = THREE.MathUtils.degToRad(config.latStart + seasonalShift);
    const latEndRad = THREE.MathUtils.degToRad(config.latEnd + seasonalShift);
    const avgLat = (latStartRad + latEndRad) / 2;

    for (let i = 0; i < particleCount; i++) {
      const lon = Math.random() * Math.PI * 2;
      const lat = latStartRad + Math.random() * (latEndRad - latStartRad);
      const height = earthRadius + 0.3 + Math.random() * 0.2;

      pos[i * 3] = height * Math.cos(lat) * Math.cos(lon);
      pos[i * 3 + 1] = height * Math.sin(lat);
      pos[i * 3 + 2] = height * Math.cos(lat) * Math.sin(lon);

      const isNorth = avgLat >= 0;
      const isEastward = config.direction.includes('east');
      vel[i] = (isEastward ? 1 : -1) * (0.2 + Math.random() * 0.3) * (isNorth ? 1 : -1);
    }

    return { positions: pos, velocities: vel };
  }, [config, earthRadius, seasonalShift, particleCount]);

  useFrame((_, delta) => {
    if (!pointsRef.current || !visible) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const posArray = posAttr.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const x = posArray[i * 3];
      const z = posArray[i * 3 + 2];

      const currentLon = Math.atan2(z, x);
      const newLon = currentLon + velocities[i] * delta * 0.5;
      const radius = Math.sqrt(x * x + z * z);

      posArray[i * 3] = radius * Math.cos(newLon);
      posArray[i * 3 + 2] = radius * Math.sin(newLon);
    }

    posAttr.needsUpdate = true;
  });

  if (!visible) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={config.color}
        size={0.15}
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
