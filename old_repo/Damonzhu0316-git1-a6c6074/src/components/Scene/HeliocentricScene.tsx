import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import type { CameraPreset } from '@/types';
import { SUN_RADIUS, EARTH_RADIUS, MOON_RADIUS, MOON_ORBIT_RADIUS, EARTH_ORBIT_RADIUS, EARTH_TILT, ORBIT_ECCENTRICITY } from '@/utils/constants';
import { getEarthPosition, getDayOfYear, getEquinoxSolsticeDates, getPerihelionDate, getAphelionDate } from '@/utils/astronomy';
import Starfield from './Starfield';
import OrbitSpeedIndicator from './OrbitSpeedIndicator';
import SeasonDemo from './SeasonDemo';
import EclipseDemo from './EclipseDemo';
import TimeManager from './TimeManager';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingFallback from './LoadingFallback';

const TILT_RAD = EARTH_TILT * (Math.PI / 180);

/* ========== 太阳 ========== */
function HelioSun() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[SUN_RADIUS, 64, 64]} />
        <meshBasicMaterial color="#ffcc00" />
      </mesh>
      <pointLight intensity={250} color="#ffffff" decay={0} />
      <mesh>
        <sphereGeometry args={[SUN_RADIUS * 1.6, 32, 32]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.15} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[SUN_RADIUS * 1.25, 32, 32]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.3} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ========== 地球 ========== */
const EARTH_TEX = '/textures/earth_atmos_2048.jpg';

function HelioEarthMesh() {
  const tex = useTexture(EARTH_TEX);
  tex.colorSpace = THREE.SRGBColorSpace;
  return (
    <mesh>
      <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      <meshPhongMaterial map={tex} specular={0x444444} shininess={25} />
    </mesh>
  );
}

function HelioEarth() {
  const groupRef = useRef<THREE.Group>(null);
  const rotRef = useRef<THREE.Group>(null);
  const DAY_MS = 86400000;

  useFrame((_, delta) => {
    if (!groupRef.current || !rotRef.current) return;
    const state = useStore.getState();
    if (state.isPlaying) {
      useStore.getState().setDate(new Date(state.currentDate.getTime() + state.timeSpeed * delta * DAY_MS));
    }
    const date = useStore.getState().currentDate;
    const [x, y, z] = getEarthPosition(date);
    groupRef.current.position.set(x, y, z);
    const doy = getDayOfYear(date);
    const tod = (date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600) / 24;
    rotRef.current.rotation.y = (doy + tod) * Math.PI * 2;
  });

  return (
    <group ref={groupRef}>
      <group ref={rotRef} rotation-x={TILT_RAD}>
        <HelioEarthMesh />
      </group>
    </group>
  );
}

/* ========== 月球 ========== */
const MOON_TEX = '/textures/moon_1024.jpg';

function HelioMoonMesh() {
  const tex = useTexture(MOON_TEX);
  tex.colorSpace = THREE.SRGBColorSpace;
  return (
    <mesh>
      <sphereGeometry args={[MOON_RADIUS, 32, 32]} />
      <meshStandardMaterial map={tex} roughness={0.8} />
    </mesh>
  );
}

function HelioMoon() {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    const state = useStore.getState();
    const [ex, ey, ez] = getEarthPosition(state.currentDate);
    const angle = (getDayOfYear(state.currentDate) / 27.3) * Math.PI * 2;
    ref.current.position.set(
      ex + MOON_ORBIT_RADIUS * Math.cos(angle),
      ey + MOON_ORBIT_RADIUS * 0.2 * Math.sin(angle * 0.5),
      ez + MOON_ORBIT_RADIUS * Math.sin(angle),
    );
  });
  return <group ref={ref}><HelioMoonMesh /></group>;
}

/* ========== 公转轨道线 + 椭圆面 ========== */
function HelioOrbitLines() {
  const earthOrbit = useMemo(() => {
    const a = EARTH_ORBIT_RADIUS;
    const b = a * Math.sqrt(1 - ORBIT_ECCENTRICITY * ORBIT_ECCENTRICITY);
    const c = a * ORBIT_ECCENTRICITY; // 焦点偏移，太阳在右焦点(原点)
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 512; i++) {
      const ang = (i / 512) * Math.PI * 2;
      pts.push(new THREE.Vector3(a * Math.cos(ang) - c, 0, b * Math.sin(ang)));
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.Line(g, new THREE.LineBasicMaterial({ color: '#5588cc', transparent: true, opacity: 0.6, depthWrite: false }));
  }, []);

  // 椭圆面（半透明填充）
  const orbitPlane = useMemo(() => {
    const a = EARTH_ORBIT_RADIUS;
    const b = a * Math.sqrt(1 - ORBIT_ECCENTRICITY * ORBIT_ECCENTRICITY);
    const c = a * ORBIT_ECCENTRICITY;
    const shape = new THREE.Shape();
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const ang = (i / segments) * Math.PI * 2;
      const x = a * Math.cos(ang) - c;
      const z = b * Math.sin(ang);
      if (i === 0) shape.moveTo(x, z);
      else shape.lineTo(x, z);
    }
    const geo = new THREE.ShapeGeometry(shape);
    const mat = new THREE.MeshBasicMaterial({
      color: '#335588',
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
  }, []);

  const moonOrbit = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const ang = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(MOON_ORBIT_RADIUS * Math.cos(ang), 0, MOON_ORBIT_RADIUS * Math.sin(ang)));
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.Line(g, new THREE.LineBasicMaterial({ color: '#667788', transparent: true, opacity: 0.35, depthWrite: false }));
  }, []);

  const moonRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!moonRef.current) return;
    const [ex, ey, ez] = getEarthPosition(useStore.getState().currentDate);
    moonRef.current.position.set(ex, ey, ez);
  });

  return (
    <group>
      <primitive object={orbitPlane} />
      <primitive object={earthOrbit} />
      <group ref={moonRef}>
        <primitive object={moonOrbit} />
      </group>
    </group>
  );
}

/* ========== 黄道面（含法线） ========== */
function EclipticOverlay() {
  const show = useStore((s) => s.showEclipticPlane);
  const plane = useMemo(() => {
    const a = EARTH_ORBIT_RADIUS;
    const b = a * Math.sqrt(1 - ORBIT_ECCENTRICITY * ORBIT_ECCENTRICITY);
    const c = a * ORBIT_ECCENTRICITY;
    const ringW = 0.5;
    const outerA = a + ringW;
    const outerB = b + ringW;
    const innerA = a - ringW;
    const innerB = b - ringW;

    const shape = new THREE.Shape();
    const segments = 128;
    // 外椭圆
    for (let i = 0; i <= segments; i++) {
      const ang = (i / segments) * Math.PI * 2;
      const x = outerA * Math.cos(ang) - c;
      const z = outerB * Math.sin(ang);
      if (i === 0) shape.moveTo(x, z);
      else shape.lineTo(x, z);
    }
    // 内椭圆（反向打洞）
    const hole = new THREE.Path();
    for (let i = 0; i <= segments; i++) {
      const ang = (i / segments) * Math.PI * 2;
      const x = innerA * Math.cos(ang) - c;
      const z = innerB * Math.sin(ang);
      if (i === 0) hole.moveTo(x, z);
      else hole.lineTo(x, z);
    }
    shape.holes.push(hole);

    const geo = new THREE.ShapeGeometry(shape);
    const m = new THREE.MeshBasicMaterial({ color: '#44aaff', transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false });
    const mesh = new THREE.Mesh(geo, m);
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
  }, []);
  const normal = useMemo(() => {
    const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 7, 0)];
    return new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: '#44aaff', transparent: true, opacity: 0.45, depthWrite: false }),
    );
  }, []);
  if (!show) return null;
  return (
    <group>
      <primitive object={plane} />
      <primitive object={normal} />
    </group>
  );
}

/* ========== 地轴 ========== */
function EarthAxis() {
  const show = useStore((s) => s.showEarthAxis);
  const ref = useRef<THREE.Group>(null);

  const line = useMemo(() => {
    const halfLen = EARTH_RADIUS * 2.5;
    const pts = [new THREE.Vector3(0, -halfLen, 0), new THREE.Vector3(0, halfLen, 0)];
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.Line(g, new THREE.LineBasicMaterial({ color: '#ff6644', transparent: true, opacity: 0.8, depthWrite: false }));
  }, []);

  const arrowN = useMemo(() => {
    const cone = new THREE.ConeGeometry(0.15, 0.5, 8);
    const mat = new THREE.MeshBasicMaterial({ color: '#ff6644', transparent: true, opacity: 0.8, depthWrite: false });
    const mesh = new THREE.Mesh(cone, mat);
    mesh.position.set(0, EARTH_RADIUS * 2.5, 0);
    return mesh;
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const [ex, ey, ez] = getEarthPosition(useStore.getState().currentDate);
    ref.current.position.set(ex, ey, ez);
    ref.current.rotation.set(TILT_RAD, 0, 0);
  });

  if (!show) return null;
  return (
    <group ref={ref}>
      <primitive object={line} />
      <primitive object={arrowN} />
    </group>
  );
}

/* ========== 地球位置赤道面 ========== */
function EquatorPlaneAtEarth() {
  const show = useStore((s) => s.showEquatorPlaneAtEarth);
  const ref = useRef<THREE.Group>(null);

  const ring = useMemo(() => {
    const R = EARTH_RADIUS * 1.6;
    const g = new THREE.RingGeometry(R - 0.2, R + 0.2, 128);
    const m = new THREE.MeshBasicMaterial({ color: '#ff4444', transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false });
    const mesh = new THREE.Mesh(g, m);
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const [ex, ey, ez] = getEarthPosition(useStore.getState().currentDate);
    ref.current.position.set(ex, ey, ez);
    ref.current.rotation.set(TILT_RAD, 0, 0);
  });

  if (!show) return null;
  return <group ref={ref}><primitive object={ring} /></group>;
}

/* ========== 轨道标记点（二分二至 + 近日远日） ========== */
function OrbitMarkers() {
  const show = useStore((s) => s.showOrbitMarkers);
  const currentDate = useStore((s) => s.currentDate);
  const year = currentDate.getFullYear();

  const markers = useMemo(() => {
    const eq = getEquinoxSolsticeDates(year);
    const peri = getPerihelionDate(year);
    const aph = getAphelionDate(year);
    const dates: { label: string; date: Date; color: string }[] = [
      { label: '春分', date: eq.spring, color: '#44ff88' },
      { label: '夏至', date: eq.summer, color: '#ff6644' },
      { label: '秋分', date: eq.autumn, color: '#ffaa00' },
      { label: '冬至', date: eq.winter, color: '#44aaff' },
      { label: '近日点', date: peri, color: '#ff4444' },
      { label: '远日点', date: aph, color: '#4444ff' },
    ];

    return dates.map(({ label, date, color }) => {
      const [x, y, z] = getEarthPosition(date);
      // 小球
      const dotGeo = new THREE.SphereGeometry(0.25, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(x, y, z);
      // 标签
      const canvas = document.createElement('canvas');
      canvas.width = 128; canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = color;
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 64, 32);
      const tex = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.85, depthTest: false });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(x, y + 1.2, z);
      sprite.scale.set(2.5, 1.25, 1);
      return { dot, sprite };
    });
  }, [year]);

  if (!show) return null;

  return (
    <group>
      {markers.map(({ dot, sprite }, i) => (
        <group key={i}>
          <primitive object={dot} />
          <primitive object={sprite} />
        </group>
      ))}
    </group>
  );
}

/* ========== 太阳光线 ========== */
function SunRay() {
  const show = useStore((s) => s.showSunRay);
  const ref = useRef<THREE.Line>(null);
  const geoRef = useRef<THREE.BufferGeometry>(new THREE.BufferGeometry());

  const line = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({ color: '#ffdd44', transparent: true, opacity: 0.5, depthWrite: false });
    return new THREE.Line(new THREE.BufferGeometry(), mat);
  }, []);

  useFrame(() => {
    if (!ref.current || !show) return;
    const [ex, ey, ez] = getEarthPosition(useStore.getState().currentDate);
    const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(ex, ey, ez)];
    geoRef.current.setFromPoints(pts);
    ref.current.geometry = geoRef.current;
  });

  if (!show) return null;
  return <primitive object={line} ref={ref} />;
}

/* ========== 相机控制器 ========== */
const HELIO_PRESETS: Record<Exclude<CameraPreset, 'surface'>, { pos: [number, number, number]; target: [number, number, number] }> = {
  free: { pos: [0, 8, 18], target: [0, 0, 0] },
  top: { pos: [0, 20, 0.1], target: [0, 0, 0] },
  side: { pos: [0, 0, 20], target: [0, 0, 0] },
  northPole: { pos: [0, 5, 0.1], target: [0, 0, 0] },
  equator: { pos: [18, 0, 0], target: [0, 0, 0] },
};

function HelioCameraController() {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const prev = useRef<CameraPreset>('free');

  useFrame(() => {
    const preset = useStore.getState().cameraPreset;
    if (preset === 'surface') return;
    if (preset !== prev.current) {
      prev.current = preset;
      const cfg = HELIO_PRESETS[preset];
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
function HelioContent() {
  return (
    <>
      <Starfield />
      <HelioSun />
      <HelioEarth />
      <HelioMoon />
      <HelioOrbitLines />
      <EclipticOverlay />
      <EarthAxis />
      <EquatorPlaneAtEarth />
      <OrbitMarkers />
      <OrbitSpeedIndicator />
      <SeasonDemo />
      <EclipseDemo />
      <TimeManager />
      <SunRay />
      <ambientLight intensity={0.12} />
      <HelioCameraController />
    </>
  );
}

/* ========== 导出 ========== */
export default function HeliocentricScene() {
  return (
    <Canvas
      camera={{ position: [0, 8, 18], fov: 45 }}
      gl={{ antialias: true, alpha: false }}
      style={{ width: '100%', height: '100%', background: '#0a0e27' }}
    >
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <HelioContent />
        </Suspense>
      </ErrorBoundary>
    </Canvas>
  );
}