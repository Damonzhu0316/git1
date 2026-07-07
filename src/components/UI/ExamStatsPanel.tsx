import React, { useMemo } from 'react';
import { getStats, exportData, clearHistory } from '@/utils/examStorage';
import { questions } from '@/data/questions';
import GlassButton from './GlassButton';

const ExamStatsPanel: React.FC = () => {
  const stats = useMemo(() => getStats(), []);
  const totalQuestions = questions.length;

  const accuracy = stats.totalAnswered > 0
    ? Math.round((stats.correctCount / stats.totalAnswered) * 100)
    : 0;

  // 按分类统计
  const categoryStats = useMemo(() => {
    const map: Record<string, { total: number; wrong: number }> = {};
    questions.forEach((q) => {
      (map[q.category] ??= { total: 0, wrong: 0 }).total++;
    });
    stats.wrongQuestionIds.forEach((id) => {
      const q = questions.find((q) => q.id === id);
      if (q && map[q.category]) {
        map[q.category].wrong++;
      }
    });
    return map;
  }, [stats.wrongQuestionIds]);

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-records-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (window.confirm('确定要清除所有答题记录吗？此操作不可撤销。')) {
      clearHistory();
      window.location.reload();
    }
  };

  return (
    <div className="px-4 py-3 border-b border-white/10 space-y-3">
      <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">学习统计</h3>

      {/* 总览 */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-white/5 border border-white/10 p-2 text-center">
          <div className="text-lg font-bold text-[#00d4ff]">{stats.totalAnswered}</div>
          <div className="text-[9px] text-white/40">已答题</div>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-2 text-center">
          <div className={`text-lg font-bold ${accuracy >= 60 ? 'text-green-400' : 'text-yellow-400'}`}>
            {accuracy}%
          </div>
          <div className="text-[9px] text-white/40">正确率</div>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-2 text-center">
          <div className="text-lg font-bold text-red-400">{stats.wrongQuestionIds.length}</div>
          <div className="text-[9px] text-white/40">错题数</div>
        </div>
      </div>

      {/* 进度条 */}
      <div>
        <div className="flex justify-between text-[9px] text-white/40 mb-1">
          <span>整体进度</span>
          <span>{stats.totalAnswered}/{totalQuestions}</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#00d4ff] to-[#0088cc] transition-all"
            style={{ width: `${totalQuestions > 0 ? (stats.totalAnswered / totalQuestions) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* 分类统计 */}
      {Object.keys(categoryStats).length > 0 && (
        <div>
          <div className="text-[9px] text-white/40 mb-1">分类掌握度</div>
          <div className="space-y-1">
            {Object.entries(categoryStats).map(([cat, { total, wrong }]) => {
              const done = total - wrong;
              const pct = total > 0 ? (done / total) * 100 : 0;
              return (
                <div key={cat} className="flex items-center gap-2">
                  <span className="text-[10px] text-white/60 w-16 truncate">{cat}</span>
                  <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct >= 80 ? 'bg-green-400' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-white/30 w-8 text-right">{done}/{total}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <GlassButton onClick={handleExport} className="text-[10px] py-0.5 flex-1 justify-center">
          导出数据
        </GlassButton>
        <GlassButton onClick={handleClear} className="text-[10px] py-0.5 flex-1 justify-center" variant="gold">
          清除记录
        </GlassButton>
      </div>
    </div>
  );
};

export default ExamStatsPanel;