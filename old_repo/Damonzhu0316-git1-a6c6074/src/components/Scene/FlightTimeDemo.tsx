import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { EARTH_RADIUS } from '@/utils/constants';

/** 城市经纬度数据 */
const CITIES: Record<string, { name: string; lat: number; lon: number }> = {
  beijing: { name: '北京', lat: 40, lon: 116 },
  newyork: { name: '纽约', lat: 40.7, lon: -74 },
  london: { name: '伦敦', lat: 51.5, lon: 0 },
  tokyo: { name: '东京', lat: 35.7, lon: 140 },
  losangeles: { name: '洛杉矶', lat: 34, lon: -118 },
  sydney: { name: '悉尼', lat: -33.9, lon: 151 },
};

/** 将经纬度转换为地球表面的3D坐标 */
function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = lon * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/** 创建Sprite标签 */
function makeCityLabel(text: string, pos: THREE.Vector3, color: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 48;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 64, 24);
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.position.copy(pos);
  sprite.scale.set(1.5, 0.55, 1);
  return sprite;
}

/**
 * FlightTimeDemo
 * 地心视角中展示飞行时间计算
 * - 两个城市标记点 + 飞行弧线
 * - 右侧面板显示计算步骤
 */
export default function FlightTimeDemo() {
  const show = useStore((s) => s.showFlightTime);
  const originKey = useStore((s) => s.flightOrigin);
  const destKey = useStore((s) => s.flightDestination);
  const currentDate = useStore((s) => s.currentDate);

  const origin = CITIES[originKey] || CITIES.beijing;
  const dest = CITIES[destKey] || CITIES.newyork;

  const originPos = useMemo(() => latLonToVec3(origin.lat, origin.lon, EARTH_RADIUS * 1.02), [origin]);
  const destPos = useMemo(() => latLonToVec3(dest.lat, dest.lon, EARTH_RADIUS * 1.02), [dest]);

  const originLabel = useMemo(() => makeCityLabel(origin.name, originPos.clone().multiplyScalar(1.08), '#ff6644'), [origin, originPos]);
  const destLabel = useMemo(() => makeCityLabel(dest.name, destPos.clone().multiplyScalar(1.08), '#44aaff'), [dest, destPos]);

  // 飞行路径弧线（大圆弧）
  const arcLine = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const steps = 64;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const pt = new THREE.Vector3().lerpVectors(originPos, destPos, t).normalize().multiplyScalar(EARTH_RADIUS * 1.06);
      points.push(pt);
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: '#ffdd44', transparent: true, opacity: 0.6, depthTest: true });
    return new THREE.Line(geo, mat);
  }, [originPos, destPos]);

  // 计算飞行时间
  const flightInfo = useMemo(() => {
    const flightHours = 13; // 北京→纽约约13小时
    const originLon = origin.lon;
    const destLon = dest.lon;
    const timeDiff = (destLon - originLon) / 15; // 时差（小时）

    const now = new Date(currentDate);
    const depHour = now.getHours() + now.getMinutes() / 60;

    // 到达时目的地当地时间
    const arrLocalHour = ((depHour + flightHours + timeDiff) % 24 + 24) % 24;
    const arrH = Math.floor(arrLocalHour);
    const arrM = Math.floor((arrLocalHour - arrH) * 60);

    return {
      flightHours,
      timeDiff,
      depHour,
      arrLocalHour,
      arrH,
      arrM,
    };
  }, [currentDate, origin, dest]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    // 保持随地球自转
    const state = useStore.getState();
    const year = state.currentDate.getFullYear();
    const dayOfYear = (state.currentDate.getTime() - new Date(year, 0, 1).getTime()) / 86400000;
    const timeOfDay = state.currentDate.getHours() / 24 + state.currentDate.getMinutes() / 1440;
    const totalRotation = (dayOfYear + timeOfDay) * Math.PI * 2;
    groupRef.current.rotation.y = totalRotation;
  });

  if (!show) return null;

  return (
    <group ref={groupRef}>
      {/* 城市标记点 */}
      <mesh position={originPos}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#ff6644" />
      </mesh>
      <mesh position={destPos}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#44aaff" />
      </mesh>

      {/* 飞行弧线 */}
      <primitive object={arcLine} />

      {/* 城市标签 */}
      <primitive object={originLabel} />
      <primitive object={destLabel} />
    </group>
  );
}

/** 飞行时间计算面板（右侧面板用） */
export function FlightTimePanel() {
  const show = useStore((s) => s.showFlightTime);
  const originKey = useStore((s) => s.flightOrigin);
  const destKey = useStore((s) => s.flightDestination);
  const setOrigin = useStore((s) => s.setFlightOrigin);
  const setDest = useStore((s) => s.setFlightDestination);
  const currentDate = useStore((s) => s.currentDate);

  const origin = CITIES[originKey] || CITIES.beijing;
  const dest = CITIES[destKey] || CITIES.newyork;

  const flightHours = 13;
  const timeDiff = (dest.lon - origin.lon) / 15;
  const now = new Date(currentDate);
  const depHour = now.getHours() + now.getMinutes() / 60;
  const arrLocalHour = ((depHour + flightHours + timeDiff) % 24 + 24) % 24;

  const cityKeys = Object.keys(CITIES);

  if (!show) return null;

  return (
    <div className="border-t border-white/10 px-2 py-2">
      <div className="text-[10px] font-semibold text-[#f0c060] mb-2 text-center">飞行时间计算</div>

      {/* 城市选择 */}
      <div className="flex items-center gap-1 mb-2">
        <select
          value={originKey}
          onChange={(e) => setOrigin(e.target.value)}
          className="flex-1 bg-white/10 text-[10px] text-white/80 rounded px-1 py-0.5 border border-white/10"
        >
          {cityKeys.map((k) => <option key={k} value={k}>{CITIES[k].name}</option>)}
        </select>
        <span className="text-[10px] text-white/40">→</span>
        <select
          value={destKey}
          onChange={(e) => setDest(e.target.value)}
          className="flex-1 bg-white/10 text-[10px] text-white/80 rounded px-1 py-0.5 border border-white/10"
        >
          {cityKeys.filter((k) => k !== originKey).map((k) => <option key={k} value={k}>{CITIES[k].name}</option>)}
        </select>
      </div>

      {/* 计算步骤 */}
      <div className="space-y-1 text-[9px] font-mono">
        <div className="flex justify-between">
          <span className="text-white/40">起飞当地时间</span>
          <span className="text-[#ffdd44]">
            {String(Math.floor(depHour)).padStart(2, '0')}:
            {String(Math.floor((depHour % 1) * 60)).padStart(2, '0')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/40">飞行时长</span>
          <span className="text-white/60">{flightHours}h</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/40">时差 (Δλ/15°)</span>
          <span className="text-white/60">{timeDiff >= 0 ? '+' : ''}{timeDiff.toFixed(1)}h</span>
        </div>
        <div className="border-t border-white/10 pt-1 flex justify-between">
          <span className="text-white/40">到达当地时间</span>
          <span className="text-[#44ff88]">
            {String(Math.floor(arrLocalHour)).padStart(2, '0')}:
            {String(Math.floor((arrLocalHour % 1) * 60)).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* 公式 */}
      <div className="mt-1.5 text-[8px] text-white/40 font-mono bg-white/5 rounded p-1">
        T₂ = T₁ + 飞行时长 + (λ₂−λ₁)/15°
      </div>
    </div>
  );
}