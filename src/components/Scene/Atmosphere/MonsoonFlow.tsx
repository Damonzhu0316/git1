import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MONSOON_FLOWS } from '@/data/atmosphere/monsoonData';

interface MonsoonFlowProps {
  season: 'summer' | 'winter';
  visible?: boolean;
}

const EARTH_RADIUS = 5;

export function MonsoonFlowDemo({ season, visible = true }: MonsoonFlowProps) {
  const particlesRef = useRef<THREE.Points>(null);

  const flows = useMemo(() => {
    return MONSOON_FLOWS.filter((f) => f.season === season);
  }, [season]);

  const { positions, curves } = useMemo(() => {
    const allPos: number[] = [];
    const allCurves: THREE.CatmullRomCurve3[] = [];

    flows.forEach((flow) => {
      const points = flow.path.map(([lat, lon]) => {
        const latRad = THREE.MathUtils.degToRad(lat);
        const lonRad = THREE.MathUtils.degToRad(lon);
        const r = EARTH_RADIUS + 0.5;
        return new THREE.Vector3(
          r * Math.cos(latRad) * Math.cos(lonRad),
          r * Math.sin(latRad),
          r * Math.cos(latRad) * Math.sin(lonRad)
        );
      });

      const curve = new THREE.CatmullRomCurve3(points);
      allCurves.push(curve);

      for (let i = 0; i < 30; i++) {
        const t = i / 30;
        const pt = curve.getPoint(t);
        allPos.push(pt.x, pt.y, pt.z);
      }
    });

    return {
      positions: new Float32Array(allPos),
      curves: allCurves,
    };
  }, [flows]);

  useFrame((_, delta) => {
    if (!particlesRef.current || !visible) return;
    const posAttr = particlesRef.current.geometry.attributes.position;
    const posArray = posAttr.array as Float32Array;

    let idx = 0;
    curves.forEach((curve) => {
      for (let i = 0; i < 30; i++) {
        let t = (i / 30 + delta * 0.1) % 1;
        const pt = curve.getPoint(t);
        posArray[idx++] = pt.x;
        posArray[idx++] = pt.y;
        posArray[idx++] = pt.z;
      }
    });

    posAttr.needsUpdate = true;
  });

  if (!visible) return null;

  return (
    <group>
      {curves.map((curve, i) => (
        <mesh key={i}>
          <tubeGeometry args={[curve, 64, 0.08, 8, false]} />
          <meshBasicMaterial
            color={season === 'summer' ? '#4CAF50' : '#2196F3'}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}

      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={season === 'summer' ? '#81C784' : '#64B5F6'}
          size={0.15}
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
