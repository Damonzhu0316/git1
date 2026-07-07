import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EARTH_RADIUS } from '@/utils/constants';
import { getEarthPosition } from '@/utils/astronomy';
import { useStore } from '@/store/useStore';

const SEGMENTS = 128;
const RING_RADIUS = EARTH_RADIUS * 1.04;

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 uSunWorldPos;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  void main() {
    vec3 sunDir = normalize(uSunWorldPos - vWorldPos);
    float dotProduct = dot(normalize(vNormal), sunDir);
    if (dotProduct > 0.0) discard;
    float alpha = 0.55 * (-dotProduct);
    alpha = clamp(alpha, 0.0, 0.55);
    gl_FragColor = vec4(0.0, 0.0, 0.133, alpha);
  }
`;

function buildHalfRing(start: number, end: number): THREE.BufferGeometry {
  const pts: THREE.Vector3[] = [];
  for (let i = start; i <= end; i++) {
    const angle = (i / SEGMENTS) * Math.PI * 2;
    pts.push(new THREE.Vector3(RING_RADIUS * Math.cos(angle), 0, RING_RADIUS * Math.sin(angle)));
  }
  const g = new THREE.BufferGeometry();
  g.setFromPoints(pts);
  return g;
}

function HalfRingLine({ geo, color }: { geo: THREE.BufferGeometry; color: string }) {
  const line = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9, depthTest: true });
    return new THREE.Line(geo, mat);
  }, [geo, color]);
  return <primitive object={line} />;
}

export default function TerminatorLine() {
  const nightRef = useRef<THREE.Mesh>(null);
  const ringGroupRef = useRef<THREE.Group>(null);
  const showTerminator = useStore((s) => s.showTerminator);

  const nightUniforms = useMemo(
    () => ({ uSunWorldPos: { value: new THREE.Vector3(0, 0, 0) } }),
    [],
  );

  const dawnGeo = useMemo(() => buildHalfRing(0, SEGMENTS / 2), []);
  const duskGeo = useMemo(() => buildHalfRing(SEGMENTS / 2, SEGMENTS), []);

  useFrame(() => {
    const state = useStore.getState();
    const earthPos = getEarthPosition(state.currentDate);
    const focused = state.focusEarth;

    let sunDir: THREE.Vector3;
    if (focused) {
      sunDir = new THREE.Vector3(-earthPos[0], -earthPos[1], -earthPos[2]).normalize();
    } else {
      sunDir = new THREE.Vector3(earthPos[0], earthPos[1], earthPos[2]).normalize();
    }

    if (nightRef.current) {
      if (focused) {
        nightRef.current.position.set(0, 0, 0);
        nightUniforms.uSunWorldPos.value.set(-earthPos[0], -earthPos[1], -earthPos[2]);
      } else {
        nightRef.current.position.set(earthPos[0], earthPos[1], earthPos[2]);
        nightUniforms.uSunWorldPos.value.set(0, 0, 0);
      }
    }

    if (ringGroupRef.current) {
      if (focused) {
        ringGroupRef.current.position.set(0, 0, 0);
      } else {
        ringGroupRef.current.position.set(earthPos[0], earthPos[1], earthPos[2]);
      }
      const quat = new THREE.Quaternion();
      quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), sunDir);
      ringGroupRef.current.quaternion.copy(quat);
    }
  });

  if (!showTerminator) return null;

  return (
    <group>
      <mesh ref={nightRef}>
        <sphereGeometry args={[EARTH_RADIUS * 1.025, 64, 64]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={nightUniforms}
          transparent
          depthWrite={false}
        />
      </mesh>

      <group ref={ringGroupRef}>
        <HalfRingLine geo={dawnGeo} color="#ffaa00" />
        <HalfRingLine geo={duskGeo} color="#8844ff" />
      </group>
    </group>
  );
}