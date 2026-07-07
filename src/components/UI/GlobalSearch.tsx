import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ArrowRight, BookOpen, MapPin, Calendar, Eye, X, HelpCircle } from 'lucide-react';
import Fuse from 'fuse.js';
import { useStore } from '@/store/useStore';
import { knowledgePoints } from '@/data/knowledgePoints';
import { questions } from '@/data/questions';
import { getSnapshotPresets } from '@/data/presets';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  type: 'knowledge' | 'question' | 'preset' | 'action';
  label: string;
  desc: string;
  icon: React.ReactNode;
  action: () => void;
}

const ACTION_ITEMS = [
  { label: '打开晨昏线', desc: '在地心视角显示晨昏线', action: 'showTerminator' },
  { label: '显示经纬网', desc: '在地心视角显示经纬网格', action: 'showGridLines' },
  { label: '显示太阳光线', desc: '在日心视角显示平行太阳光', action: 'showSunRay' },
  { label: '显示黄道面', desc: '在日心视角显示黄道平面', action: 'showEclipticPlane' },
  { label: '显示赤道面', desc: '在日心视角显示赤道平面', action: 'showEquatorPlane' },
  { label: '显示地轴', desc: '在地心视角显示地球自转轴', action: 'showEarthAxis' },
  { label: '显示五带', desc: '在地心视角显示五带划分', action: 'showFiveZones' },
  { label: '显示四季', desc: '在日心视角显示四季变化', action: 'showSeasonDemo' },
  { label: '显示月相', desc: '在日心视角显示月相变化', action: 'showMoonPhases' },
  { label: '显示日食月食', desc: '在日心视角显示日食月食', action: 'showEclipse' },
  { label: '显示地转偏向力', desc: '在地心视角显示地转偏向力', action: 'showCoriolis' },
];

export default function GlobalSearch() {
  const navigate = useNavigate();
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const fuseRef = useRef<Fuse<any> | null>(null);

  useEffect(() => {
    const presets = getSnapshotPresets(2024);
    const allItems = [
      ...knowledgePoints.map((kp) => ({
        type: 'knowledge' as const,
        label: kp.name,
        desc: kp.description || '',
        icon: <BookOpen size={14} />,
        views: kp.views,
        knowledgeId: kp.id,
      })),
      ...questions.map((q) => ({
        type: 'question' as const,
        label: q.title,
        desc: `${q.category} · ${q.difficulty}`,
        icon: <HelpCircle size={14} />,
        questionId: q.id,
      })),
      ...presets.map((p) => ({
        type: 'preset' as const,
        label: p.label,
        desc: `${p.date} · ${p.category}`,
        icon: <Calendar size={14} />,
        preset: p,
      })),
      ...ACTION_ITEMS.map((a) => ({
        type: 'action' as const,
        label: a.label,
        desc: a.desc,
        icon: <Eye size={14} />,
        actionKey: a.action,
      })),
    ];

    fuseRef.current = new Fuse(allItems, {
      keys: ['label', 'desc'],
      threshold: 0.4,
      distance: 100,
    });
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === 'K' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery('');
        setResults([]);
        setSelectedIdx(0);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const handleSearch = useCallback(
    (q: string) => {
      setQuery(q);
      if (!q.trim() || !fuseRef.current) {
        setResults([]);
        return;
      }
      const matches = fuseRef.current.search(q);
      setResults(matches.slice(0, 8).map((m) => m.item) as SearchResult[]);
      setSelectedIdx(0);
    },
    []
  );

  const handleSelect = useCallback(
    (result: SearchResult) => {
      setOpen(false);
      setQuery('');
      if (result.type === 'knowledge') {
        const item = result as any;
        if (item.views && item.views.length > 0) {
          store.setActiveView(item.views[0]);
          navigate(`/${item.views[0]}`);
        }
        store.setActiveKnowledge(item.knowledgeId);
      } else if (result.type === 'question') {
        store.setExamDrawerOpen(true);
        store.setActiveQuestion((result as any).questionId);
      } else if (result.type === 'preset') {
        const preset = (result as any).preset;
        // Presets are for geocentric/surface views
        store.setActiveView('geocentric');
        navigate('/geocentric');
        const dateStr = preset.date;
        if (dateStr) {
          store.setDate(new Date(`${dateStr}T${preset.time || '12:00'}:00`));
        }
        store.setTargetLatitude(preset.lat);
        store.setTargetLongitude(preset.lon);
        store.addToast({ type: 'success', message: `已切换到 ${preset.label}` });
      } else if (result.type === 'action') {
        const actionKey = (result as any).actionKey;
        store.toggleSetting(actionKey);
        store.addToast({ type: 'info', message: `${result.label} 已切换` });
      }
    },
    [navigate, store]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((prev) => Math.min(prev + 1, results.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((prev) => Math.max(prev - 1, 0));
    }
    if (e.key === 'Enter' && results[selectedIdx]) {
      handleSelect(results[selectedIdx]);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative z-10 w-full max-w-lg mx-4 bg-[#0a0e27]/98 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-toast-enter">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
          <Search size={16} className="text-white/30 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索知识点、题目、预设场景..."
            className="flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/20 outline-none"
          />
          <button
            onClick={() => setOpen(false)}
            className="text-white/20 hover:text-white/50 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        {results.length > 0 && (
          <div className="max-h-64 overflow-y-auto p-1">
            {results.map((result, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(result)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  idx === selectedIdx ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center shrink-0">
                  <span className="text-white/40">{result.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/70 truncate">{result.label}</div>
                  <div className="text-[10px] text-white/30 truncate">{result.desc}</div>
                </div>
                <span className="text-[10px] text-white/15 shrink-0">
                  {result.type === 'knowledge' ? '知识点' : result.type === 'question' ? '题目' : result.type === 'preset' ? '预设' : '操作'}
                </span>
                <ArrowRight size={12} className="text-white/10" />
              </button>
            ))}
          </div>
        )}
        {query && results.length === 0 && (
          <div className="px-4 py-8 text-center text-white/20 text-xs">未找到相关结果</div>
        )}
        {!query && (
          <div className="px-4 py-6 text-center text-white/15 text-xs">
            输入关键词搜索知识点、题目、预设场景或功能操作
          </div>
        )}
      </div>
    </div>
  );
}