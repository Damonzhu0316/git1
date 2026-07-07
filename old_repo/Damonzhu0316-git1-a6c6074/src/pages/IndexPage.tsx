import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Orbit, Focus, User, ArrowRight, HelpCircle, Clock, Play } from 'lucide-react';
import HelpDialog from '@/components/UI/HelpDialog';
import { useStore } from '@/store/useStore';
import { loadPreferences } from '@/utils/preferences';

const VIEWS = [
  {
    key: 'heliocentric',
    icon: <Orbit size={32} />,
    title: '日心视角',
    desc: '太阳在中心，观察地球公转轨道、黄赤交角、近日点与远日点',
    tags: ['公转', '黄赤交角', '椭圆轨道', '二分二至'],
    color: '#f0c060',
  },
  {
    key: 'geocentric',
    icon: <Focus size={32} />,
    title: '地心视角',
    desc: '地球在中心，观察自转、晨昏线、昼夜长短、正午太阳高度',
    tags: ['自转', '晨昏线', '昼夜', '太阳高度'],
    color: '#00d4ff',
  },
  {
    key: 'surface',
    icon: <User size={32} />,
    title: '地表视角',
    desc: '站在地球表面，观察太阳在天空中的周日视运动轨迹',
    tags: ['周日视运动', '日出日落', '太阳轨迹', '方位角'],
    color: '#44ff88',
  },
];

const VIEW_LABELS: Record<string, string> = {
  heliocentric: '日心视角',
  geocentric: '地心视角',
  surface: '地表视角',
};

export default function IndexPage() {
  const navigate = useNavigate();
  const setActiveView = useStore((s) => s.setActiveView);
  const setDate = useStore((s) => s.setDate);
  const [helpOpen, setHelpOpen] = useState(false);
  const [prefs] = useState(() => loadPreferences());

  const handleNavigate = (view: string) => {
    setActiveView(view as any);
    navigate(`/${view}`);
  };

  const handleContinue = () => {
    if (prefs.lastView) {
      if (prefs.lastDate) {
        setDate(new Date(prefs.lastDate));
      }
      setActiveView(prefs.lastView as any);
      navigate(`/${prefs.lastView}`);
    }
  };

  return (
    <div className="w-full h-screen bg-[#0a0e27] flex flex-col items-center justify-center gap-6 md:gap-8 p-4 md:p-8">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-[#f0c060] tracking-wider mb-2">
          地球的运动
        </h1>
        <p className="text-white/40 text-xs md:text-sm">人教版必修一 · 第一章 · 3D交互实验</p>
      </div>

      {/* 继续上次实验 */}
      {prefs.lastView && (
        <button
          onClick={handleContinue}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00d4ff]/30 transition-all duration-300 group"
        >
          <div className="w-7 h-7 rounded-full bg-[#00d4ff]/10 flex items-center justify-center">
            <Clock size={14} className="text-[#00d4ff]" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-white/40 text-[10px]">继续上次实验</span>
            <span className="text-white/60 text-xs">
              {VIEW_LABELS[prefs.lastView] || prefs.lastView}
              {prefs.lastDate && ` · ${new Date(prefs.lastDate).toLocaleDateString('zh-CN')}`}
            </span>
          </div>
          <Play size={14} className="text-white/20 group-hover:text-[#00d4ff] transition-colors" />
        </button>
      )}

      {/* 桌面端：水平排列；移动端：垂直堆叠 */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 max-w-4xl w-full px-2 md:px-0">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => handleNavigate(v.key)}
            className="flex-1 group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-4 md:p-6 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex md:block items-center gap-4 md:gap-0">
              <div className="mb-0 md:mb-4 shrink-0" style={{ color: v.color }}>
                {v.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base md:text-lg font-semibold text-white mb-1 md:mb-2">{v.title}</h2>
                <p className="text-white/40 text-xs leading-relaxed mb-2 md:mb-4 line-clamp-2 md:line-clamp-none">{v.desc}</p>
                <div className="flex flex-wrap gap-1 md:gap-1.5 mb-2 md:mb-4">
                  {v.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/10">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-xs text-white/30 group-hover:text-white/60 transition-colors">
                  <span>进入实验</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <p className="text-white/20 text-xs hidden md:block">选择一种视角开始三维交互实验</p>

      <button
        onClick={() => setHelpOpen(true)}
        className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors"
        title="使用帮助"
      >
        <HelpCircle size={18} />
      </button>

      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}