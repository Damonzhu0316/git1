import { useRef, useState, useCallback, useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useStore } from '@/store/useStore';
import {
  getSolarDeclination, formatDeclination, getEarthPosition, getEarthOrbitAngle,
  getSolarHemisphere, getDeclinationTrend, getDayLength, getDayOfYear
} from '@/utils/astronomy';
import { EARTH_ORBIT_RADIUS } from '@/utils/constants';

interface CelestialBodyProps {
  name: string;
  color: string;
  radius: number;
  children: React.ReactNode;
  getInfo?: () => InfoLine[];
}

export interface InfoLine {
  label: string;
  value: string;
  highlight?: boolean;
  section?: string;
}

function InfoCard({ info, onClose }: { info: InfoLine[]; onClose: () => void }) {
  const sections = useMemo(() => {
    const map: Record<string, InfoLine[]> = {};
    info.forEach((line) => {
      const sec = line.section || '基本数据';
      if (!map[sec]) map[sec] = [];
      map[sec].push(line);
    });
    return map;
  }, [info]);

  return (
    <div className="bg-[#0a0e27]/95 backdrop-blur-md border border-white/15 rounded-lg px-3.5 py-3 text-xs shadow-xl min-w-[180px]">
      {Object.entries(sections).map(([section, lines]) => (
        <div key={section} className="mb-2 last:mb-0">
          <div className="text-[10px] text-[#00d4ff]/70 font-semibold uppercase tracking-wider mb-1 border-b border-white/5 pb-0.5">
            {section}
          </div>
          {lines.map((line, i) => (
            <div key={i} className="flex justify-between gap-3 py-0.5">
              <span className="text-white/40 text-[10px]">{line.label}</span>
              <span className={`text-[11px] font-mono text-right ${line.highlight ? 'text-[#f0c060] font-semibold' : 'text-white/70'}`}>
                {line.value}
              </span>
            </div>
          ))}
        </div>
      ))}
      <button
        className="mt-2 w-full text-[10px] text-white/30 hover:text-white/60 transition-colors border-t border-white/5 pt-1.5"
        onClick={onClose}
      >
        关闭
      </button>
    </div>
  );
}

export function CelestialBody({ name, color, radius, children, getInfo }: CelestialBodyProps) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const glowRef = useRef<THREE.Mesh>(null);

  const handlePointerOver = useCallback(() => setHovered(true), []);
  const handlePointerOut = useCallback(() => { setHovered(false); }, []);
  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    setClicked((prev) => !prev);
  }, []);

  useFrame(() => {
    if (glowRef.current) {
      const targetOpacity = hovered ? 0.3 : 0;
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.15);
    }
  });

  const info = getInfo?.() ?? [];

  return (
    <group>
      <mesh ref={glowRef} visible={hovered || glowRef.current !== null}>
        <sphereGeometry args={[radius * 1.3, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} />
      </mesh>

      <group
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        {children}
      </group>

      {clicked && (
        <Html distanceFactor={12} center>
          <div className="pointer-events-auto">
            <InfoCard info={info} onClose={() => setClicked(false)} />
          </div>
        </Html>
      )}
    </group>
  );
}

/* ========== 太阳信息 ========== */
export function SunInfo() {
  const getInfo = useCallback((): InfoLine[] => {
    const date = useStore.getState().currentDate;
    const decl = getSolarDeclination(date);
    const hemisphere = getSolarHemisphere(decl);
    const trend = getDeclinationTrend(date);
    return [
      { label: '名称', value: '太阳', section: '基本数据', highlight: true },
      { label: '光谱类型', value: 'G2V（黄矮星）', section: '基本数据' },
      { label: '半径', value: '约69.6万 km', section: '基本数据' },
      { label: '质量', value: '1.989×10³⁰ kg', section: '基本数据' },
      { label: '表面温度', value: '约5,500°C', section: '基本数据' },
      { label: '直射点纬度', value: formatDeclination(decl), section: '教学数据', highlight: true },
      { label: '直射半球', value: hemisphere, section: '教学数据' },
      { label: '移动方向', value: trend, section: '教学数据' },
      { label: '对地球影响', value: '提供光热、驱动大气环流', section: '教学数据' },
    ];
  }, []);
  return getInfo;
}

/* ========== 地球信息 ========== */
export function EarthInfo() {
  const getInfo = useCallback((): InfoLine[] => {
    const date = useStore.getState().currentDate;
    const [ex, ey, ez] = getEarthPosition(date);
    const dist = Math.sqrt(ex * ex + ey * ey + ez * ez);
    const angle = getEarthOrbitAngle(date);
    const angleDeg = ((angle * 180) / Math.PI) % 360;
    const decl = getSolarDeclination(date);
    const dayLen = getDayLength(40, decl);
    const doy = getDayOfYear(date);

    // 计算公转速度（简化：v ≈ 2πa/T）
    const orbitSpeed = (2 * Math.PI * EARTH_ORBIT_RADIUS) / 365.25;
    const speedRatio = EARTH_ORBIT_RADIUS / dist;

    // 判断季节（北半球）
    let season = '春季';
    if (doy >= 172 && doy < 266) season = '夏季';
    else if (doy >= 266 && doy < 355) season = '秋季';
    else if (doy >= 355 || doy < 80) season = '冬季';

    return [
      { label: '名称', value: '地球', section: '基本数据', highlight: true },
      { label: '半径', value: '6,371 km', section: '基本数据' },
      { label: '自转周期', value: '23时56分4秒', section: '基本数据' },
      { label: '公转周期', value: '365.25天', section: '基本数据' },
      { label: '日地距离', value: `${dist.toFixed(2)} AU`, section: '轨道数据', highlight: true },
      { label: '轨道角度', value: `${angleDeg.toFixed(1)}°`, section: '轨道数据' },
      { label: '公转速度', value: `${(orbitSpeed * speedRatio).toFixed(2)} 单位/天`, section: '轨道数据' },
      { label: '北半球季节', value: season, section: '教学数据', highlight: true },
      { label: '直射赤纬', value: formatDeclination(decl), section: '教学数据' },
      { label: '北京昼长', value: `${dayLen.toFixed(1)} 小时`, section: '教学数据' },
      { label: '黄赤交角', value: '23°26′', section: '教学数据' },
    ];
  }, []);
  return getInfo;
}

/* ========== 月球信息 ========== */
export function MoonInfo() {
  const getInfo = useCallback((): InfoLine[] => {
    const date = useStore.getState().currentDate;
    const doy = getDayOfYear(date);
    const lunarDay = (doy % 27.3) / 27.3;

    let phase = '新月';
    if (lunarDay < 0.125) phase = '新月 🌑';
    else if (lunarDay < 0.25) phase = '上弦月 🌓';
    else if (lunarDay < 0.375) phase = '满月 🌕';
    else if (lunarDay < 0.5) phase = '下弦月 🌗';
    else if (lunarDay < 0.625) phase = '下弦月 🌗';
    else if (lunarDay < 0.75) phase = '新月 🌑';
    else if (lunarDay < 0.875) phase = '上弦月 🌓';
    else phase = '满月 🌕';

    return [
      { label: '名称', value: '月球', section: '基本数据', highlight: true },
      { label: '半径', value: '1,737 km', section: '基本数据' },
      { label: '公转周期', value: '27.3天', section: '基本数据' },
      { label: '距地球', value: '约38.4万 km', section: '基本数据' },
      { label: '当前月相', value: phase, section: '教学数据', highlight: true },
      { label: '月球日', value: `${lunarDay.toFixed(2)} (0-1)`, section: '教学数据' },
      { label: '对地球影响', value: '潮汐、日食/月食', section: '教学数据' },
    ];
  }, []);
  return getInfo;
}