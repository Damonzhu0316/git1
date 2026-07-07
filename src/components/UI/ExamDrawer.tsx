import React, { useState, useMemo } from 'react';
import { X, BookOpen, Search, Filter, Trash2, RotateCcw, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { questions } from '@/data/questions';
import { saveAnswer, getWrongQuestionIds, getRecordByQuestionId, removeWrongRecord } from '@/utils/examStorage';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { Question, QuestionType, QuestionDifficulty } from '@/types';
import GlassButton from './GlassButton';
import ExamStatsPanel from './ExamStatsPanel';

const TYPE_LABELS: Record<QuestionType, string> = {
  choice: '选择题',
  'fill-blank': '填空题',
  'short-answer': '简答题',
  diagram: '读图题',
};

const DIFFICULTY_LABELS: Record<QuestionDifficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

const DIFFICULTY_COLORS: Record<QuestionDifficulty, string> = {
  easy: 'bg-green-400/20 text-green-400',
  medium: 'bg-yellow-400/20 text-yellow-400',
  hard: 'bg-red-400/20 text-red-400',
};

const ExamDrawer: React.FC = () => {
  const {
    isExamDrawerOpen,
    setExamDrawerOpen,
  } = useStore();

  const isMobile = useIsMobile();

  // 搜索和筛选
  const [searchKeyword, setSearchKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<QuestionType | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<QuestionDifficulty | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // 错题本模式
  const [showWrongOnly, setShowWrongOnly] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // 本地展开状态：当前展开的题目ID（用于显示选项）
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 答题状态
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, boolean>>({});

  const wrongIds = useMemo(() => getWrongQuestionIds(), [questions, isExamDrawerOpen]);

  // 筛选逻辑
  const filteredQuestions = useMemo(() => {
    let result = questions;

    if (showWrongOnly) {
      result = result.filter((q) => wrongIds.includes(q.id));
    }

    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      result = result.filter(
        (q) =>
          q.title.toLowerCase().includes(kw) ||
          q.category.toLowerCase().includes(kw) ||
          (q.keyPoints && q.keyPoints.some((kp) => kp.toLowerCase().includes(kw))),
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter((q) => q.type === typeFilter);
    }

    if (difficultyFilter !== 'all') {
      result = result.filter((q) => q.difficulty === difficultyFilter);
    }

    return result;
  }, [searchKeyword, typeFilter, difficultyFilter, showWrongOnly, wrongIds]);

  // 按分类分组
  const grouped = useMemo(() => {
    return filteredQuestions.reduce<Record<string, Question[]>>((acc, q) => {
      (acc[q.category] ??= []).push(q);
      return acc;
    }, {});
  }, [filteredQuestions]);

  const handleToggleExpand = (questionId: string) => {
    setExpandedId((prev) => (prev === questionId ? null : questionId));
  };

  const handleClose = () => {
    setExamDrawerOpen(false);
    setExpandedId(null);
  };

  const toggleReveal = (q: Question) => {
    const id = q.id;
    if (!revealedAnswers[id]) {
      let isCorrect = false;
      if (submittedAnswers[id]) {
        const userAns = userInputs[id] || '';
        if (q.type === 'choice') {
          const idx = parseInt(userAns, 10);
          isCorrect = idx === q.answer;
        } else if (q.type === 'fill-blank') {
          const ans = String(q.answer);
          isCorrect = ans.split('|').some((a) => a.trim().toLowerCase() === userAns.trim().toLowerCase());
        } else {
          isCorrect = true;
        }
        saveAnswer({
          questionId: id,
          userAnswer: userAns,
          isCorrect,
          timestamp: Date.now(),
        });
      }
    }
    setRevealedAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmitAnswer = (q: Question) => {
    setSubmittedAnswers((prev) => ({ ...prev, [q.id]: true }));
  };

  const handleChoiceSelect = (q: Question, idx: number) => {
    setUserInputs((prev) => ({ ...prev, [q.id]: String(idx) }));
    setSubmittedAnswers((prev) => ({ ...prev, [q.id]: true }));
  };

  const handleFillInput = (q: Question, value: string) => {
    setUserInputs((prev) => ({ ...prev, [q.id]: value }));
  };

  const handleRemoveWrong = (id: string) => {
    removeWrongRecord(id);
    setRevealedAnswers((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setSubmittedAnswers((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const renderQuestionContent = (q: Question) => {
    const isExpanded = expandedId === q.id;
    const revealed = revealedAnswers[q.id];
    const submitted = submittedAnswers[q.id];
    const userAns = userInputs[q.id] || '';
    const record = getRecordByQuestionId(q.id);

    return (
      <div
        className={`rounded-lg border transition-all ${
          isExpanded ? 'border-[#00d4ff]/40 bg-[#00d4ff]/5' : 'border-white/10 bg-white/5'
        }`}
      >
        <div className="p-3">
          {/* 头部：类型标签 + 难度 + 题目 */}
          <div className="flex items-start gap-2 mb-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00d4ff]/20 text-[#00d4ff] shrink-0">
              {TYPE_LABELS[q.type]}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${DIFFICULTY_COLORS[q.difficulty]}`}>
              {DIFFICULTY_LABELS[q.difficulty]}
            </span>
            <span className="text-xs text-white/70 leading-relaxed">{q.title}</span>
          </div>

          {q.source && <span className="text-[9px] text-white/30 ml-1">{q.source}</span>}

          {!isExpanded ? (
            <GlassButton
              variant="accent"
              onClick={() => handleToggleExpand(q.id)}
              className="mt-2 w-full justify-center"
            >
              显示选项
            </GlassButton>
          ) : (
            <div className="mt-2 space-y-2">
              {q.type === 'choice' && q.options && (
                <div className="space-y-1">
                  {q.options.map((opt, i) => {
                    const letter = String.fromCharCode(65 + i);
                    const selected = userAns === String(i);
                    const isCorrect = revealed && i === q.answer;
                    const isWrong = revealed && selected && i !== q.answer;
                    return (
                      <div
                        key={i}
                        onClick={() => !revealed && handleChoiceSelect(q, i)}
                        className={`text-xs px-2 py-2 rounded border transition-colors cursor-pointer ${
                          isCorrect
                            ? 'border-green-400/40 bg-green-400/10 text-green-400'
                            : isWrong
                            ? 'border-red-400/40 bg-red-400/10 text-red-400'
                            : selected
                            ? 'border-[#00d4ff]/40 bg-[#00d4ff]/10 text-[#00d4ff]'
                            : 'border-white/10 text-white/60 hover:border-white/30'
                        }`}
                      >
                        {letter}. {opt}
                      </div>
                    );
                  })}
                </div>
              )}

              {q.type === 'fill-blank' && (
                <div>
                  {!revealed && (
                    <input
                      type="text"
                      value={userAns}
                      onChange={(e) => handleFillInput(q, e.target.value)}
                      placeholder="请输入答案..."
                      className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded text-white placeholder-white/30 focus:border-[#00d4ff]/40 focus:outline-none"
                    />
                  )}
                  {submitted && revealed && (
                    <div className={`text-xs px-2 py-1 rounded border ${
                      record?.isCorrect ? 'border-green-400/40 text-green-400' : 'border-red-400/40 text-red-400'
                    }`}>
                      你的答案：{userAns}
                      {record?.isCorrect ? ' ✓' : ' ✗'}
                    </div>
                  )}
                </div>
              )}

              {q.type === 'short-answer' && (
                <div>
                  {!revealed && (
                    <textarea
                      value={userAns}
                      onChange={(e) => handleFillInput(q, e.target.value)}
                      placeholder="请输入你的答案..."
                      rows={3}
                      className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded text-white placeholder-white/30 focus:border-[#00d4ff]/40 focus:outline-none resize-none"
                    />
                  )}
                </div>
              )}

              {q.type === 'diagram' && q.diagramUrl && (
                <div className="rounded border border-white/10 overflow-hidden bg-black/20">
                  <img src={q.diagramUrl} alt="题目图示" className="w-full max-h-48 object-contain" />
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                {!revealed && q.type !== 'choice' && (
                  <GlassButton onClick={() => handleSubmitAnswer(q)} className="text-xs" variant="accent">
                    提交答案
                  </GlassButton>
                )}
                <GlassButton onClick={() => toggleReveal(q)} variant="gold" className="text-xs">
                  {revealed ? '隐藏答案' : '显示答案'}
                </GlassButton>
                <GlassButton
                  onClick={() => setExpandedId(null)}
                  className="text-xs"
                >
                  收起
                </GlassButton>
                {record && !record.isCorrect && (
                  <GlassButton
                    onClick={() => handleRemoveWrong(q.id)}
                    className="text-xs"
                  >
                    <Trash2 size={12} className="mr-1" />移出错题
                  </GlassButton>
                )}
              </div>

              {revealed && (
                <div className="p-2 rounded bg-white/5 border border-white/10 text-xs text-white/70">
                  <p className="text-green-400 font-semibold mb-1">
                    正确答案：{q.type === 'choice' ? String.fromCharCode(65 + (q.answer as number)) : String(q.answer)}
                  </p>
                  <p>{q.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const totalFiltered = filteredQuestions.length;
  const wrongCount = wrongIds.length;

  const drawerContent = (
    <>
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 sticky top-0 bg-[#0a0e27]/95 backdrop-blur-md z-10">
        <h2 className="text-base font-semibold text-white/80">应试题库</h2>
        <div className="flex items-center gap-1">
          <GlassButton onClick={() => setShowStats(!showStats)} active={showStats}>
            <BarChart3 size={14} />
          </GlassButton>
          <GlassButton onClick={handleClose}>
            <X size={16} />
          </GlassButton>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="px-4 py-2 border-b border-white/10">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="搜索题目..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-white/5 border border-white/10 rounded text-white placeholder-white/30 focus:border-[#00d4ff]/40 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 mt-2 flex-wrap">
          <GlassButton
            onClick={() => setShowFilters(!showFilters)}
            className="text-[10px] py-1"
            active={showFilters}
          >
            <Filter size={10} className="mr-1" />
            筛选
            {showFilters ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </GlassButton>

          <GlassButton
            onClick={() => setShowWrongOnly(!showWrongOnly)}
            className="text-[10px] py-1"
            active={showWrongOnly}
            variant={showWrongOnly ? 'gold' : 'default'}
          >
            <AlertTriangle size={10} className="mr-1" />
            错题本{wrongCount > 0 ? ` (${wrongCount})` : ''}
          </GlassButton>

          <span className="text-[10px] text-white/30 ml-auto">
            {totalFiltered}题
          </span>
        </div>

        {showFilters && (
          <div className="mt-2 space-y-2">
            <div>
              <div className="text-[9px] text-white/30 mb-1">题型</div>
              <div className="flex gap-1 flex-wrap">
                {(['all', 'choice', 'fill-blank', 'short-answer', 'diagram'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                      typeFilter === t
                        ? 'border-[#00d4ff]/40 bg-[#00d4ff]/10 text-[#00d4ff]'
                        : 'border-white/10 text-white/50 hover:border-white/30'
                    }`}
                  >
                    {t === 'all' ? '全部' : TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[9px] text-white/30 mb-1">难度</div>
              <div className="flex gap-1 flex-wrap">
                {(['all', 'easy', 'medium', 'hard'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficultyFilter(d)}
                    className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                      difficultyFilter === d
                        ? 'border-[#00d4ff]/40 bg-[#00d4ff]/10 text-[#00d4ff]'
                        : 'border-white/10 text-white/50 hover:border-white/30'
                    }`}
                  >
                    {d === 'all' ? '全部' : DIFFICULTY_LABELS[d]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showStats && <ExamStatsPanel />}

      <div className="p-4 space-y-4 pb-20">
        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <BookOpen size={24} className="text-white/20" />
            </div>
            <p className="text-sm text-white/40 mb-1">暂无题目</p>
            <p className="text-xs text-white/20">题库中还没有添加题目</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-white/40 mb-1">无匹配题目</p>
            <p className="text-xs text-white/20">请调整筛选条件或搜索关键词</p>
            <GlassButton
              onClick={() => {
                setSearchKeyword('');
                setTypeFilter('all');
                setDifficultyFilter('all');
                setShowWrongOnly(false);
              }}
              className="mt-3 text-xs"
            >
              <RotateCcw size={12} className="mr-1" />重置筛选
            </GlassButton>
          </div>
        ) : (
          Object.entries(grouped).map(([category, list]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                  {category}
                </h3>
                <span className="text-[10px] text-white/20">{list.length}题</span>
              </div>
              <div className="space-y-2">
                {list.map((q) => (
                  <div key={q.id}>{renderQuestionContent(q)}</div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );

  return (
    <>
      {isExamDrawerOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      )}

      <div
        className={`fixed top-0 right-0 bottom-0 z-50 bg-[#0a0e27]/90 backdrop-blur-md border-l border-white/10 transition-transform duration-300 overflow-y-auto ${
          isMobile ? 'w-full' : 'w-96'
        } ${
          isExamDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {drawerContent}
      </div>
    </>
  );
};

export default ExamDrawer;