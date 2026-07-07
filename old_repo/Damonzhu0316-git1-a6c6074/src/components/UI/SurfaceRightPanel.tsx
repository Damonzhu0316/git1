import React, { useState, useMemo } from 'react';
import {
  Clock, MapPin, Globe, Sun, ChevronDown, ChevronUp, Ruler, Calculator,
  ArrowUp, Compass, Building2, PanelTop, Watch, Camera
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import GlassButton from './GlassButton';
import {
  getSolarDeclination, getDayLength, getNoonSolarAltitude,
  getSolarHemisphere, formatDeclination, getSunriseHour, getSunsetHour,
  formatHour, getSunSkyPosition, getEquinoxSolsticeDates
} from '@/utils/astronomy';
import { getSolarTerms, LAT_PRESETS, LON_PRESETS, getSnapshotPresets, formatDateDisplay, formatLatLabel, formatLonLabel } from '@/data/presets';
import { useTimeControls } from '@/hooks/useTimeControls';

/* ========== 可折叠区块 ========== */
function Section({ title, icon, defaultOpen = true, children }: {
  title: string; icon: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/8">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-white/55 hover:text-white/90 hover:bg-white/5 transition-colors"
      >
        {icon}
        <span className="flex-1 text-left truncate">{title}</span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && <div className="px-2.5 pb-1.5">{children}</div>}
    </div>
  );
}

/* ========== 主面板 ========== */
export default function SurfaceRightPanel() {
  const currentDate = useStore((s) => s.currentDate);
  const setDate = useStore((s) => s.setDate);
  const targetLatitude = useStore((s) => s.targetLatitude);
  const targetLongitude = useStore((s) => s.targetLongitude);
  const setTargetLatitude = useStore((s) => s.setTargetLatitude);
  const setTargetLongitude = useStore((s) => s.setTargetLongitude);
  const solarAppMode = useStore((s) => s.solarAppMode);
  const setSolarAppMode = useStore((s) => s.setSolarAppMode);

  const { advanceDay, advanceHours, advanceMinutes, setHour } = useTimeControls();

  const [latInput, setLatInput] = useState(String(targetLatitude));
  const [lonInput, setLonInput] = useState(String(targetLongitude));
  const [poleHeight, setPoleHeight] = useState(3); // 标杆高度（米）

  const handleLatSubmit = () => {
    const v = parseFloat(latInput);
    if (!isNaN(v)) { const c = Math.max(-90, Math.min(90, v)); setTargetLatitude(c); setLatInput(String(c)); }
  };
  const handleLonSubmit = () => {
    const v = parseFloat(lonInput);
    if (!isNaN(v)) { const c = Math.max(-180, Math.min(180, v)); setTargetLongitude(c); setLonInput(String(c)); }
  };

  // 天文计算
  const decl = getSolarDeclination(currentDate);
  const dayLen = getDayLength(targetLatitude, decl);
  const noonAlt = getNoonSolarAltitude(targetLatitude, decl);
  const hemisphere = getSolarHemisphere(decl);
  const sunrise = getSunriseHour(targetLatitude, decl);
  const sunset = getSunsetHour(targetLatitude, decl);
  const { altitude: sunAlt, azimuth: sunAz } = getSunSkyPosition(currentDate, targetLatitude, targetLongitude);
  const sunAltDeg = (sunAlt * 180) / Math.PI;
  const sunAzDeg = ((sunAz * 180) / Math.PI + 360) % 360;
  const isAboveHorizon = sunAlt > 0;

  const { y, m, d, h, min } = formatDateDisplay(currentDate);
  const latLabel = formatLatLabel(targetLatitude);
  const lonLabel = formatLonLabel(targetLongitude);

  // 日影长度计算
  const shadowLength = sunAlt > 0.01 ? poleHeight / Math.tan(sunAlt) : 0;
  const shadowLengthDisplay = shadowLength > 0 ? shadowLength.toFixed(2) : '—';

  // 动态计算二分二至日期
  const solarTerms = useMemo(() => getSolarTerms(currentDate.getFullYear()), [currentDate.getFullYear()]);
  const snapshotPresets = useMemo(() => getSnapshotPresets(currentDate.getFullYear()), [currentDate.getFullYear()]);

  // 楼间距计算（冬至日正午 —— 动态计算冬至日期）
  const winterSolstice = useMemo(() => getEquinoxSolsticeDates(currentDate.getFullYear()).winter, [currentDate.getFullYear()]);
  const wsDecl = getSolarDeclination(winterSolstice);
  const wsNoonAlt = getNoonSolarAltitude(targetLatitude, wsDecl);
  const buildingHeight = 15; // 假设楼高15米
  const minSpacing = wsNoonAlt > 0 ? (buildingHeight / Math.tan(wsNoonAlt * Math.PI / 180)).toFixed(1) : '—';

  // 太阳能板最佳倾角
  const optimalPanelAngle = Math.abs(targetLatitude);

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto scrollbar-thin">
      {/* ===== 1. 观测点 ===== */}
      <Section title="观测点" icon={<MapPin size={14} className="text-[#ff8844]" />}>
        <div className="flex items-center gap-1 mb-1.5">
          <input
            type="number" value={latInput} onChange={(e) => setLatInput(e.target.value)}
            onBlur={handleLatSubmit} onKeyDown={(e) => e.key === 'Enter' && handleLatSubmit()}
            className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white/80 font-mono outline-none focus:border-[#00d4ff]/40"
            step="0.5"
          />
          <span className="text-[10px] text-white/40 w-6">{targetLatitude >= 0 ? 'N' : 'S'}</span>
        </div>
        <div className="grid grid-cols-2 gap-1 mb-2">
          {LAT_PRESETS.slice(0, 6).map((p) => (
            <GlassButton key={p.label} active={targetLatitude === p.lat}
              className="text-[9px] py-0.5 px-0.5 justify-center truncate"
              onClick={() => { setTargetLatitude(p.lat); setLatInput(String(p.lat)); }}>
              {p.label}
            </GlassButton>
          ))}
        </div>
        <div className="flex items-center gap-1 mb-1.5">
          <input
            type="number" value={lonInput} onChange={(e) => setLonInput(e.target.value)}
            onBlur={handleLonSubmit} onKeyDown={(e) => e.key === 'Enter' && handleLonSubmit()}
            className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white/80 font-mono outline-none focus:border-[#00d4ff]/40"
            step="1"
          />
          <span className="text-[10px] text-white/40 w-6">{targetLongitude >= 0 ? 'E' : 'W'}</span>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {LON_PRESETS.slice(0, 6).map((p) => (
            <GlassButton key={p.label} active={targetLongitude === p.lon}
              className="text-[9px] py-0.5 px-0.5 justify-center truncate"
              onClick={() => { setTargetLongitude(p.lon); setLonInput(String(p.lon)); }}>
              {p.label}
            </GlassButton>
          ))}
        </div>
      </Section>

      {/* ===== 2. 时间控制 ===== */}
      <Section title="时间控制" icon={<Clock size={14} className="text-[#00d4ff]" />}>
        <div className="text-center mb-1.5">
          <div className="text-[10px] text-white/30">当前</div>
          <span className="text-xs text-[#00d4ff] font-mono">{y}年{m}月{d}日 {h}:{min}</span>
        </div>
        {/* 日期快速调节 */}
        <div className="text-[10px] text-white/30 text-center mb-1">日期</div>
        <div className="flex justify-center gap-0.5 mb-2 flex-wrap">
          {[-30, -7, -1, 1, 7, 30].map((n) => (
            <GlassButton key={n} onClick={() => advanceDay(n)} className="text-[9px] px-1.5 py-0.5">
              {n > 0 ? `+${n}` : n}
            </GlassButton>
          ))}
        </div>
        {/* 时刻 */}
        <div className="text-[10px] text-white/30 text-center mb-1">时刻</div>
        <div className="flex justify-center gap-0.5 mb-1.5 flex-wrap">
          <GlassButton onClick={() => advanceHours(-1)} className="text-[9px] px-1.5 py-0.5">-1h</GlassButton>
          <GlassButton onClick={() => advanceHours(1)} className="text-[9px] px-1.5 py-0.5">+1h</GlassButton>
          <GlassButton onClick={() => advanceMinutes(-15)} className="text-[9px] px-1.5 py-0.5">-15m</GlassButton>
          <GlassButton onClick={() => advanceMinutes(15)} className="text-[9px] px-1.5 py-0.5">+15m</GlassButton>
          <GlassButton onClick={() => advanceMinutes(-5)} className="text-[9px] px-1.5 py-0.5">-5m</GlassButton>
          <GlassButton onClick={() => advanceMinutes(5)} className="text-[9px] px-1.5 py-0.5">+5m</GlassButton>
        </div>
        {/* 时段快捷 */}
        <div className="grid grid-cols-4 gap-1">
          {[{ label: '子夜', h: 0 }, { label: '黎明', h: 6 }, { label: '正午', h: 12 }, { label: '黄昏', h: 18 }].map(({ label, h: hh }) => (
            <GlassButton key={hh} active={currentDate.getHours() >= hh && currentDate.getHours() < hh + 6}
              onClick={() => setHour(hh)} className="text-[9px] py-0.5">{label}</GlassButton>
          ))}
        </div>
      </Section>

      {/* ===== 3. 二分二至 ===== */}
      <Section title="二分二至快捷" icon={<Sun size={14} className="text-[#f0c060]" />} defaultOpen={false}>
        <div className="space-y-1">
          {solarTerms.map((term) => (
            <GlassButton key={term.label} className="w-full justify-start text-[10px] py-1"
              onClick={() => setDate(new Date(term.date))}>
              <Sun size={12} className="text-[#f0c060] mr-1" />{term.label}
            </GlassButton>
          ))}
        </div>
      </Section>

      {/* ===== 4. 太阳实时数据 ===== */}
      <Section title="太阳实时数据" icon={<Compass size={14} className="text-[#ffdd44]" />}>
        <div className="space-y-1.5">
          <DataRow label="高度角" value={`${sunAltDeg.toFixed(1)}°`} color={isAboveHorizon ? '#ffdd44' : '#ff4444'} />
          <DataRow label="方位角" value={`${sunAzDeg.toFixed(1)}°`} color="#44ff88" />
          <DataRow label="赤纬" value={formatDeclination(decl)} color="#ff8844" />
          <DataRow label="直射半球" value={hemisphere} color="#ffaa44" />
          <DataRow label="状态" value={isAboveHorizon ? '地平线上' : '地平线下'} color={isAboveHorizon ? '#ffcc00' : '#666'} />
        </div>
      </Section>

      {/* ===== 5. 日影长度计算 ===== */}
      <Section title="日影长度计算" icon={<Ruler size={14} className="text-[#44ff88]" />}>
        <div className="space-y-2">
          {/* 标杆高度 */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/50 whitespace-nowrap">标杆高度</span>
            <input type="number" value={poleHeight} min={0.5} max={20} step={0.5}
              onChange={(e) => setPoleHeight(Math.max(0.5, parseFloat(e.target.value) || 3))}
              className="w-14 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-xs text-white/80 font-mono outline-none focus:border-[#44ff88]/40" />
            <span className="text-[10px] text-white/30">米</span>
          </div>
          {/* 影长结果 */}
          <div className="bg-white/5 rounded-lg p-2 text-center">
            <div className="text-[10px] text-white/30 mb-0.5">当前影长</div>
            <div className="text-lg font-bold text-[#44ff88] font-mono">
              {shadowLengthDisplay}
              {shadowLength > 0 && <span className="text-xs text-white/40 ml-1">米</span>}
            </div>
            {shadowLength > 0 && (
              <div className="text-[9px] text-white/30 mt-0.5">
                影长/杆高 = {shadowLength > 0 ? (shadowLength / poleHeight).toFixed(2) : '—'} : 1
              </div>
            )}
          </div>
          {/* 公式 */}
          <div className="bg-[#44ff88]/5 border border-[#44ff88]/15 rounded-lg p-2">
            <div className="text-[10px] text-[#44ff88]/70 font-semibold mb-1">计算公式</div>
            <div className="text-[10px] text-white/60 font-mono leading-relaxed">
              L = H / tan(α)
            </div>
            <div className="text-[9px] text-white/30 mt-0.5">
              L=影长  H=物高  α=太阳高度角
            </div>
          </div>
        </div>
      </Section>

      {/* ===== 6. 实际应用 ===== */}
      <Section title="实际应用" icon={<Building2 size={14} className="text-[#ff8844]" />}>
        <div className="space-y-1.5">
          {/* 楼间距 */}
          <GlassButton
            active={solarAppMode === 'buildingShadow'}
            onClick={() => setSolarAppMode(solarAppMode === 'buildingShadow' ? 'none' : 'buildingShadow')}
            className="w-full justify-start text-[10px] py-1.5">
            <Building2 size={12} className="mr-1" />
            楼间距演示
          </GlassButton>
          {solarAppMode === 'buildingShadow' && (
            <div className="bg-white/5 rounded-lg p-2 space-y-1.5">
              <DataRow label="冬至正午高度" value={`${wsNoonAlt.toFixed(1)}°`} color="#ff8844" />
              <DataRow label="假设楼高" value="15 米" color="#aaa" />
              <DataRow label="最小楼间距" value={`${minSpacing} 米`} color="#ffdd44" />
              <div className="bg-[#ff8844]/5 border border-[#ff8844]/15 rounded p-1.5">
                <div className="text-[10px] text-[#ff8844]/70 font-semibold mb-0.5">楼间距公式</div>
                <div className="text-[10px] text-white/60 font-mono leading-relaxed">
                  D = H / tan(h)
                </div>
                <div className="text-[9px] text-white/30 mt-0.5">
                  D=间距  H=楼高  h=冬至正午太阳高度角
                </div>
              </div>
            </div>
          )}

          {/* 太阳能板 */}
          <GlassButton
            active={solarAppMode === 'solarPanel'}
            onClick={() => setSolarAppMode(solarAppMode === 'solarPanel' ? 'none' : 'solarPanel')}
            className="w-full justify-start text-[10px] py-1.5">
            <PanelTop size={12} className="mr-1" />
            太阳能板倾角
          </GlassButton>
          {solarAppMode === 'solarPanel' && (
            <div className="bg-white/5 rounded-lg p-2 space-y-1.5">
              <DataRow label="最佳倾角" value={`≈ ${optimalPanelAngle.toFixed(0)}°`} color="#88ccff" />
              <div className="bg-[#88ccff]/5 border border-[#88ccff]/15 rounded p-1.5">
                <div className="text-[10px] text-[#88ccff]/70 font-semibold mb-0.5">倾角公式</div>
                <div className="text-[10px] text-white/60 font-mono leading-relaxed">
                  θ = |φ|
                </div>
                <div className="text-[9px] text-white/30 mt-0.5">
                  θ=最佳倾角  φ=当地纬度（全年平均）
                </div>
              </div>
            </div>
          )}

          {/* 日晷 */}
          <GlassButton
            active={solarAppMode === 'sundial'}
            onClick={() => setSolarAppMode(solarAppMode === 'sundial' ? 'none' : 'sundial')}
            className="w-full justify-start text-[10px] py-1.5">
            <Watch size={12} className="mr-1" />
            日晷原理
          </GlassButton>
          {solarAppMode === 'sundial' && (
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-[10px] text-white/50 leading-relaxed">
                晷针投影方向随太阳方位角变化，指示当地时间。晷针指向北天极，倾角等于当地纬度。
              </div>
              <div className="bg-[#ffcc88]/5 border border-[#ffcc88]/15 rounded p-1.5 mt-1.5">
                <div className="text-[10px] text-[#ffcc88]/70 font-semibold mb-0.5">日晷公式</div>
                <div className="text-[10px] text-white/60 font-mono leading-relaxed">
                  tan(θ) = tan(H) · sin(φ)
                </div>
                <div className="text-[9px] text-white/30 mt-0.5">
                  θ=晷面角度  H=太阳时角  φ=当地纬度
                </div>
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* ===== 7. 定格视角对比 ===== */}
      <Section title="定格视角对比" icon={<Camera size={14} className="text-[#44ff88]" />} defaultOpen={false}>
        <div className="space-y-2">
          {(() => {
            const grouped = snapshotPresets.reduce<Record<string, typeof snapshotPresets>>((acc, p) => {
              (acc[p.category] ??= []).push(p); return acc;
            }, {});
            const applyPreset = (p: typeof snapshotPresets[number]) => {
              const [y, m, d] = p.date.split('-').map(Number);
              const [hh, mm] = p.time.split(':').map(Number);
              setTargetLatitude(p.lat); setLatInput(String(p.lat));
              setTargetLongitude(p.lon); setLonInput(String(p.lon));
              setDate(new Date(y, m - 1, d, hh, mm, 0));
            };
            return Object.entries(grouped).map(([cat, presets]) => (
              <div key={cat}>
                <div className="text-[10px] text-white/30 mb-1">{cat}</div>
                <div className="grid grid-cols-1 gap-0.5">
                  {presets.map((p) => (
                    <GlassButton key={p.id} onClick={() => applyPreset(p)} className="w-full justify-start text-[9px] py-1 px-1.5">
                      <Camera size={10} className="text-[#44ff88] mr-1 shrink-0" />
                      <span className="truncate">{p.label}</span>
                    </GlassButton>
                  ))}
                </div>
              </div>
            ));
          })()}
        </div>
      </Section>

      {/* ===== 8. 观测数据汇总 ===== */}
      <Section title="观测数据汇总" icon={<Calculator size={14} className="text-[#ffaa44]" />} defaultOpen={false}>
        <div className="space-y-1">
          <DataRow label="昼长" value={formatHour(dayLen)} color="#ffdd44" />
          <DataRow label="日出" value={sunrise > 0 && sunrise < 24 ? formatHour(sunrise) : '—'} color="#ff8844" />
          <DataRow label="日落" value={sunset > 0 && sunset < 24 ? formatHour(sunset) : '—'} color="#8844ff" />
          <DataRow label="正午高度" value={`${noonAlt.toFixed(1)}°`} color="#ffcc00" />
          <DataRow label="观测点" value={`${latLabel} ${lonLabel}`} color="#aaa" />
        </div>
      </Section>

      {/* 底部留白 */}
      <div className="h-20" />
    </div>
  );
}

/* ========== 数据行 ========== */
function DataRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-white/40 whitespace-nowrap">{label}</span>
      <span className="text-[10px] font-mono font-semibold" style={{ color }}>{value}</span>
    </div>
  );
}