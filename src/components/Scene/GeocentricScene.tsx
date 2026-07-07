import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import type { CameraPreset } from '@/types';
import { SUN_RADIUS, EARTH_RADIUS, MOON_RADIUS, MOON_ORBIT_RADIUS, EARTH_TILT } from '@/utils/constants';
import { getEarthPosition, getDayOfYear } from '@/utils/astronomy';
import Starfield from './Starfield';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingFallback from './LoadingFallback';
import GeoOverlays from './GeoOverlays';
import TimezoneOverlay from './TimezoneOverlay';
import CoriolisDemo from './CoriolisDemo';
import FiveZonesOverlay from './FiveZonesOverlay';
import MoonPhaseDemo from './MoonPhaseDemo';
import FlightTimeDemo from './FlightTimeDemo';
import LocalTimeHighlight from './LocalTimeHighlight';
import TimeManager from './TimeManager';
import { CelestialBody, SunInfo, EarthInfo, MoonInfo } from './CelestialBodyLabel';

/* ========== 地球自转包裹组 —— 所有地球表面覆盖层统一在此旋转 ========== */
const TILT_RAD = EARTH_TILT * (Math.PI / 180);

function EarthRotationGroup({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    const date = useStore.getState().currentDate;
    const doy = getDayOfYear(date);
    const tod = (date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600) / 24;
    ref.current.rotation.set(TILT_RAD, (doy + tod) * Math.PI * 2, 0, 'YXZ');
  });
  return <group ref={ref}>{children}</group>;
}

/** 获取地球自转的逆四元数，用于将世界空间方向转为地球本地空间 */
function useEarthInvQuat(): THREE.Quaternion {
  const date = useStore((s) => s.currentDate);
  return useMemo(() => {
    const doy = getDayOfYear(date);
    const tod = (date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600) / 24;
    const euler = new THREE.Euler(TILT_RAD, (doy + tod) * Math.PI * 2, 0, 'YXZ');
    return new THREE.Quaternion().setFromEuler(euler).invert();
  }, [date]);
}

/* ========== 太阳（地心模式下绕地球转，弱化为光源） ========== */
function GeoSun() {
  const ref = useRef<THREE.Group>(null);
  const rayRef = useRef<THREE.Line>(null);
  const rayGeoRef = useRef<THREE.BufferGeometry>(new THREE.BufferGeometry());
  const sunInfo = SunInfo();

  const rayLine = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({ color: '#ffdd44', transparent: true, opacity: 0.35, depthWrite: false });
    return new THREE.Line(new THREE.BufferGeometry(), mat);
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const [ex, ey, ez] = getEarthPosition(useStore.getState().currentDate);
    ref.current.position.set(-ex, -ey, -ez);
    // 更新太阳光线方向指示
    if (rayRef.current) {
      const sunPos = new THREE.Vector3(-ex, -ey, -ez);
      const dist = sunPos.length();
      const dir = sunPos.normalize();
      const start = dir.clone().multiplyScalar(dist * 0.15);
      const end = dir.clone().multiplyScalar(dist * 0.85);
      rayGeoRef.current.setFromPoints([start, end]);
      rayRef.current.geometry = rayGeoRef.current;
    }
  });
  return (
    <group ref={ref}>
      <CelestialBody name="太阳" color="#ffcc00" radius={SUN_RADIUS} getInfo={sunInfo}>
        <mesh>
          <sphereGeometry args={[SUN_RADIUS, 64, 64]} />
          <meshBasicMaterial color="#ffcc00" transparent opacity={0.7} />
        </mesh>
      </CelestialBody>
      <pointLight intensity={250} color="#ffffff" decay={0} />
      <mesh>
        <sphereGeometry args={[SUN_RADIUS * 1.3, 32, 32]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.08} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[SUN_RADIUS * 1.1, 32, 32]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.15} depthWrite={false} />
      </mesh>
      <primitive ref={rayRef} object={rayLine} />
    </group>
  );
}

/* ========== 地球（固定中心，自转） ========== */
const EARTH_TEX = '/textures/earth_atmos_2048.jpg';

function GeoEarthMesh() {
  const tex = useTexture(EARTH_TEX);
  tex.colorSpace = THREE.SRGBColorSpace;
  return (
    <mesh>
      <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      <meshPhongMaterial map={tex} specular={0x444444} shininess={25} />
    </mesh>
  );
}

function GeoEarth() {
  const rotRef = useRef<THREE.Group>(null);
  const DAY_MS = 86400000;
  const earthInfo = EarthInfo();

  useFrame((_, delta) => {
    if (!rotRef.current) return;
    const state = useStore.getState();
    if (state.isPlaying) {
      useStore.getState().setDate(new Date(state.currentDate.getTime() + state.timeSpeed * delta * DAY_MS));
    }
    const date = useStore.getState().currentDate;
    const doy = getDayOfYear(date);
    const tod = (date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600) / 24;
    rotRef.current.rotation.y = (doy + tod) * Math.PI * 2;
  });

  return (
    <group>
      <group ref={rotRef} rotation-x={EARTH_TILT * (Math.PI / 180)}>
        <CelestialBody name="地球" color="#4488ff" radius={EARTH_RADIUS} getInfo={earthInfo}>
          <GeoEarthMesh />
        </CelestialBody>
      </group>
    </group>
  );
}

/* ========== 月球 ========== */
const MOON_TEX = '/textures/moon_1024.jpg';

function GeoMoonMesh() {
  const tex = useTexture(MOON_TEX);
  tex.colorSpace = THREE.SRGBColorSpace;
  return (
    <mesh>
      <sphereGeometry args={[MOON_RADIUS, 32, 32]} />
      <meshStandardMaterial map={tex} roughness={0.8} />
    </mesh>
  );
}

function GeoMoon() {
  const ref = useRef<THREE.Group>(null);
  const moonInfo = MoonInfo();
  useFrame(() => {
    if (!ref.current) return;
    const date = useStore.getState().currentDate;
    const angle = (getDayOfYear(date) / 27.3) * Math.PI * 2;
    ref.current.position.set(
      MOON_ORBIT_RADIUS * Math.cos(angle),
      MOON_ORBIT_RADIUS * 0.2 * Math.sin(angle * 0.5),
      MOON_ORBIT_RADIUS * Math.sin(angle),
    );
  });
  return <group ref={ref}>
    <CelestialBody name="月球" color="#cccccc" radius={MOON_RADIUS} getInfo={moonInfo}>
      <GeoMoonMesh />
    </CelestialBody>
  </group>;
}

/* ========== 大气层 ========== */
function GeoAtmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[EARTH_RADIUS * 1.075, 64, 64]} />
      <meshBasicMaterial color="#4488ff" transparent opacity={0.08} depthWrite={false} />
    </mesh>
  );
}

/* ========== 晨昏线 ========== */
const TERM_VERT = `
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const TERM_FRAG = `
  uniform vec3 uSunWorldPos;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  void main() {
    vec3 sunDir = normalize(uSunWorldPos - vWorldPos);
    float dotProduct = dot(normalize(vNormal), sunDir);
    if (dotProduct > 0.0) discard;
    float alpha = 0.85 * (-dotProduct);
    alpha = clamp(alpha, 0.0, 0.75);
    gl_FragColor = vec4(0.0, 0.0, 0.1, alpha);
  }
`;

function buildHalfRingGeo(start: number, end: number, segments: number): THREE.BufferGeometry {
  const R = EARTH_RADIUS * 1.04;
  const pts: THREE.Vector3[] = [];
  for (let i = start; i <= end; i++) {
    const ang = (i / segments) * Math.PI * 2;
    pts.push(new THREE.Vector3(R * Math.cos(ang), 0, R * Math.sin(ang)));
  }
  return new THREE.BufferGeometry().setFromPoints(pts);
}

function GeoTerminator() {
  const nightRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);
  const show = useStore((s) => s.showTerminator);
  const invQuat = useEarthInvQuat();

  const uniforms = useMemo(() => ({ uSunWorldPos: { value: new THREE.Vector3() } }), []);
  const dawnGeo = useMemo(() => buildHalfRingGeo(0, 64, 128), []);
  const duskGeo = useMemo(() => buildHalfRingGeo(64, 128, 128), []);
  const dawnLine = useMemo(() => new THREE.Line(dawnGeo, new THREE.LineBasicMaterial({ color: '#ffaa00', transparent: true, opacity: 0.9 })), [dawnGeo]);
  const duskLine = useMemo(() => new THREE.Line(duskGeo, new THREE.LineBasicMaterial({ color: '#8844ff', transparent: true, opacity: 0.9 })), [duskGeo]);

  useFrame(() => {
    const [ex, ey, ez] = getEarthPosition(useStore.getState().currentDate);
    const worldSunDir = new THREE.Vector3(-ex, -ey, -ez).normalize();
    if (nightRef.current) uniforms.uSunWorldPos.value.set(-ex, -ey, -ez);
    if (ringRef.current) {
      // 将世界空间太阳方向转为地球本地空间
      const localSunDir = worldSunDir.clone().applyQuaternion(invQuat);
      ringRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), localSunDir);
    }
  });

  if (!show) return null;
  return (
    <group>
      <mesh ref={nightRef}>
        <sphereGeometry args={[EARTH_RADIUS * 1.025, 64, 64]} />
        <shaderMaterial vertexShader={TERM_VERT} fragmentShader={TERM_FRAG} uniforms={uniforms} transparent depthWrite={false} />
      </mesh>
      <group ref={ringRef}>
        <primitive object={dawnLine} />
        <primitive object={duskLine} />
      </group>
    </group>
  );
}

/* ========== 赤道面（在地球自转组内，无需额外旋转） ========== */
function GeoEquatorPlane() {
  const show = useStore((s) => s.showEquatorPlane);
  if (!show) return null;
  return (
    <mesh rotation-x={-Math.PI / 2}>
      <ringGeometry args={[EARTH_RADIUS * 1.5, EARTH_RADIUS * 1.7, 128]} />
      <meshBasicMaterial color="#ff4444" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

/* ========== 经纬网 ========== */
const KEY_LATITUDES = [
  { lat: 0, label: '赤道 0°', color: '#ff4444', lineWidth: 1.5 },
  { lat: 23.5, label: '北回归线 23.5°N', color: '#ffaa00', lineWidth: 1.2 },
  { lat: -23.5, label: '南回归线 23.5°S', color: '#ffaa00', lineWidth: 1.2 },
  { lat: 66.5, label: '北极圈 66.5°N', color: '#44aaff', lineWidth: 1.2 },
  { lat: -66.5, label: '南极圈 66.5°S', color: '#44aaff', lineWidth: 1.2 },
];

function makeLatLabel(text: string, color: string, lat: number): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 48;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 24);
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  const r = EARTH_RADIUS * 1.2;
  const latRad = (lat * Math.PI) / 180;
  sprite.position.set(r * Math.cos(latRad), r * Math.sin(latRad), 0);
  sprite.scale.set(3, 0.55, 1);
  return sprite;
}

function GeoGridLines() {
  const show = useStore((s) => s.showGridLines);

  // 纬度线（15°步长，关键纬度特殊颜色）
  const latLines = useMemo(() => {
    const lines: { obj: THREE.Line; color: string; opacity: number }[] = [];
    const keyLats = KEY_LATITUDES.map((k) => k.lat);
    for (let lat = -75; lat <= 75; lat += 15) {
      const r = EARTH_RADIUS * 1.01 * Math.cos((lat * Math.PI) / 180);
      const y = EARTH_RADIUS * 1.01 * Math.sin((lat * Math.PI) / 180);
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 128; i++) {
        const theta = (i / 128) * Math.PI * 2;
        pts.push(new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)));
      }
      const isKey = keyLats.includes(lat);
      const keyInfo = KEY_LATITUDES.find((k) => k.lat === lat);
      const color = isKey && keyInfo ? keyInfo.color : '#44ff88';
      const opacity = isKey ? 0.6 : 0.3;
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
      lines.push({ obj: new THREE.Line(geo, mat), color, opacity });
    }
    return lines;
  }, []);

  // 经度线（30°步长，0°和180°特殊颜色）
  const lonLines = useMemo(() => {
    const lines: { obj: THREE.Line; color: string; opacity: number }[] = [];
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
      const isKey = lon === 0 || lon === 180;
      const color = lon === 0 ? '#ff4444' : lon === 180 ? '#ffaa00' : '#44ff88';
      const opacity = isKey ? 0.55 : 0.25;
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
      lines.push({ obj: new THREE.Line(geo, mat), color, opacity });
    }
    return lines;
  }, []);

  // 关键纬度标签
  const latLabels = useMemo(() => {
    return KEY_LATITUDES.map((k) => makeLatLabel(k.label, k.color, k.lat));
  }, []);

  if (!show) return null;

  return (
    <group>
      {latLines.map(({ obj }, i) => <primitive key={`lat-${i}`} object={obj} />)}
      {lonLines.map(({ obj }, i) => <primitive key={`lon-${i}`} object={obj} />)}
      {latLabels.map((sprite, i) => <primitive key={`lat-label-${i}`} object={sprite} />)}
    </group>
  );
}

/* ========== 月球轨道 ========== */
function GeoMoonOrbit() {
  const pts = useMemo(() => {
    const p: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const ang = (i / 128) * Math.PI * 2;
      p.push(new THREE.Vector3(MOON_ORBIT_RADIUS * Math.cos(ang), 0, MOON_ORBIT_RADIUS * Math.sin(ang)));
    }
    const g = new THREE.BufferGeometry().setFromPoints(p);
    return new THREE.Line(g, new THREE.LineBasicMaterial({ color: '#445566', transparent: true, opacity: 0.35, depthWrite: false }));
  }, []);
  return <primitive object={pts} />;
}

/* ========== 相机控制器 ========== */
const GEO_PRESETS: Record<Exclude<CameraPreset, 'surface'>, { pos: [number, number, number]; target: [number, number, number] }> = {
  free: { pos: [0, 8, 18], target: [0, 0, 0] },
  top: { pos: [0, 8, 0.1], target: [0, 0, 0] },
  side: { pos: [0, 0, 10], target: [0, 0, 0] },
  northPole: { pos: [0, 4, 0.1], target: [0, 0, 0] },
  equator: { pos: [8, 0, 0], target: [0, 0, 0] },
};

function GeoCameraController() {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const prev = useRef<CameraPreset>('free');

  useFrame(() => {
    const preset = useStore.getState().cameraPreset;
    if (preset === 'surface') return;
    if (preset !== prev.current) {
      prev.current = preset;
      const cfg = GEO_PRESETS[preset];
      camera.position.set(...cfg.pos);
      if (controlsRef.current) {
        controlsRef.current.target.set(...cfg.target);
        controlsRef.current.update();
      }
    }
  });

  return <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.1} makeDefault />;
}

/* ========== 场景内容 ========== */
function GeoContent() {
  return (
    <>
      <Starfield />
      <GeoSun />
      <GeoEarth />
      <GeoAtmosphere />
      {/* 所有地球表面覆盖层统一放入自转组，与地球同步旋转 */}
      <EarthRotationGroup>
        <GeoTerminator />
        <GeoEquatorPlane />
        <GeoGridLines />
        <GeoOverlays />
        <TimezoneOverlay />
        <FiveZonesOverlay />
        <LocalTimeHighlight />
      </EarthRotationGroup>
      <GeoMoon />
      <GeoMoonOrbit />
      <CoriolisDemo />
      <MoonPhaseDemo />
      <TimeManager />
      <FlightTimeDemo />
      <ambientLight intensity={0.08} />
      <GeoCameraController />
    </>
  );
}

/* ========== 导出 ========== */
export default function GeocentricScene() {
  return (
    <Canvas
      camera={{ position: [0, 8, 18], fov: 45 }}
      gl={{ antialias: true, alpha: false }}
      style={{ width: '100%', height: '100%', background: '#0a0e27' }}
    >
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <GeoContent />
        </Suspense>
      </ErrorBoundary>
    </Canvas>
  );
}