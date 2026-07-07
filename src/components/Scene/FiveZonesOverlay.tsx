import { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { EARTH_RADIUS, EARTH_TILT } from '@/utils/constants';

const ZONE_RADIUS = EARTH_RADIUS * 1.005;

const FIVE_ZONES_VERT = /* glsl */ `
  varying vec3 vWorldNormal;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FIVE_ZONES_FRAG = /* glsl */ `
  varying vec3 vWorldNormal;

  // 纬度带边界 (sin值)
  const float TROPIC_SIN  = 0.398749;  // sin(23.5°)
  const float ARCTIC_SIN  = 0.917060;  // sin(66.5°)

  void main() {
    float y = vWorldNormal.y;
    float absY = abs(y);

    if (absY <= TROPIC_SIN) {
      // 热带 (23.5°S ~ 23.5°N) — 红/橙色
      gl_FragColor = vec4(1.0, 0.4, 0.267, 0.3);
    } else if (absY <= ARCTIC_SIN) {
      // 温带 (23.5°~66.5°) — 绿色
      gl_FragColor = vec4(0.267, 1.0, 0.533, 0.2);
    } else {
      // 寒带 (66.5°~90°) — 蓝色
      gl_FragColor = vec4(0.267, 0.533, 1.0, 0.25);
    }
  }
`;

export default function FiveZonesOverlay() {
  const show = useStore((s) => s.showFiveZones);
  if (!show) return null;

  const geo = useMemo(
    () => new THREE.SphereGeometry(ZONE_RADIUS, 64, 64),
    [],
  );

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: FIVE_ZONES_VERT,
        fragmentShader: FIVE_ZONES_FRAG,
        transparent: true,
        depthWrite: false,
        side: THREE.FrontSide,
      }),
    [],
  );

  return (
    <group rotation-x={EARTH_TILT * (Math.PI / 180)}>
      <mesh geometry={geo} material={mat} />
    </group>
  );
}