import { useRef, useCallback, useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';

/**
 * DateSlider - 日期拖拽滑块
 * 拖动滑块快速扫描一年中不同日期的变化
 * 范围：1月1日 ~ 12月31日（第1天 ~ 第365天），精度 1 天
 */
const MONTH_LABELS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const SEASON_MARKERS = [
  { label: '春分', day: 80, color: '#44ff88' },
  { label: '夏至', day: 172, color: '#ff6644' },
  { label: '秋分', day: 266, color: '#ffaa00' },
  { label: '冬至', day: 355, color: '#44aaff' },
];

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86400000);
}

export default function DateSlider() {
  const currentDate = useStore((s) => s.currentDate);
  const setDate = useStore((s) => s.setDate);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const doy = getDayOfYear(currentDate);

  const updateDate = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const day = Math.round(ratio * 364) + 1; // 1-365
      const newDate = new Date(currentDate.getFullYear(), 0, 1);
      newDate.setDate(day);
      newDate.setHours(currentDate.getHours(), currentDate.getMinutes(), 0, 0);
      setDate(newDate);
    },
    [currentDate, setDate],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      updateDate(e.clientX);
    },
    [updateDate],
  );

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent) => updateDate(e.clientX);
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, updateDate]);

  const ratio = (doy - 1) / 364;
  const sliderPercent = (ratio * 100).toFixed(1);

  const monthIndex = currentDate.getMonth();
  const day = currentDate.getDate();

  return (
    <div className="px-2 py-2 border-b border-white/10">
      <div className="text-[10px] text-white/40 mb-1 text-center">日期调节 (拖动滑块)</div>

      {/* 当前日期显示 */}
      <div className="text-center mb-1.5">
        <span className="text-xs text-[#00d4ff] font-mono">
          {currentDate.getFullYear()}-{String(monthIndex + 1).padStart(2, '0')}-{String(day).padStart(2, '0')}
        </span>
        <span className="text-[10px] text-white/40 ml-1">第{doy}天</span>
      </div>

      {/* 滑块轨道 — 四季颜色渐变 */}
      <div
        ref={trackRef}
        className="relative h-6 cursor-pointer select-none rounded-full mb-0.5"
        style={{
          background: 'linear-gradient(to right, #3366aa 0%, #44cc88 15%, #44ff88 25%, #ff8844 40%, #ff6644 50%, #ff8844 60%, #ffaa44 75%, #44aaff 85%, #3366aa 100%)',
        }}
        onMouseDown={handleMouseDown}
      >
        {/* 滑块手柄 */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-lg transition-shadow"
          style={{
            left: `calc(${sliderPercent}% - 8px)`,
            background: 'linear-gradient(135deg, #00d4ff, #0088cc)',
            boxShadow: isDragging ? '0 0 12px rgba(0, 212, 255, 0.6)' : '0 0 6px rgba(0, 212, 255, 0.3)',
          }}
        />
        {/* 当前指示线 */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-white/60" style={{ left: `${sliderPercent}%` }} />
      </div>

      {/* 二分二至标记点 */}
      <div className="relative h-3 mb-0.5">
        {SEASON_MARKERS.map(({ label, day: markerDay, color }) => {
          const pct = ((markerDay - 1) / 364 * 100).toFixed(1);
          return (
            <div
              key={label}
              className="absolute -translate-x-1/2"
              style={{ left: `${pct}%` }}
            >
              <div className="w-1 h-2 rounded-full mx-auto" style={{ backgroundColor: color }} />
              <span className="text-[7px] block text-center" style={{ color }}>{label}</span>
            </div>
          );
        })}
      </div>

      {/* 月份标签 */}
      <div className="relative h-4">
        {MONTH_LABELS.map((label, i) => {
          const isActive = i === monthIndex;
          const pct = (i / 11 * 100).toFixed(1);
          return (
            <span
              key={label}
              className="absolute text-[8px] cursor-pointer hover:text-white/80 transition-colors"
              style={{
                left: `${pct}%`,
                transform: 'translateX(-50%)',
                color: isActive ? '#00d4ff' : '#ffffff40',
              }}
              onClick={() => {
                const newDate = new Date(currentDate.getFullYear(), i, Math.min(day, new Date(currentDate.getFullYear(), i + 1, 0).getDate()));
                newDate.setHours(currentDate.getHours(), currentDate.getMinutes(), 0, 0);
                setDate(newDate);
              }}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}