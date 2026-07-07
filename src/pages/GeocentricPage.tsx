import { Suspense, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, BookOpen, ChevronLeft, Sun, Circle, Grid3X3, MapPin, Globe, Clock, Compass, ArrowUp, Waves, Ruler, Plane, Menu, Settings, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import GeocentricScene from '@/components/Scene/GeocentricScene';
import GlassButton from '@/components/UI/GlassButton';
import ExamDrawer from '@/components/UI/ExamDrawer';
import KnowledgePanel from '@/components/UI/KnowledgePanel';
import PlaybackControls from '@/components/UI/PlaybackControls';
import MobileNavBar from '@/components/UI/MobileNavBar';
import TimeSlider from '@/components/UI/TimeSlider';
import DateSlider from '@/components/UI/DateSlider';
import FormulaPanel from '@/components/UI/FormulaPanel';
import { FlightTimePanel } from '@/components/Scene/FlightTimeDemo';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import PerformanceMonitor from '@/components/UI/PerformanceMonitor';
import QualitySettings from '@/components/UI/QualitySettings';
import { getSolarDeclination, getDayLength, getNoonSolarAltitude, getSolarHemisphere, getDeclinationTrend, formatDeclination, getSunriseHour, getSunsetHour, formatHour, getSunSkyPosition } from '@/utils/astronomy';
import { getSolarTerms, formatDateDisplay, formatLatLabel, formatLonLabel } from '@/data/presets';
import type { CameraPreset } from '@/types';

const PANEL_WIDTH = 224;

export default function GeocentricPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const currentDate = useStore((s) => s.currentDate);
  const setDate = useStore((s) => s.setDate);
  const setActiveView = useStore((s) => s.setActiveView);
  const cameraPreset = useStore((s) => s.cameraPreset);
  const setCameraPreset = useStore((s) => s.setCameraPreset);
  const showTerminator = useStore((s) => s.showTerminator);
  const showEquatorPlane = useStore((s) => s.showEquatorPlane);
  const showGridLines = useStore((s) => s.showGridLines);
  const showDayNightArc = useStore((s) => s.showDayNightArc);
  const showSolarAltitude = useStore((s) => s.showSolarAltitude);
  const showLocalTime = useStore((s) => s.showLocalTime);
  const toggleSetting = useStore((s) => s.toggleSetting);
  const resetScene = useStore((s) => s.resetScene);
  const isExamDrawerOpen = useStore((s) => s.isExamDrawerOpen);
  const setExamDrawerOpen = useStore((s) => s.setExamDrawerOpen);
  const targetLatitude = useStore((s) => s.targetLatitude);
  const targetLongitude = useStore((s) => s.targetLongitude);
  const setTargetLatitude = useStore((s) => s.setTargetLatitude);
  const setTargetLongitude = useStore((s) => s.setTargetLongitude);
  const isKnowledgePanelOpen = useStore((s) => s.isKnowledgePanelOpen);
  const setKnowledgePanelOpen = useStore((s) => s.setKnowledgePanelOpen);
  const isMobileRightPanelOpen = useStore((s) => s.isMobileRightPanelOpen);
  const setMobileRightPanelOpen = useStore((s) => s.setMobileRightPanelOpen);

  const panelOffset = !isMobile && isKnowledgePanelOpen ? PANEL_WIDTH : 0;

  useEffect(() => { setActiveView('geocentric'); }, [setActiveView]);

  useKeyboardShortcuts();

  const [latInput, setLatInput] = useState(String(targetLatitude));
  const [lonInput, setLonInput] = useState(String(targetLongitude));

  const handleLatSubmit = () => {
    const v = parseFloat(latInput);
    if (!isNaN(v)) { const c = Math.max(-90, Math.min(90, v)); setTargetLatitude(c); setLatInput(String(c)); }
  };

  const handleLonSubmit = () => {
    const v = parseFloat(lonInput);
    if (!isNaN(v)) { const c = Math.max(-180, Math.min(180, v)); setTargetLongitude(c); setLonInput(String(c)); }
  };

  const decl = getSolarDeclination(currentDate);
  const dayLen = getDayLength(targetLatitude, decl);
  const noonAlt = getNoonSolarAltitude(targetLatitude, decl);
  const hemisphere = getSolarHemisphere(decl);
  const trend = getDeclinationTrend(currentDate);
  const sunrise = getSunriseHour(targetLatitude, decl);
  const sunset = getSunsetHour(targetLatitude, decl);

  const { altitude: sunAlt, azimuth: sunAz } = getSunSkyPosition(currentDate, targetLatitude, targetLongitude);
  const sunAltDeg = (sunAlt * 180) / Math.PI;
  const sunAzDeg = ((sunAz * 180) / Math.PI + 360) % 360;
  const isAboveHorizon = sunAlt > 0;

  const solarTerms = useMemo(() => getSolarTerms(currentDate.getFullYear()), [currentDate.getFullYear()]);

  const { y, m, d, h, min } = formatDateDisplay(currentDate);
  const latLabel = formatLatLabel(targetLatitude);
  const lonLabel = formatLonLabel(targetLongitude);

  const rightPanelContent = (
    <>
      <div className="px-3 py-2 border-b border-white/10">
        <span className="text-xs font-semibold text-[#f0c060] tracking-wide">时间与位置</span>
      </div>

      <div className="px-2 py-2 text-center border-b border-white/10">
        <div className="text-[10px] text-white/40 mb-0.5">当前日期</div>
        <span className="text-xs text-[#00d4ff] font-mono">{y}-{m}-{d} {h}:{min}</span>
      </div>

      <DateSlider />
      <TimeSlider />

      <div className="px-2 py-2 border-b border-white/10">
        <div className="text-[10px] text-white/40 mb-1 text-center">二分二至</div>
        <div className="grid grid-cols-2 gap-1">
          {solarTerms.map((term) => (
            <GlassButton key={term.label} className="justify-center text-[10px] py-1" active={currentDate.getMonth() === new Date(term.date).getMonth() && currentDate.getDate() === new Date(term.date).getDate()} onClick={() => setDate(new Date(term.date))}>
              <Sun size={12} className="text-[#f0c060] mr-0.5" />{term.label}
            </GlassButton>
          ))}
        </div>
      </div>

      <div className="px-2 py-2 border-b border-white/10">
        <div className="text-[10px] text-white/40 mb-1 text-center"><MapPin size={12} className="inline mr-1" />纬度</div>
        <div className="flex items-center gap-1 mb-1">
          <input type="number" value={latInput} onChange={(e) => setLatInput(e.target.value)} onBlur={handleLatSubmit} onKeyDown={(e) => e.key === 'Enter' && handleLatSubmit()} className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white/80 font-mono outline-none" step="0.5" />
          <span className="text-[10px] text-white/50 font-mono w-5 text-center">{targetLatitude >= 0 ? 'N' : 'S'}</span>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {[
            { label: '赤道', lat: 0 },
            { label: '北回归线', lat: 23.5 },
            { label: '北纬40°(北京)', lat: 40 },
            { label: '南回归线', lat: -23.5 },
            { label: '北极圈', lat: 66.5 },
            { label: '南极圈', lat: -66.5 },
          ].map((p) => (
            <GlassButton key={p.label} active={targetLatitude === p.lat} className="w-full justify-center text-[10px] py-1" onClick={() => { setTargetLatitude(p.lat); setLatInput(String(p.lat)); }}>{p.label}</GlassButton>
          ))}
        </div>
      </div>

      <div className="px-2 py-2 border-b border-white/10">
        <div className="text-[10px] text-white/40 mb-1 text-center"><Globe size={12} className="inline mr-1" />经度</div>
        <div className="flex items-center gap-1 mb-1">
          <input type="number" value={lonInput} onChange={(e) => setLonInput(e.target.value)} onBlur={handleLonSubmit} onKeyDown={(e) => e.key === 'Enter' && handleLonSubmit()} className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white/80 font-mono outline-none" step="1" />
          <span className="text-[10px] text-white/50 font-mono w-5 text-center">{targetLongitude >= 0 ? 'E' : 'W'}</span>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {[
            { label: '北京', lon: 116 },
            { label: '纽约', lon: -74 },
            { label: '伦敦', lon: 0 },
            { label: '东京', lon: 140 },
          ].map((p) => (
            <GlassButton key={p.label} active={targetLongitude === p.lon} className="w-full justify-center text-[10px] py-1" onClick={() => { setTargetLongitude(p.lon); setLonInput(String(p.lon)); }}>{p.label}</GlassButton>
          ))}
        </div>
      </div>

      <div className="px-2 py-2 border-b border-white/10">
        <div className="text-[10px] text-white/40 mb-1 text-center">视图预设</div>
        <div className="grid grid-cols-2 gap-1">
          {[
            { key: 'free' as CameraPreset, label: '自由' },
            { key: 'top' as CameraPreset, label: '俯视' },
            { key: 'side' as CameraPreset, label: '侧视' },
            { key: 'northPole' as CameraPreset, label: '北极' },
            { key: 'equator' as CameraPreset, label: '赤道' },
          ].map((p) => (
            <GlassButton key={p.key} className="justify-center text-[10px] py-1" active={cameraPreset === p.key} onClick={() => setCameraPreset(p.key)}>
              {p.label}
            </GlassButton>
          ))}
        </div>
      </div>

      <div className="px-2 py-2 border-b border-white/10">
        <div className="text-[10px] text-white/40 mb-1 text-center">叠加层</div>
        <GlassButton className="w-full mb-1 justify-start" active={showTerminator} onClick={() => toggleSetting('showTerminator')}>
          <Sun size={14} className="text-[#f0c060]" /><span className="text-xs ml-1 truncate">晨昏线</span>
        </GlassButton>
        <GlassButton className="w-full mb-1 justify-start" active={showEquatorPlane} onClick={() => toggleSetting('showEquatorPlane')}>
          <Circle size={14} className="text-[#ff4444]" /><span className="text-xs ml-1 truncate">赤道面</span>
        </GlassButton>
        <GlassButton className="w-full mb-1 justify-start" active={showGridLines} onClick={() => toggleSetting('showGridLines')}>
          <Grid3X3 size={14} className="text-[#44ff88]" /><span className="text-xs ml-1 truncate">经纬网</span>
        </GlassButton>
        <GlassButton className="w-full mb-1 justify-start" active={showDayNightArc} onClick={() => toggleSetting('showDayNightArc')}>
          <Waves size={14} className="text-[#ffaa33]" /><span className="text-xs ml-1 truncate">昼弧/夜弧</span>
        </GlassButton>
        <GlassButton className="w-full mb-1 justify-start" active={showSolarAltitude} onClick={() => toggleSetting('showSolarAltitude')}>
          <Ruler size={14} className="text-[#ffdd44]" /><span className="text-xs ml-1 truncate">太阳高度角</span>
        </GlassButton>
        <GlassButton className="w-full mb-1 justify-start" active={showLocalTime} onClick={() => toggleSetting('showLocalTime')}>
          <Clock size={14} className="text-[#00d4ff]" /><span className="text-xs ml-1 truncate">地方时</span>
        </GlassButton>
        <GlassButton className="w-full mb-1 justify-start" active={useStore((s) => s.showFlightTime)} onClick={() => toggleSetting('showFlightTime')}>
          <Plane size={14} className="text-[#ff88cc]" /><span className="text-xs ml-1 truncate">飞行时间</span>
        </GlassButton>
      </div>

      <FormulaPanel />
      <FlightTimePanel />
    </>
  );

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0e27]">
      <KnowledgePanel />
      <Suspense fallback={<div className="flex items-center justify-center h-full text-[#00d4ff]">加载中...</div>}>
        <GeocentricScene />
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
          <h1 className="text-sm font-bold text-[#f0c060] tracking-wide truncate">{isMobile ? '地心视角' : '地心视角 · 自转与昼夜'}</h1>
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
        <div className="fixed top-20 z-40 bg-[#0a0e27]/75 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2.5 w-44 transition-all duration-300" style={{ left: `${panelOffset + 16}px` }}>
          <div className="text-[10px] text-white/40 mb-1.5 text-center">观测数据</div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-white/50"><MapPin size={10} className="inline mr-0.5" />观测点</span>
            <span className="text-xs text-white/60 font-mono">{latLabel} {lonLabel}</span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-white/50"><ArrowUp size={10} className="inline mr-0.5" />太阳高度</span>
            <span className={`text-xs font-mono ${isAboveHorizon ? 'text-[#ffdd44]' : 'text-white/30'}`}>{sunAltDeg.toFixed(1)}°</span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-white/50"><Compass size={10} className="inline mr-0.5" />太阳方位</span>
            <span className="text-xs text-[#44ff88] font-mono">{sunAzDeg.toFixed(1)}°</span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-white/50">直射点</span>
            <span className="text-xs text-[#ffdd44] font-mono">{formatDeclination(decl)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/50">直射移动</span>
            <span className="text-xs text-white/60">{trend}</span>
          </div>
        </div>
      )}

      {/* 右侧控制面板 - 桌面端 */}
      {!isExamDrawerOpen && !isMobile && (
        <div className="fixed right-0 z-40 w-56 bg-[#0a0e27]/80 backdrop-blur-md border-l border-white/10 flex flex-col overflow-y-auto" style={{ top: 49, bottom: 28 }}>
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
        <div className="fixed bottom-0 z-50 bg-[#0a0e27]/80 backdrop-blur-md border-t border-white/10 px-3 py-1 flex items-center gap-3 text-[10px] overflow-x-auto transition-all duration-300" style={{ left: `${panelOffset}px`, right: '224px' }}>
          <span className="text-white/40">观测点</span><span className="text-white/60 font-mono">{latLabel} {lonLabel}</span>
          <span className="text-white/40">|</span>
          <span className="text-white/40">直射点</span><span className="text-white/60 font-mono">{formatDeclination(decl)} {hemisphere}</span>
          <span className="text-white/40">|</span>
          <span className="text-white/40">移动</span><span className="text-white/60">{trend}</span>
          <span className="text-white/40">|</span>
          <span className="text-white/40">昼长</span><span className="text-white/60 font-mono">{formatHour(dayLen)}</span>
          <span className="text-white/40">|</span>
          <span className="text-white/40">正午太阳高度</span><span className="text-white/60 font-mono">{noonAlt.toFixed(1)}°</span>
          <span className="text-white/40">|</span>
          <span className="text-white/40">日出/日落</span>
          <span className="text-white/60 font-mono">{formatHour(sunrise)} / {formatHour(sunset)}</span>
          <span className="text-white/40">|</span>
          <span className="text-white/40">当前高度</span><span className="text-[#ffdd44] font-mono">{sunAltDeg.toFixed(1)}°</span>
          <span className="text-white/40">方位</span><span className="text-[#44ff88] font-mono">{sunAzDeg.toFixed(1)}°</span>
          <span className="text-white/30 ml-auto">拖拽旋转 · 右侧时刻按钮看昼夜变化</span>
          <PlaybackControls />
        </div>
      )}

      {/* 移动端底部精简数据栏 */}
      {isMobile && (
        <div className="fixed bottom-10 z-40 left-0 right-0 bg-[#0a0e27]/85 backdrop-blur-md border-t border-white/8 px-2 py-0.5 flex items-center gap-2 text-[9px] overflow-x-auto">
          <span className="text-white/60 font-mono shrink-0">{latLabel} {lonLabel}</span>
          <span className="text-white/20 shrink-0">|</span>
          <span className="text-[#ffdd44] font-mono shrink-0">{formatDeclination(decl)}</span>
          <span className="text-white/20 shrink-0">|</span>
          <span className="text-white/60 font-mono shrink-0">{formatHour(dayLen)}</span>
          <span className="text-white/20 shrink-0">|</span>
          <span className="text-white/60 font-mono shrink-0">{noonAlt.toFixed(1)}°</span>
          <span className="text-white/20 shrink-0">|</span>
          <span className="text-[#ffdd44] font-mono shrink-0">{sunAltDeg.toFixed(1)}°</span>
          <span className="text-white/20 shrink-0">|</span>
          <span className="text-[#44ff88] font-mono shrink-0">{sunAzDeg.toFixed(1)}°</span>
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