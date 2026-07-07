import { useState } from 'react';
import { X, HelpCircle, Keyboard, MessageCircle } from 'lucide-react';

interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
}

const TABS = [
  { id: 'guide', label: '操作指南', icon: <HelpCircle size={14} /> },
  { id: 'shortcuts', label: '快捷键', icon: <Keyboard size={14} /> },
  { id: 'faq', label: '常见问题', icon: <MessageCircle size={14} /> },
];

const FAQ_ITEMS = [
  {
    q: '为什么3D场景是黑色的？',
    a: '可能是WebGL初始化失败，请刷新页面或检查浏览器是否支持WebGL（推荐Chrome/Edge最新版）。',
  },
  {
    q: '如何切换不同视角？',
    a: '点击首页的三个视角卡片，或使用快捷键 1/2/3 快速切换。',
  },
  {
    q: '如何查看特定日期的天文现象？',
    a: '使用右侧面板的日期调整控件，或点击二分二至按钮快速跳转。',
  },
  {
    q: '移动端如何使用？',
    a: '移动端支持触屏操作：单指旋转、双指缩放、底部导航栏切换面板。',
  },
];

export default function HelpDialog({ open, onClose }: HelpDialogProps) {
  const [tab, setTab] = useState('guide');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#0a0e27]/98 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-toast-enter">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-[#f0c060]">使用帮助</h2>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs transition-colors ${
                tab === t.id
                  ? 'text-[#00d4ff] border-b-2 border-[#00d4ff]'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 max-h-80 overflow-y-auto">
          {tab === 'guide' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-white/80 mb-2">鼠标操作</h3>
                <div className="space-y-1.5 text-[11px] text-white/50">
                  <p><kbd>拖拽</kbd> 旋转视角</p>
                  <p><kbd>滚轮</kbd> 缩放远近</p>
                  <p><kbd>右键拖拽</kbd> 平移画面</p>
                  <p><kbd>点击天体</kbd> 查看信息</p>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white/80 mb-2">界面组成</h3>
                <div className="space-y-1.5 text-[11px] text-white/50">
                  <p><span className="text-[#f0c060]">左侧面板</span> — 知识点树，点击展开实验</p>
                  <p><span className="text-[#00d4ff]">右侧面板</span> — 时间控制、叠加层切换</p>
                  <p><span className="text-[#44ff88]">底部信息栏</span> — 实时天文数据</p>
                  <p><span className="text-[#f0c060]">题库抽屉</span> — 点击右上角题库按钮</p>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white/80 mb-2">搜索功能</h3>
                <p className="text-[11px] text-white/50">
                  按 <kbd>Ctrl+K</kbd> 打开全局搜索，可搜索知识点、题目、预设场景和功能操作。
                </p>
              </div>
            </div>
          )}

          {tab === 'shortcuts' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-[10px] text-white/30 mb-2 font-mono">导航</h3>
                <div className="space-y-1.5">
                  {[
                    ['1', '日心视角'],
                    ['2', '地心视角'],
                    ['3', '地表视角'],
                    ['Esc', '关闭所有面板'],
                  ].map(([key, desc]) => (
                    <div key={key} className="flex items-center justify-between text-[11px]">
                      <kbd>{key}</kbd>
                      <span className="text-white/50">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-[10px] text-white/30 mb-2 font-mono">时间控制</h3>
                <div className="space-y-1.5">
                  {[
                    ['Space', '播放/暂停'],
                    ['← →', '日期 ±1天'],
                    ['Shift+← →', '日期 ±7天'],
                    ['↑ ↓', '时间 ±1小时'],
                  ].map(([key, desc]) => (
                    <div key={key} className="flex items-center justify-between text-[11px]">
                      <kbd>{key}</kbd>
                      <span className="text-white/50">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-[10px] text-white/30 mb-2 font-mono">面板与功能</h3>
                <div className="space-y-1.5">
                  {[
                    ['K', '切换知识面板'],
                    ['E', '切换题库抽屉'],
                    ['R', '重置场景'],
                    ['Ctrl+K', '全局搜索'],
                    ['?', '打开帮助'],
                  ].map(([key, desc]) => (
                    <div key={key} className="flex items-center justify-between text-[11px]">
                      <kbd>{key}</kbd>
                      <span className="text-white/50">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'faq' && (
            <div className="space-y-3">
              {FAQ_ITEMS.map((item, i) => (
                <div key={i} className="border border-white/5 rounded-lg p-3">
                  <h4 className="text-[11px] font-medium text-white/70 mb-1">{item.q}</h4>
                  <p className="text-[10px] text-white/40 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}