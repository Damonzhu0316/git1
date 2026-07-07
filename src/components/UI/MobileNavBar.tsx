import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Home, BookOpen, Settings, Menu, Clock } from 'lucide-react';

interface MobileNavBarProps {
  showRightPanel?: boolean;
  showKnowledge?: boolean;
  showExam?: boolean;
}

const MobileNavBar: React.FC<MobileNavBarProps> = ({
  showRightPanel = true,
  showKnowledge = true,
  showExam = true,
}) => {
  const navigate = useNavigate();
  const currentDate = useStore((s) => s.currentDate);
  const setKnowledgePanelOpen = useStore((s) => s.setKnowledgePanelOpen);
  const isKnowledgePanelOpen = useStore((s) => s.isKnowledgePanelOpen);
  const setMobileRightPanelOpen = useStore((s) => s.setMobileRightPanelOpen);
  const isMobileRightPanelOpen = useStore((s) => s.isMobileRightPanelOpen);
  const setExamDrawerOpen = useStore((s) => s.setExamDrawerOpen);
  const isExamDrawerOpen = useStore((s) => s.isExamDrawerOpen);

  const dateStr = `${currentDate.getMonth() + 1}/${currentDate.getDate()}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0e27]/95 backdrop-blur-md border-t border-white/10 flex items-center justify-around px-2 safe-area-bottom">
      {/* Date indicator */}
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#0a0e27]/90 border border-white/10 rounded-t-lg px-2.5 py-0.5">
        <span className="text-[9px] text-white/40 font-mono flex items-center gap-1">
          <Clock size={9} />{dateStr}
        </span>
      </div>

      <button
        onClick={() => navigate('/')}
        className="flex items-center justify-center gap-1 text-white/40 hover:text-white/70 transition-colors"
        style={{ minWidth: 40, minHeight: 44 }}
      >
        <Home size={16} />
        <span className="text-[10px]">首页</span>
      </button>

      {showKnowledge && (
        <button
          onClick={() => setKnowledgePanelOpen(!isKnowledgePanelOpen)}
          className={`flex items-center justify-center gap-1 transition-colors ${
            isKnowledgePanelOpen ? 'text-[#00d4ff]' : 'text-white/40 hover:text-white/70'
          }`}
          style={{ minWidth: 40, minHeight: 44 }}
        >
          <Menu size={16} />
          <span className="text-[10px]">知识点</span>
        </button>
      )}

      {showRightPanel && (
        <button
          onClick={() => setMobileRightPanelOpen(!isMobileRightPanelOpen)}
          className={`flex items-center justify-center gap-1 transition-colors ${
            isMobileRightPanelOpen ? 'text-[#f0c060]' : 'text-white/40 hover:text-white/70'
          }`}
          style={{ minWidth: 40, minHeight: 44 }}
        >
          <Settings size={16} />
          <span className="text-[10px]">控制</span>
        </button>
      )}

      {showExam && (
        <button
          onClick={() => setExamDrawerOpen(!isExamDrawerOpen)}
          className={`flex items-center justify-center gap-1 transition-colors ${
            isExamDrawerOpen ? 'text-[#ffdd44]' : 'text-white/40 hover:text-white/70'
          }`}
          style={{ minWidth: 40, minHeight: 44 }}
        >
          <BookOpen size={16} />
          <span className="text-[10px]">题库</span>
        </button>
      )}
    </div>
  );
};

export default MobileNavBar;