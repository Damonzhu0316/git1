import { Suspense, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, BookOpen, ChevronLeft, Menu, Settings, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import SurfaceScene from '@/components/Scene/SurfaceScene';
import GlassButton from '@/components/UI/GlassButton';
import ExamDrawer from '@/components/UI/ExamDrawer';
import KnowledgePanel from '@/components/UI/KnowledgePanel';
import PlaybackControls from '@/components/UI/PlaybackControls';
import MobileNavBar from '@/components/UI/MobileNavBar';
import SurfaceRightPanel from '@/components/UI/SurfaceRightPanel';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import PerformanceMonitor from '@/components/UI/PerformanceMonitor';
import QualitySettings from '@/components/UI/QualitySettings';
import { getSolarDeclination, getDayLength, getNoonSolarAltitude, getSolarHemisphere, formatDeclination, getSunriseHour, getSunsetHour, formatHour, getSunSkyPosition } from '@/utils/astronomy';
import { formatDateDisplay, formatLatLabel, formatLonLabel } from '@/data/presets';

const PANEL_WIDTH = 224;
const RIGHT_PANEL_WIDTH = 256;

export default function SurfacePage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const currentDate = useStore((s) => s.currentDate);
  const resetScene = useStore((s) => s.resetScene);
  const isExamDrawerOpen = useStore((s) => s.isExamDrawerOpen);
  const setExamDrawerOpen = useStore((s) => s.setExamDrawerOpen);
  const targetLatitude = useStore((s) => s.targetLatitude);
  const targetLongitude = useStore((s) => s.targetLongitude);
  const setActiveView = useStore((s) => s.setActiveView);
  const isKnowledgePanelOpen = useStore((s) => s.isKnowledgePanelOpen);
  const setKnowledgePanelOpen = useStore((s) => s.setKnowledgePanelOpen);
  const isMobileRightPanelOpen = useStore((s) => s.isMobileRightPanelOpen);
  const setMobileRightPanelOpen = useStore((s) => s.setMobileRightPanelOpen);

  const panelOffset = !isMobile && isKnowledgePanelOpen ? PANEL_WIDTH : 0;

  useEffect(() => { setActiveView('surface'); }, [setActiveView]);

  useKeyboardShortcuts();

  const decl = getSolarDeclination(currentDate);
  const dayLen = getDayLength(targetLatitude, decl);
  const noonAlt = getNoonSolarAltitude(targetLatitude, decl);
  const hemisphere = getSolarHemisphere(decl);
  const sunrise = getSunriseHour(targetLatitude, decl);
  const sunset = getSunsetHour(targetLatitude, decl);
  const { altitude: sunAlt, azimuth: sunAz } = getSunSkyPosition(currentDate, targetLatitude, targetLongitude);
  const sunAltDeg = (sunAlt * 180) / Math.PI;
  const sunAzDeg = ((sunAz * 180) / Math.PI + 360) % 360;
  const { y, m, d, h, min } = formatDateDisplay(currentDate);
  const latLabel = formatLatLabel(targetLatitude);
  const lonLabel = formatLonLabel(targetLongitude);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0e27]">
      <KnowledgePanel />
      <Suspense fallback={<div className="flex items-center justify-center h-full text-[#00d4ff]">加载中...</div>}>
        <SurfaceScene />
      </Suspense>

      {/* 顶部栏 */}
      <div className="fixed top-0 z-50 h-12 bg-[#0a0e27]/85 backdrop-blur-md border-b border-white/10 px-3 flex items-center justify-between transition-all duration-300"
        style={{ left: `${panelOffset}px`, right: `${!isMobile && isExamDrawerOpen ? 0 : !isMobile ? RIGHT_PANEL_WIDTH : 0}px` }}>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')} className="text-white/60 hover:text-white transition-colors"><ChevronLeft size={18} /></button>
          <span className="text-white/15 text-[10px] hidden sm:inline">首页 /</span>
          {isMobile && (
            <button onClick={() => setKnowledgePanelOpen(!isKnowledgePanelOpen)} className="text-white/60 hover:text-white transition-colors" style={{ minWidth: 32, minHeight: 32 }}>
              <Menu size={18} />
            </button>
          )}
          <h1 className="text-sm font-bold text-[#f0c060] tracking-wide truncate">{isMobile ? '地表视角' : '地表视角 · 太阳周日视运动'}</h1>
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

      {/* 右侧控制面板 - 桌面端 */}
      {!isExamDrawerOpen && !isMobile && (
        <div className="fixed right-0 z-40 bg-[#0a0e27]/85 backdrop-blur-md border-l border-white/10 flex flex-col transition-all duration-300"
          style={{ width: `${RIGHT_PANEL_WIDTH}px`, top: 49, bottom: 28 }}>
          <SurfaceRightPanel />
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
            <SurfaceRightPanel />
          </div>
        </>
      )}

      {/* 底部信息栏 - 桌面端 */}
      {!isMobile && (
        <div className="fixed bottom-0 z-50 bg-[#0a0e27]/85 backdrop-blur-md border-t border-white/10 px-3 py-1 flex items-center gap-3 text-[10px] overflow-x-auto transition-all duration-300"
          style={{ left: `${panelOffset}px`, right: `${isExamDrawerOpen ? 0 : RIGHT_PANEL_WIDTH}px` }}>
          <span className="text-white/40 shrink-0">观测点</span><span className="text-white/60 font-mono shrink-0">{latLabel} {lonLabel}</span>
          <span className="text-white/30 shrink-0">|</span>
          <span className="text-white/40 shrink-0">直射点</span><span className="text-white/60 font-mono shrink-0">{formatDeclination(decl)} {hemisphere}</span>
          <span className="text-white/30 shrink-0">|</span>
          <span className="text-white/40 shrink-0">昼长</span><span className="text-white/60 font-mono shrink-0">{formatHour(dayLen)}</span>
          <span className="text-white/30 shrink-0">|</span>
          <span className="text-white/40 shrink-0">正午高度</span><span className="text-white/60 font-mono shrink-0">{noonAlt.toFixed(1)}°</span>
          <span className="text-white/30 shrink-0">|</span>
          <span className="text-white/40 shrink-0">日出/日落</span><span className="text-white/60 font-mono shrink-0">{formatHour(sunrise)} / {formatHour(sunset)}</span>
          <span className="text-white/30 shrink-0">|</span>
          <span className="text-white/40 shrink-0">高度角</span><span className="text-[#ffdd44] font-mono shrink-0">{sunAltDeg.toFixed(1)}°</span>
          <span className="text-white/40 shrink-0">方位角</span><span className="text-[#44ff88] font-mono shrink-0">{sunAzDeg.toFixed(1)}°</span>
          <span className="text-white/20 ml-auto shrink-0 hidden sm:inline">拖拽旋转 · 右侧面板调节参数</span>
          <PlaybackControls />
        </div>
      )}

      {/* 移动端底部精简数据栏 */}
      {isMobile && (
        <div className="fixed bottom-10 z-40 left-0 right-0 bg-[#0a0e27]/85 backdrop-blur-md border-t border-white/8 px-2 py-0.5 flex items-center gap-2 text-[9px] overflow-x-auto">
          <span className="text-white/60 font-mono shrink-0">{latLabel} {lonLabel}</span>
          <span className="text-white/20 shrink-0">|</span>
          <span className="text-[#ffdd44] font-mono shrink-0">{sunAltDeg.toFixed(1)}°</span>
          <span className="text-white/20 shrink-0">|</span>
          <span className="text-[#44ff88] font-mono shrink-0">{sunAzDeg.toFixed(1)}°</span>
          <span className="text-white/20 shrink-0">|</span>
          <span className="text-white/60 font-mono shrink-0">{formatHour(dayLen)}</span>
          <span className="text-white/20 shrink-0">|</span>
          <span className="text-white/60 font-mono shrink-0">{formatHour(sunrise)}/{formatHour(sunset)}</span>
          <span className="text-white/20 ml-auto shrink-0">|</span>
          <PlaybackControls />
        </div>
      )}

      {isMobile && <MobileNavBar />}
      <ExamDrawer />

      <PerformanceMonitor />
    </div>
  );
}