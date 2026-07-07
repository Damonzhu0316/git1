import { useRef, useCallback, useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';

/**
 * TimeSlider - 时间拖拽滑块
 * 在地心视角中用于快速扫描一天中不同时刻的变化
 * 范围 0-24（小时），精度 15 分钟
 */
export default function TimeSlider() {
  const currentDate = useStore((s) => s.currentDate);
  const setDate = useStore((s) => s.setDate);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const currentHour = currentDate.getHours() + currentDate.getMinutes() / 60;

  const updateTime = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const hour = ratio * 24;
      const h = Math.floor(hour);
      const m = Math.floor((hour - h) * 60);
      const newDate = new Date(currentDate);
      newDate.setHours(h, m, 0, 0);
      setDate(newDate);
    },
    [currentDate, setDate],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      updateTime(e.clientX);
    },
    [updateTime],
  );

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent) => updateTime(e.clientX);
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, updateTime]);

  const ratio = currentHour / 24;
  const sliderPercent = (ratio * 100).toFixed(1);

  // 时刻标签
  const hourLabels = [0, 3, 6, 9, 12, 15, 18, 21, 24];

  // 判断当前时段
  const periodLabel = currentHour < 6 ? '深夜' : currentHour < 12 ? '上午' : currentHour < 18 ? '下午' : '夜晚';
  const periodColor = currentHour < 6 ? '#4466aa' : currentHour < 12 ? '#ffaa44' : currentHour < 18 ? '#ff8844' : '#4466aa';

  return (
    <div className="px-2 py-2 border-b border-white/10">
      <div className="text-[10px] text-white/40 mb-1 text-center">时刻调节 (拖动滑块)</div>

      {/* 当前时间显示 */}
      <div className="flex items-center justify-center gap-1 mb-1.5">
        <span className="text-xs text-white/60">
          {String(currentDate.getHours()).padStart(2, '0')}:
          {String(currentDate.getMinutes()).padStart(2, '0')}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: periodColor + '30', color: periodColor }}>
          {periodLabel}
        </span>
      </div>

      {/* 滑块轨道 */}
      <div
        ref={trackRef}
        className="relative h-6 cursor-pointer select-none rounded-full mb-1"
        style={{ background: 'linear-gradient(to right, #1a1a4a 0%, #3344aa 25%, #ffaa44 50%, #ff8844 75%, #1a1a4a 100%)' }}
        onMouseDown={handleMouseDown}
      >
        {/* 滑块手柄 */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-lg transition-shadow"
          style={{
            left: `calc(${sliderPercent}% - 8px)`,
            background: 'linear-gradient(135deg, #ffdd44, #ffaa22)',
            boxShadow: isDragging ? '0 0 12px rgba(255, 221, 68, 0.6)' : '0 0 6px rgba(255, 221, 68, 0.3)',
          }}
        />
        {/* 当前指示线 */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/60"
          style={{ left: `${sliderPercent}%` }}
        />
      </div>

      {/* 时刻标签 */}
      <div className="flex justify-between px-0.5">
        {hourLabels.map((h) => (
          <span
            key={h}
            className="text-[8px] cursor-pointer hover:text-white/80 transition-colors"
            style={{ color: Math.abs(currentHour - h) < 0.5 ? '#ffdd44' : '#ffffff40' }}
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setHours(h, 0, 0, 0);
              setDate(newDate);
            }}
          >
            {h === 24 ? '0' : h}
          </span>
        ))}
      </div>
    </div>
  );
}