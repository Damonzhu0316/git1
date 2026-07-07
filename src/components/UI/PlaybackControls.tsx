import React from 'react';
import { Play, Pause, FastForward, Rewind, ChevronUp, ChevronDown } from 'lucide-react';
import { useStore } from '@/store/useStore';

const SPEED_PRESETS = [0.1, 0.5, 1, 2, 5, 10, 30, 60, 100];

export default function PlaybackControls() {
  const isPlaying = useStore((s) => s.isPlaying);
  const timeSpeed = useStore((s) => s.timeSpeed);
  const togglePlay = useStore((s) => s.togglePlay);
  const setTimeSpeed = useStore((s) => s.setTimeSpeed);

  const currentIndex = SPEED_PRESETS.indexOf(timeSpeed);
  const displaySpeed = timeSpeed >= 1 ? `${timeSpeed}x` : `${timeSpeed}x`;

  return (
    <div className="flex items-center gap-1.5 bg-[#0a0e27]/85 backdrop-blur-md border border-white/10 rounded-lg px-2 py-1">
      {/* 播放/暂停 */}
      <button
        onClick={togglePlay}
        className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
          isPlaying
            ? 'bg-[#00d4ff]/20 text-[#00d4ff] hover:bg-[#00d4ff]/30'
            : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
        }`}
        title={isPlaying ? '暂停' : '播放'}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
      </button>

      {/* 减速 */}
      <button
        onClick={() => {
          if (currentIndex > 0) setTimeSpeed(SPEED_PRESETS[currentIndex - 1]);
        }}
        disabled={currentIndex <= 0}
        className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-white/60 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        title="减速"
      >
        <ChevronDown size={12} />
      </button>

      {/* 速度显示 */}
      <span className="text-xs font-mono text-[#00d4ff] min-w-[32px] text-center font-semibold">
        {displaySpeed}
      </span>

      {/* 加速 */}
      <button
        onClick={() => {
          if (currentIndex < SPEED_PRESETS.length - 1) setTimeSpeed(SPEED_PRESETS[currentIndex + 1]);
        }}
        disabled={currentIndex >= SPEED_PRESETS.length - 1}
        className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-white/60 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        title="加速"
      >
        <ChevronUp size={12} />
      </button>

      {/* 进度条 */}
      <div className="relative w-20 h-1 bg-white/10 rounded-full mx-1">
        <div
          className="absolute left-0 top-0 h-full bg-[#00d4ff]/60 rounded-full transition-all"
          style={{ width: `${Math.min(100, (currentIndex / (SPEED_PRESETS.length - 1)) * 100)}%` }}
        />
      </div>
    </div>
  );
}