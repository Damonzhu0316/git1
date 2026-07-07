import React, { useState } from 'react';
import { X, Eye, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { Question } from '@/types';

const TYPE_LABELS: Record<string, string> = {
  choice: '选择题',
  'fill-blank': '填空题',
  'short-answer': '简答题',
  diagram: '读图题',
};

/** 根据题目分类生成场景观察提示 */
function getSceneHint(question: Question): string {
  const hints: Record<string, string> = {
    '直射点判断': '观察太阳光线照射地球的位置，注意晨昏线与昼夜分界',
    '昼夜长短': '观察晨昏线倾斜角度，比较不同纬度地区的昼夜分布',
    '太阳高度': '观察太阳光线与地球表面的夹角，注意直射点位置',
    '时间计算': '观察经纬网，注意经度与地方时的对应关系',
    '日出日落': '观察晨昏线位置，判断日出日落方向',
    '黄赤交角': '观察赤道面与黄道面的夹角，注意地轴倾斜方向',
    '四季判断': '观察太阳直射点所在的半球，判断南北半球季节',
    '五带判断': '观察回归线和极圈的位置，注意太阳直射范围',
    '地球自转与昼夜': '观察地球自转方向和晨昏线变化',
    '地方时与时区': '观察经度线与地方时的对应关系',
    '太阳直射点移动': '观察太阳直射点在南北回归线之间的移动',
    '昼夜长短变化': '观察不同纬度地区的昼夜长短差异',
    '正午太阳高度角': '观察太阳光线与地面的夹角变化',
    '四季与五带': '观察回归线和极圈划分的五带范围',
    '晨昏线判读': '观察晨昏线与经线的关系，判断昼夜半球',
    '综合应用': '综合观察多个地理要素，分析相互关系',
  };
  return hints[question.category] || '拖动视角观察3D场景中的地理现象，理解题目考查的知识点';
}

const QuestionOverlay: React.FC = () => {
  const activeQuestion = useStore((s) => s.activeQuestion);
  const setActiveQuestion = useStore((s) => s.setActiveQuestion);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  if (!activeQuestion) return null;

  const q = activeQuestion;
  const hint = getSceneHint(q);

  return (
    <>
      {/* 场景提示条 — 顶部居中 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="bg-[#0a0e27]/85 backdrop-blur-md border border-[#00d4ff]/30 rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg shadow-[#00d4ff]/10">
          <Eye size={14} className="text-[#00d4ff]" />
          <span className="text-xs text-white/70">{hint}</span>
        </div>
      </div>

      {/* 题目卡片 — 底部居中 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-lg w-[90%]">
        <div
          className="bg-[#0a0e27]/90 backdrop-blur-lg border border-[#00d4ff]/20 rounded-xl shadow-2xl shadow-black/50 overflow-hidden transition-all"
        >
          {/* 标题栏 */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/[0.03]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00d4ff]/20 text-[#00d4ff] font-medium">
                {TYPE_LABELS[q.type] || q.type}
              </span>
              <span className="text-xs text-white/40">{q.category}</span>
              {q.source && (
                <span className="text-[10px] text-white/25 hidden sm:inline">{q.source}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-1 rounded hover:bg-white/10 transition-colors text-white/40 hover:text-white/70"
              >
                {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <button
                onClick={() => setActiveQuestion(null)}
                className="p-1 rounded hover:bg-white/10 transition-colors text-white/40 hover:text-white/70"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* 折叠时只显示标题 */}
          {collapsed ? (
            <div className="px-4 py-2">
              <span className="text-sm text-white/80">{q.title}</span>
            </div>
          ) : (
            <div className="px-4 py-3 space-y-3">
              {/* 题干 */}
              <p className="text-sm text-white/85 leading-relaxed">{q.title}</p>

              {/* 场景说明 */}
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#00d4ff]/5 border border-[#00d4ff]/10">
                <MapPin size={14} className="text-[#00d4ff] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-[#00d4ff] font-medium mb-0.5">当前3D场景</p>
                  <p className="text-[11px] text-white/50">{hint}</p>
                </div>
              </div>

              {/* 选择题选项 */}
              {q.type === 'choice' && q.options && (
                <div className="space-y-1.5">
                  {q.options.map((opt, i) => {
                    const letter = String.fromCharCode(65 + i);
                    const isSelected = selectedOption === i;
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedOption(i === selectedOption ? null : i)}
                        className={`w-full text-left text-xs px-3 py-2 rounded-lg border transition-all ${
                          isSelected
                            ? 'border-[#00d4ff]/40 bg-[#00d4ff]/10 text-[#00d4ff]'
                            : 'border-white/10 text-white/60 hover:border-white/25 hover:bg-white/[0.03]'
                        }`}
                      >
                        <span className="font-mono mr-2 text-white/40">{letter}.</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 填空题提示 */}
              {q.type === 'fill-blank' && (
                <div className="text-xs text-white/40 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10">
                  请在题库抽屉中输入答案，然后回到这里对照3D场景验证
                </div>
              )}

              {/* 简答题提示 */}
              {q.type === 'short-answer' && (
                <div className="text-xs text-white/40 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10">
                  观察3D场景中的地理现象，在题库抽屉中写下你的分析
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default QuestionOverlay;