import React, { useState, useMemo } from 'react';
import {
  ChevronDown, ChevronRight, BookOpen, RotateCw, Orbit, Triangle, SunMoon,
  Calendar, BarChart3, Clock, MoveHorizontal, Gauge, Circle, Sun, Axis3d,
  TrendingUp, Ruler, CalendarDays, Globe, ArrowRightLeft, PanelLeftClose,
  PanelLeftOpen, Target, Waves, Eye, Layers, MapPin, Plane, X,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { knowledgePoints } from '@/data/knowledgePoints';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { KnowledgePoint, KnowledgeAction, SolarAppMode, ViewMode } from '@/types';

const ICON_MAP: Record<string, React.ReactNode> = {
  RotateCw: <RotateCw size={14} />,
  ArrowRightLeft: <ArrowRightLeft size={14} />,
  SunMoon: <SunMoon size={14} />,
  Clock: <Clock size={14} />,
  MoveHorizontal: <MoveHorizontal size={14} />,
  Orbit: <Orbit size={14} />,
  Circle: <Circle size={14} />,
  Gauge: <Gauge size={14} />,
  Triangle: <Triangle size={14} />,
  Axis3d: <Axis3d size={14} />,
  Sun: <Sun size={14} />,
  BarChart3: <BarChart3 size={14} />,
  TrendingUp: <TrendingUp size={14} />,
  Ruler: <Ruler size={14} />,
  Calendar: <Calendar size={14} />,
  CalendarDays: <CalendarDays size={14} />,
  Globe: <Globe size={14} />,
  Plane: <Plane size={14} />,
};

const VIEW_TITLE: Record<ViewMode, { title: string; icon: React.ReactNode }> = {
  heliocentric: { title: '公转与黄赤交角', icon: <Orbit size={14} className="text-[#f0c060]" /> },
  geocentric: { title: '自转与昼夜', icon: <RotateCw size={14} className="text-[#f0c060]" /> },
  surface: { title: '太阳周日视运动', icon: <Sun size={14} className="text-[#f0c060]" /> },
};

function KnowledgeActionButton({ action }: { action: KnowledgeAction }) {
  const store = useStore();

  const handleClick = () => {
    switch (action.type) {
      case 'toggle':
        if (action.key === 'solarAppMode') {
          const current = store.solarAppMode;
          const target = action.value as string;
          store.setSolarAppMode(current === target ? 'none' : target as SolarAppMode);
        } else {
          store.toggleSetting(action.key);
        }
        break;
      case 'preset':
        if (action.key === 'cameraPreset') {
          store.setCameraPreset(action.value as any);
        }
        break;
      case 'date':
        if (action.key === 'currentDate' && typeof action.value === 'string') {
          store.setDate(new Date(action.value));
        }
        break;
      case 'focusEarth':
        if (action.key === 'focusEarth') {
          store.applySceneConfig({ focusEarth: action.value === 'true' || action.value === true });
        }
        break;
      case 'setSpeed':
        if (action.key === 'timeSpeed' && typeof action.value === 'string') {
          store.setTimeSpeed(parseFloat(action.value));
        }
        break;
      case 'setLatLon':
        if (action.key === 'highlightLatitude' && typeof action.value === 'string') {
          store.applySceneConfig({ highlightLatitude: parseFloat(action.value) });
        }
        break;
    }
    store.setActiveKnowledge(action.id);
  };

  const isActive = store.activeKnowledge === action.id;

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left text-[10px] px-2 py-1.5 rounded transition-colors ${
        isActive
          ? 'bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/20'
          : 'text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent'
      }`}
    >
      {action.label}
    </button>
  );
}

function KnowledgeItem({ item, level = 0, view }: { item: KnowledgePoint; level?: number; view: ViewMode }) {
  const store = useStore();
  const [expanded, setExpanded] = useState(level === 0);
  const hasChildren = item.children && item.children.length > 0;
  const hasActions = item.actions && item.actions.length > 0;
  const isActive = store.activeKnowledge === item.id;

  return (
    <div className="mb-0.5">
      <button
        onClick={() => {
          if (hasChildren) setExpanded(!expanded);
          store.setActiveKnowledge(item.id);
        }}
        className={`w-full flex items-center gap-1.5 px-2 py-2 rounded text-left transition-colors ${
          isActive
            ? 'bg-[#00d4ff]/10 text-[#00d4ff]'
            : 'text-white/60 hover:bg-white/5 hover:text-white/80'
        }`}
      >
        {hasChildren ? (
          expanded ? <ChevronDown size={12} className="text-white/30 shrink-0" /> : <ChevronRight size={12} className="text-white/30 shrink-0" />
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <span className="text-[#f0c060] shrink-0">{ICON_MAP[item.icon] || <BookOpen size={14} />}</span>
        <span className="text-xs font-medium truncate">{item.name}</span>
      </button>

      {isActive && (
        <p className="text-[10px] text-white/35 px-7 py-0.5 leading-relaxed">{item.description}</p>
      )}

      {hasChildren && expanded && (
        <div className="ml-3 border-l border-white/5 pl-1">
          {item.children!.filter((c) => !c.views || c.views.includes(view)).map((child) => (
            <div key={child.id}>
              <KnowledgeItem item={child} level={level + 1} view={view} />
            </div>
          ))}
        </div>
      )}

      {hasActions && isActive && (
        <div className="ml-7 mt-1 space-y-0.5">
          {item.actions!.map((action) => (
            <KnowledgeActionButton key={action.id} action={action} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function KnowledgePanel() {
  const isOpen = useStore((s) => s.isKnowledgePanelOpen);
  const setOpen = useStore((s) => s.setKnowledgePanelOpen);
  const resetScene = useStore((s) => s.resetScene);
  const activeKnowledge = useStore((s) => s.activeKnowledge);
  const activeView = useStore((s) => s.activeView);
  const isMobile = useIsMobile();

  const visiblePoints = useMemo(
    () => knowledgePoints.filter((kp) => !kp.views || kp.views.includes(activeView)),
    [activeView]
  );

  const viewInfo = VIEW_TITLE[activeView];

  const panelContent = (
    <div className="flex-1 overflow-y-auto px-2 pt-14 pb-2">
      {/* 视图标题 */}
      <div className="flex items-center gap-2 px-2 py-2 mb-1 border-b border-white/5">
        {viewInfo.icon}
        <span className="text-xs font-semibold text-white/70">{viewInfo.title}</span>
      </div>

      {/* 知识点树 */}
      <div className="px-1">
        <div className="text-[10px] text-white/30 mb-1 px-2 flex items-center gap-1">
          <Layers size={10} /> 知识点
        </div>
        {visiblePoints.map((kp) => (
          <KnowledgeItem key={kp.id} item={kp} view={activeView} />
        ))}
      </div>
    </div>
  );

  const panelFooter = (
    <div className="px-2 py-2 border-t border-white/5">
      <button
        onClick={resetScene}
        className="w-full flex items-center justify-center gap-1.5 text-[10px] text-white/40 hover:text-white/70 py-2 rounded hover:bg-white/5 transition-colors"
      >
        <RotateCw size={12} />
        重置场景
      </button>
    </div>
  );

  // 移动端：全屏抽屉
  if (isMobile) {
    return (
      <>
        {/* 遮罩 */}
        {isOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm mobile-overlay"
            onClick={() => setOpen(false)}
          />
        )}

        {/* 抽屉面板 */}
        <div
          className={`fixed left-0 top-0 bottom-0 z-50 bg-[#0a0e27]/95 backdrop-blur-md border-r border-white/10 flex flex-col shadow-2xl ${
            isOpen ? 'w-72 mobile-drawer-left' : 'w-0 overflow-hidden'
          }`}
          style={{ transition: isOpen ? 'none' : 'width 0.2s ease-in' }}
        >
          {/* 移动端关闭按钮 */}
          <div className="absolute top-0 right-0 z-10 p-3">
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {panelContent}
          {panelFooter}
        </div>
      </>
    );
  }

  // 桌面端：侧边固定面板
  return (
    <>
      <button
        onClick={() => setOpen(!isOpen)}
        className="fixed top-1/2 -translate-y-1/2 z-50 w-6 h-12 bg-[#0a0e27]/90 backdrop-blur-md border border-white/10 border-l-0 rounded-r-lg flex items-center justify-center text-white/40 hover:text-white/80 transition-all duration-300"
        style={{ left: isOpen ? '224px' : '0px' }}
        title={isOpen ? '收起面板' : '展开面板'}
      >
        {isOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
      </button>

      <div
        className={`fixed left-0 top-0 bottom-0 z-40 bg-[#0a0e27]/85 backdrop-blur-md border-r border-white/10 transition-all duration-300 overflow-hidden flex flex-col ${
          isOpen ? 'w-56' : 'w-0'
        }`}
      >
        {panelContent}
        {panelFooter}
      </div>
    </>
  );
}