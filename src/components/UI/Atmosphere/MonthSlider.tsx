import { useStore } from '@/store/useStore';
import { Play, Pause } from 'lucide-react';

const MONTH_NAMES = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月',
];

export function MonthSlider() {
  const month = useStore((s) => s.month);
  const isPlaying = useStore((s) => s.isPlaying);
  const setMonth = useStore((s) => s.setMonth);
  const togglePlayback = useStore((s) => s.togglePlayback);

  return (
    <div className="flex items-center gap-4 flex-1">
      <button
        onClick={togglePlayback}
        className="flex-shrink-0 w-10 h-10 rounded bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>

      <div className="flex-1">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{MONTH_NAMES[month - 1]}</span>
          <span className="text-gray-500">拖动滑块观察季节变化</span>
        </div>
        <input
          type="range"
          min={1}
          max={12}
          step={1}
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>
    </div>
  );
}
