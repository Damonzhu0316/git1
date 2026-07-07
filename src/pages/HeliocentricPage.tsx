import { Suspense, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, BookOpen, Sun, Circle, ChevronLeft, MapPin, Compass, Navigation, Eye, Layers, Calendar, Clock, Menu, X, Settings } from 'lucide-react';
import { useStore } from '@/store/useStore';
import HeliocentricScene from '@/components/Scene/HeliocentricScene';
import GlassButton from '@/components/UI/GlassButton';
import ExamDrawer from '@/components/UI/ExamDrawer';
import KnowledgePanel from '@/components/UI/KnowledgePanel';
import PlaybackControls from '@/components/UI/PlaybackControls';
import MobileNavBar from '@/components/UI/MobileNavBar';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import PerformanceMonitor from '@/components/UI/PerformanceMonitor';
import QualitySettings from '@/components/UI/QualitySettings';
import { getSolarDeclination, getSolarHemisphere, getDeclinationTrend, formatDeclination, getEarthOrbitAngle, getEarthPosition, getPerihelionDate, getAphelionDate } from '@/utils/astronomy';
import { EARTH_ORBIT_RADIUS, ORBIT_ECCENTRICITY } from '@/utils/constants';
import { useTimeControls } from '@/hooks/useTimeControls';
import { getSolarTerms, formatDateDisplay } from '@/data/presets';
import type { CameraPreset } from '@/types';

const PANEL_WIDTH = 224;

const SOLAR_TERM_COLORS: Record<string, string> = {
  '春分': '#44ff88', '夏至': '#ff6644', '秋分': '#ffaa00', '冬至': '#44aaff',
};

const VIEW_PRESETS: { key: CameraPreset; label: string }[] = [
  { key: 'free', label: '自由' }, { key: 'top', label: '俯视' }, { key: 'side', label: '侧视' },
  { key: 'northPole', label: '北极' }, { key: 'equator', label: '赤道' },
];

export default function HeliocentricPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const currentDate = useStore((s) => s.currentDate);
  const setDate = useStore((s) => s.setDate);
  const setActiveView = useStore((s) => s.setActiveView);
  const cameraPreset = useStore((s) => s.cameraPreset);
  const setCameraPreset = useStore((s) => s.setCameraPreset);
  const showEclipticPlane = useStore((s) => s.showEclipticPlane);
  const showSunRay = useStore((s) => s.showSunRay);
  const showEarthAxis = useStore((s) => s.showEarthAxis);
  const showOrbitMarkers = useStore((s) => s.showOrbitMarkers);
  const showEquatorPlaneAtEarth = useStore((s) => s.showEquatorPlaneAtEarth);
  const toggleSetting = useStore((s) => s.toggleSetting);
  const resetScene = useStore((s) => s.resetScene);
  const isExamDrawerOpen = useStore((s) => s.isExamDrawerOpen);
  const setExamDrawerOpen = useStore((s) => s.setExamDrawerOpen);
  const isKnowledgePanelOpen = useStore((s) => s.isKnowledgePanelOpen);
  const setKnowledgePanelOpen = useStore((s) => s.setKnowledgePanelOpen);
  const isMobileRightPanelOpen = useStore((s) => s.isMobileRightPanelOpen);
  const setMobileRightPanelOpen = useStore((s) => s.setMobileRightPanelOpen);

  const panelOffset = !isMobile && isKnowledgePanelOpen ? PANEL_WIDTH : 0;

  useEffect(() => { setActiveView('heliocentric'); }, [setActiveView]);

  useKeyboardShortcuts();

  const { advanceDay, advanceHours } = useTimeControls();

  const decl = getSolarDeclination(currentDate);
  const hemisphere = getSolarHemisphere(decl);
  const trend = getDeclinationTrend(currentDate);
  const orbitAngleRad = getEarthOrbitAngle(currentDate);
  const orbitAngleDeg = ((orbitAngleRad * 180) / Math.PI) % 360;
  const [ex, ey, ez] = getEarthPosition(currentDate);
  const distance = Math.sqrt(ex * ex + ey * ey + ez * ez);
  const { y, m, d, h, min } = formatDateDisplay(currentDate);

  const solarTerms = useMemo(() => getSolarTerms(currentDate.getFullYear()), [currentDate.getFullYear()]);

  const extraDates = useMemo(() => {
    const year = currentDate.getFullYear();
    const peri = getPerihelionDate(year);
    const aph = getAphelionDate(year);
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return [
      { label: `近日点 (${peri.getMonth()+1}月${peri.getDate()}日)`, date: fmt(peri), desc: '距太阳最近' },
      { label: `远日点 (${aph.getMonth()+1}月${aph.getDate()}日)`, date: fmt(aph), desc: '距太阳最远' },
    ];
  }, [currentDate.getFullYear()]);

  // 右侧控制面板内容
  const rightPanelContent = (
    <>
      {/* 1. 当前日期 */}
      <div className="px-2.5 py-2.5 border-b border-white/5 text-center bg-white/[0.02]">
        <div className="flex items-center justify-center gap-1 mb-1"><Calendar size={12} className="text-[#00d4ff]" /><span className="text-[10px] text-white/40">当前日期</span></div>
        <span className="text-sm text-[#00d4ff] font-mono font-semibold">{y}-{m}-{d}</span>
        <span className="text-[10px] text-white/30 ml-1.5">{h}:{min}</span>
      </div>

      {/* 2. 日期调节 */}
      <div className="px-2.5 py-2.5 border-b border-white/5">
        <div className="flex items-center gap-1 mb-2"><Clock size={12} className="text-white/40" /><span className="text-[10px] text-white/40">日期调节</span></div>
        <div className="grid grid-cols-3 gap-1 mb-1">
          <GlassButton onClick={() => advanceDay(-30)} className="text-[10px] py-1">-30天</GlassButton>
          <GlassButton onClick={() => advanceDay(-7)} className="text-[10px] py-1">-7天</GlassButton>
          <GlassButton onClick={() => advanceDay(-1)} className="text-[10px] py-1">-1天</GlassButton>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <GlassButton onClick={() => advanceDay(1)} className="text-[10px] py-1">+1天</GlassButton>
          <GlassButton onClick={() => advanceDay(7)} className="text-[10px] py-1">+7天</GlassButton>
          <GlassButton onClick={() => advanceDay(30)} className="text-[10px] py-1">+30天</GlassButton>
        </div>
      </div>

      {/* 3. 时刻调节 */}
      <div className="px-2.5 py-2.5 border-b border-white/5">
        <div className="flex items-center gap-1 mb-2"><span className="text-[10px] text-white/40">时刻调节</span></div>
        <div className="grid grid-cols-4 gap-1">
          <GlassButton onClick={() => advanceHours(-1)} className="text-[10px] py-1">-1h</GlassButton>
          <GlassButton onClick={() => advanceHours(1)} className="text-[10px] py-1">+1h</GlassButton>
          <GlassButton onClick={() => advanceHours(-6)} className="text-[10px] py-1">-6h</GlassButton>
          <GlassButton onClick={() => advanceHours(6)} className="text-[10px] py-1">+6h</GlassButton>
        </div>
      </div>

      {/* 4. 二分二至 */}
      <div className="px-2.5 py-2.5 border-b border-white/5">
        <div className="flex items-center gap-1 mb-2"><Sun size={12} className="text-[#f0c060]" /><span className="text-[10px] text-white/40">二分二至</span></div>
        <div className="space-y-1">
          {solarTerms.map((term) => (
            <GlassButton key={term.label} className="w-full justify-start" onClick={() => setDate(new Date(term.date))}>
              <span className="w-2 h-2 rounded-full inline-block mr-1.5 flex-shrink-0" style={{ backgroundColor: SOLAR_TERM_COLORS[term.label] }} />
              <span className="text-xs">{term.label}</span>
            </GlassButton>
          ))}
        </div>
      </div>

      {/* 5. 轨道特殊点 */}
      <div className="px-2.5 py-2.5 border-b border-white/5">
        <div className="flex items-center gap-1 mb-2"><Navigation size={12} className="text-[#ffdd44]" /><span className="text-[10px] text-white/40">轨道特殊点</span></div>
        <div className="space-y-1">
          {extraDates.map((pt) => (
            <GlassButton key={pt.label} className="w-full justify-start" variant="gold" onClick={() => setDate(new Date(pt.date))}>
              <span className="text-xs">{pt.label}</span>
            </GlassButton>
          ))}
        </div>
      </div>

      {/* 6. 视图预设 */}
      <div className="px-2.5 py-2.5 border-b border-white/5">
        <div className="flex items-center gap-1 mb-2"><Eye size={12} className="text-white/40" /><span className="text-[10px] text-white/40">视图预设</span></div>
        <div className="grid grid-cols-2 gap-1">
          {VIEW_PRESETS.map((p) => (
            <GlassButton key={p.key} className="justify-center text-[10px] py-1" active={cameraPreset === p.key} onClick={() => setCameraPreset(p.key)}>{p.label}</GlassButton>
          ))}
        </div>
      </div>

      {/* 7. 叠加层 */}
      <div className="px-2.5 py-2.5">
        <div className="flex items-center gap-1 mb-2"><Layers size={12} className="text-white/40" /><span className="text-[10px] text-white/40">叠加层</span></div>
        <div className="space-y-1">
          <GlassButton className="w-full justify-start" active={showEclipticPlane} onClick={() => toggleSetting('showEclipticPlane')}><Circle size={12} className="text-[#44aaff]" /><span className="text-xs ml-1.5">黄道面</span></GlassButton>
          <GlassButton className="w-full justify-start" active={showSunRay} onClick={() => toggleSetting('showSunRay')}><Sun size={12} className="text-[#ffdd44]" /><span className="text-xs ml-1.5">太阳光线</span></GlassButton>
          <GlassButton className="w-full justify-start" active={showEarthAxis} onClick={() => toggleSetting('showEarthAxis')}><Navigation size={12} className="text-[#ff6644]" /><span className="text-xs ml-1.5">地轴</span></GlassButton>
          <GlassButton className="w-full justify-start" active={showEquatorPlaneAtEarth} onClick={() => toggleSetting('showEquatorPlaneAtEarth')}><Circle size={12} className="text-[#ff4444]" /><span className="text-xs ml-1.5">赤道面（地球处）</span></GlassButton>
          <GlassButton className="w-full justify-start" active={showOrbitMarkers} onClick={() => toggleSetting('showOrbitMarkers')}><MapPin size={12} className="text-[#ffcc00]" /><span className="text-xs ml-1.5">轨道标记点</span></GlassButton>
        </div>
      </div>
    </>
  );

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0e27]">
      <KnowledgePanel />
      <Suspense fallback={<div className="flex items-center justify-center h-full text-[#00d4ff]">加载中...</div>}>
        <HeliocentricScene />
      </Suspense>

      {/* 顶部栏 */}
      <div className="fixed top-0 z-50 h-12 bg-[#0a0e27]/85 backdrop-blur-md border-b border-white/10 px-3 flex items-center justify-between transition-all duration-300" style={{ left: `${panelOffset}px`, right: 0 }}>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')} className="text-white/60 hover:text-white transition-colors"><ChevronLeft size={18} /></button>
          <span className="text-white/15 text-[10px] hidden sm:inline">首页 /</span>
          {isMobile && (
            <button onClick={() => setKnowledgePanelOpen(!isKnowledgePanelOpen)} className="text-white/60 hover:text-white transition-colors" style={{ minWidth: 32, minHeight: 32 }}>
              <Menu size={18} />
            </button>
          )}
          <h1 className="text-sm font-bold text-[#f0c060] tracking-wide truncate">{isMobile ? '日心视角' : '日心视角 · 公转与黄赤交角'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <GlassButton onClick={resetScene}><RotateCcw size={14} /><span className="text-xs hidden sm:inline">重置</span></GlassButton>
          <QualitySettings />
          {isMobile && (
            <GlassButton onClick={() => setMobileRightPanelOpen(!isMobileRightPanelOpen)} active={isMobileRightPanelOpen}>
              <Settings size={14} />
            </GlassButton>
          )}
          <GlassButton onClick={() => setExamDrawerOpen(!isExamDrawerOpen)} active={isExamDrawerOpen} variant="gold">
            <BookOpen size={14} /><span className="text-xs hidden sm:inline">题库</span>
          </GlassButton>
        </div>
      </div>

      {/* 左侧实时数据卡 - 桌面端 */}
      {!isMobile && (
        <div className="fixed top-20 z-40 bg-[#0a0e27]/80 backdrop-blur-md border border-white/8 rounded-xl px-3.5 py-3 w-44 shadow-lg transition-all duration-300" style={{ left: `${panelOffset + 16}px` }}>
          <div className="flex items-center gap-1.5 mb-2.5 border-b border-white/5 pb-2">
            <Compass size={12} className="text-[#f0c060]" />
            <span className="text-[11px] font-semibold text-white/60">轨道数据</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between"><span className="text-[10px] text-white/40">太阳直射点</span><span className="text-[11px] text-[#ffdd44] font-mono">{formatDeclination(decl)}</span></div>
            <div className="flex items-center justify-between"><span className="text-[10px] text-white/40">直射半球</span><span className="text-[11px] text-white/60">{hemisphere}</span></div>
            <div className="flex items-center justify-between"><span className="text-[10px] text-white/40">移动方向</span><span className="text-[11px] text-white/60">{trend}</span></div>
            <div className="flex items-center justify-between"><span className="text-[10px] text-white/40">轨道角度</span><span className="text-[11px] text-[#44ff88] font-mono">{orbitAngleDeg.toFixed(1)}°</span></div>
            <div className="flex items-center justify-between"><span className="text-[10px] text-white/40">日地距离</span><span className="text-[11px] text-white/60 font-mono">{distance.toFixed(2)} AU</span></div>
          </div>
        </div>
      )}

      {/* 右侧控制面板 - 桌面端 */}
      {!isExamDrawerOpen && !isMobile && (
        <div className="fixed right-0 z-40 w-52 bg-[#0a0e27]/85 backdrop-blur-md border-l border-white/8 flex flex-col overflow-y-auto shadow-lg" style={{ top: 49, bottom: 28 }}>
          {rightPanelContent}
        </div>
      )}

      {/* 右侧控制面板 - 移动端抽屉 */}
      {isMobile && (
        <>
          {isMobileRightPanelOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm mobile-overlay" onClick={() => setMobileRightPanelOpen(false)} />
          )}
          <div
            className={`fixed right-0 top-0 bottom-0 z-50 w-64 bg-[#0a0e27]/95 backdrop-blur-md border-l border-white/10 flex flex-col overflow-y-auto shadow-2xl transition-transform duration-300 ${
              isMobileRightPanelOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between px-3 py-3 border-b border-white/10">
              <span className="text-xs font-semibold text-[#f0c060]">控制面板</span>
              <button onClick={() => setMobileRightPanelOpen(false)} className="text-white/40 hover:text-white p-1">
                <X size={16} />
              </button>
            </div>
            {rightPanelContent}
          </div>
        </>
      )}

      {/* 底部信息栏 - 桌面端 */}
      {!isMobile && (
        <div className="fixed bottom-0 z-50 bg-[#0a0e27]/85 backdrop-blur-md border-t border-white/8 px-3 py-1 flex items-center gap-3 text-[10px] overflow-x-auto transition-all duration-300" style={{ left: `${panelOffset}px`, right: '208px' }}>
          <span className="text-white/30">日期</span><span className="text-white/60 font-mono">{y}-{m}-{d} {h}:{min}</span>
          <span className="text-white/20">|</span>
          <span className="text-white/30">直射点</span><span className="text-[#ffdd44] font-mono">{formatDeclination(decl)}</span><span className="text-white/60">{hemisphere}</span>
          <span className="text-white/20">|</span>
          <span className="text-white/30">移动</span><span className="text-white/60">{trend}</span>
          <span className="text-white/20">|</span>
          <span className="text-white/30">轨道角度</span><span className="text-[#44ff88] font-mono">{orbitAngleDeg.toFixed(1)}°</span>
          <span className="text-white/20">|</span>
          <span className="text-white/30">日地距离</span><span className="text-white/60 font-mono">{distance.toFixed(2)} AU</span>
          <span className="text-white/20">|</span>
          <span className="text-white/30">参数</span><span className="text-white/50">半长轴{EARTH_ORBIT_RADIUS} · e={ORBIT_ECCENTRICITY} · 黄赤交角23.44°</span>
          <span className="text-white/20 ml-auto">拖拽旋转 · 滚轮缩放 · 右侧面板控制叠加层</span>
          <PlaybackControls />
        </div>
      )}

      {/* 移动端底部精简数据栏 */}
      {isMobile && (
        <div className="fixed bottom-10 z-40 left-0 right-0 bg-[#0a0e27]/85 backdrop-blur-md border-t border-white/8 px-2 py-0.5 flex items-center gap-2 text-[9px] overflow-x-auto">
          <span className="text-white/60 font-mono shrink-0">{y}-{m}-{d}</span>
          <span className="text-white/20 shrink-0">|</span>
          <span className="text-[#ffdd44] font-mono shrink-0">{formatDeclination(decl)}</span>
          <span className="text-white/20 shrink-0">|</span>
          <span className="text-[#44ff88] font-mono shrink-0">{orbitAngleDeg.toFixed(1)}°</span>
          <span className="text-white/20 shrink-0">|</span>
          <span className="text-white/60 font-mono shrink-0">{distance.toFixed(2)} AU</span>
          <span className="text-white/20 ml-auto shrink-0">|</span>
          <PlaybackControls />
        </div>
      )}

      {/* 移动端底部导航 */}
      {isMobile && <MobileNavBar />}

      <ExamDrawer />

      <PerformanceMonitor />
    </div>
  );
}