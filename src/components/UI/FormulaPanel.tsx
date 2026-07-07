import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { getDayOfYear } from '@/utils/astronomy';
import { EARTH_TILT } from '@/utils/constants';

/** 弧度转度 */
const rad2deg = (r: number) => (r * 180) / Math.PI;

/** 度转弧度 */
const deg2rad = (d: number) => (d * Math.PI) / 180;

/**
 * FormulaPanel - 高中地理核心公式实时计算面板
 * 显示公式并带入当前观测点数据进行实时计算
 */
export default function FormulaPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const currentDate = useStore((s) => s.currentDate);
  const lat = useStore((s) => s.targetLatitude);
  const lon = useStore((s) => s.targetLongitude);

  const formulas = useMemo(() => {
    const dayOfYear = getDayOfYear(currentDate);
    // 太阳赤纬简化公式
    const delta = (-EARTH_TILT * Math.cos((360 / 365.25) * deg2rad(dayOfYear + 10)));
    const phi = lat;
    const lambda = lon;

    // 1. 正午太阳高度角
    const noonAltitude = 90 - Math.abs(phi - delta);

    // 2. 昼长
    const cosOmega = -Math.tan(deg2rad(phi)) * Math.tan(deg2rad(delta));
    const omega = cosOmega >= 1 ? Math.PI : cosOmega <= -1 ? 0 : Math.acos(cosOmega);
    const dayLength = (2 * rad2deg(omega)) / 15;

    // 3. 日出时刻
    const sunriseHour = 12 - rad2deg(omega) / 15;
    const sunriseH = Math.floor(sunriseHour);
    const sunriseM = Math.floor((sunriseHour - sunriseH) * 60);

    // 4. 日落时刻
    const sunsetHour = 12 + rad2deg(omega) / 15;
    const sunsetH = Math.floor(sunsetHour);
    const sunsetM = Math.floor((sunsetHour - sunsetH) * 60);

    // 5. 地方时差（观测点经度 vs 北京120°E）
    const localTimeOffset = (lambda - 120) / 15;

    return [
      {
        title: '正午太阳高度角',
        formula: 'H = 90° − |φ − δ|',
        values: `H = 90° − |${phi.toFixed(1)}° − ${delta.toFixed(1)}°|`,
        result: `= ${noonAltitude.toFixed(1)}°`,
      },
      {
        title: '昼长',
        formula: '昼长 = 2 × arccos(−tan φ × tan δ) / 15°',
        values: `= 2 × arccos(−tan ${phi.toFixed(1)}° × tan ${delta.toFixed(1)}°) / 15°`,
        result: `= ${dayLength.toFixed(1)} 小时`,
      },
      {
        title: '日出/日落',
        formula: 'cos ω = −tan φ × tan δ',
        values: `日出: ${String(sunriseH).padStart(2, '0')}:${String(sunriseM).padStart(2, '0')}  日落: ${String(sunsetH).padStart(2, '0')}:${String(sunsetM).padStart(2, '0')}`,
        result: `昼长 = ${dayLength.toFixed(1)}h`,
      },
      {
        title: '地方时差',
        formula: 'Δt = (λ − 120°) / 15°',
        values: `Δt = (${lambda.toFixed(0)}° − 120°) / 15°`,
        result: `= ${localTimeOffset >= 0 ? '+' : ''}${localTimeOffset.toFixed(1)} 小时`,
      },
      {
        title: '时区计算',
        formula: '区时 = 已知区时 ± 时区差',
        values: `北京(东八区) vs 观测点(${lambda > 0 ? '东' : '西'}${(Math.abs(lambda) / 15).toFixed(0)}区)`,
        result: `时差 ≈ ${localTimeOffset >= 0 ? '+' : ''}${localTimeOffset.toFixed(0)}h`,
      },
    ];
  }, [currentDate, lat, lon]);

  return (
    <div className="border-t border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <span className="text-[10px] font-semibold text-[#f0c060] tracking-wide">地理公式</span>
        <span className="text-[10px] text-white/40 transition-transform" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          ▶
        </span>
      </button>

      {isOpen && (
        <div className="px-2 pb-2 space-y-1.5 max-h-64 overflow-y-auto">
          {formulas.map((f, i) => (
            <div key={i} className="bg-white/5 rounded p-1.5">
              <div className="text-[9px] text-[#f0c060] mb-0.5">{f.title}</div>
              <div className="text-[8px] text-white/50 font-mono mb-0.5">{f.formula}</div>
              <div className="text-[8px] text-white/40 font-mono mb-0.5 truncate">{f.values}</div>
              <div className="text-[9px] text-[#44ff88] font-mono font-bold">{f.result}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}