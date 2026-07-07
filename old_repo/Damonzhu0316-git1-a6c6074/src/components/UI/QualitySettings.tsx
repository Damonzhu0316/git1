import { useState } from 'react';
import { Monitor, Check, Sliders } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { QualityLevel } from '@/types';

const QUALITY_OPTIONS: { value: QualityLevel; label: string; desc: string }[] = [
  { value: 'high', label: '高', desc: '完整特效，推荐高性能设备' },
  { value: 'medium', label: '中', desc: '关闭阴影，降低粒子数' },
  { value: 'low', label: '低', desc: '最小化特效，适合低端设备' },
];

export default function QualitySettings() {
  const quality = useStore((s) => s.quality);
  const setQuality = useStore((s) => s.setQuality);
  const addToast = useStore((s) => s.addToast);
  const [open, setOpen] = useState(false);

  const handleChange = (q: QualityLevel) => {
    setQuality(q);
    addToast({ type: 'info', message: `画质已切换为 ${q === 'high' ? '高' : q === 'medium' ? '中' : '低'}` });
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
        title="画质设置"
      >
        <Sliders size={13} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 w-52 bg-[#0a0e27]/98 border border-white/10 rounded-xl shadow-2xl p-1.5 animate-toast-enter">
            <div className="px-2 py-1.5 text-[10px] text-white/30 font-mono">画质设置</div>
            {QUALITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleChange(opt.value)}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors ${
                  quality === opt.value ? 'bg-[#00d4ff]/10' : 'hover:bg-white/5'
                }`}
              >
                <Monitor size={13} className={quality === opt.value ? 'text-[#00d4ff]' : 'text-white/30'} />
                <div className="flex-1 min-w-0">
                  <div className={`text-xs ${quality === opt.value ? 'text-[#00d4ff]' : 'text-white/70'}`}>
                    {opt.label}
                  </div>
                  <div className="text-[10px] text-white/30 truncate">{opt.desc}</div>
                </div>
                {quality === opt.value && <Check size={12} className="text-[#00d4ff] shrink-0" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}