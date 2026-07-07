# 题库与应试系统增强计划

## 摘要

当前题库仅有8道选择题，题型单一，无答题记录/进度追踪/搜索筛选/错题本功能。本计划将题库扩充至100+道涵盖多种题型的题目，并新增完整的应试交互系统。

---

## 当前状态分析

### 现有系统
- **Question 类型**: `{ id, category, type, title, options, answer, explanation, sceneConfig }` — 仅支持选择题
- **题目数据**: `src/data/questions.ts` — 8道选择题
- **ExamDrawer**: 按分类分组展示，支持3D可视化、显示/隐藏答案
- **Store**: `activeQuestion`, `isExamDrawerOpen`, `applySceneConfig()`

### 缺失功能
- 题库数量严重不足（8题 vs 需100+）
- 题型仅选择题（缺填空、简答、读图题）
- 无答题记录持久化
- 无搜索筛选功能
- 无错题本

---

## 详细变更

### 1. 扩展 Question 类型支持多题型 (ISSUE-012)

**文件**: `src/types/index.ts`

**变更**: 扩展 Question 接口

```ts
export type QuestionType = 'choice' | 'fill-blank' | 'short-answer' | 'diagram';

export interface Question {
  id: string;
  category: string;           // 知识点分类
  type: QuestionType;          // 题型
  difficulty: 'easy' | 'medium' | 'hard';  // 难度
  source?: string;             // 来源（如"2024全国卷I"）
  title: string;
  options?: string[];          // 选择题选项（其他题型可选）
  answer: number | string;     // 选择题: 0-based索引; 填空/简答: 参考答案字符串
  explanation: string;
  sceneConfig?: SceneConfig;   // 3D场景配置（可选）
  diagramUrl?: string;         // 读图题图片URL
  keyPoints?: string[];        // 涉及的知识点标签
}
```

### 2. 新增答题记录类型

**文件**: `src/types/index.ts`

```ts
export interface AnswerRecord {
  questionId: string;
  userAnswer: string;          // 用户答案
  isCorrect: boolean;
  timestamp: number;           // 答题时间戳
  timeSpent?: number;          // 答题耗时（秒）
}

export interface ExamStats {
  totalAnswered: number;
  correctCount: number;
  wrongQuestionIds: string[];  // 错题ID列表
  categoryStats: Record<string, { total: number; correct: number }>; // 分类统计
  recentRecords: AnswerRecord[];
}
```

### 3. 题库扩充至100+道 (ISSUE-011)

**文件**: `src/data/questions.ts` → 重构为 `src/data/questions/` 目录

按知识点分类拆分文件，每个文件10-20题：

| 知识点 | 文件 | 选择题 | 填空题 | 简答题 | 读图题 | 合计 |
|--------|------|--------|--------|--------|--------|------|
| 地球自转与昼夜 | `earth-rotation.ts` | 6 | 3 | 2 | 2 | 13 |
| 地方时与时区 | `timezone.ts` | 6 | 4 | 2 | 1 | 13 |
| 太阳直射点移动 | `solar-declination.ts` | 5 | 3 | 2 | 2 | 12 |
| 昼夜长短变化 | `day-night-length.ts` | 5 | 3 | 2 | 2 | 12 |
| 正午太阳高度角 | `solar-altitude.ts` | 5 | 4 | 2 | 1 | 12 |
| 四季与五带 | `seasons-zones.ts` | 5 | 2 | 2 | 2 | 11 |
| 黄赤交角 | `obliquity.ts` | 5 | 3 | 2 | 1 | 11 |
| 晨昏线判读 | `terminator.ts` | 4 | 2 | 2 | 2 | 10 |
| 综合应用 | `comprehensive.ts` | 4 | 3 | 3 | 2 | 12 |
| **合计** | | **45** | **27** | **19** | **15** | **106** |

**覆盖范围**: 近5年高考真题改编 + 各地模拟题 + 教材经典例题

### 4. 答题记录与进度追踪 (ISSUE-013)

**新建文件**: `src/utils/examStorage.ts`

**功能**:
- `saveAnswer(record: AnswerRecord)`: 保存答题记录到 localStorage
- `getStats(): ExamStats`: 获取统计汇总
- `getWrongQuestions(): AnswerRecord[]`: 获取错题列表
- `getCategoryProgress(category: string)`: 获取某分类学习进度
- `clearHistory()`: 清除历史
- `exportData()`: 导出答题数据为JSON

**新建组件**: `src/components/UI/ExamStatsPanel.tsx`

**功能**:
- 总答题数/正确率环形图
- 各分类掌握度进度条
- 最近答题记录列表
- 薄弱知识点高亮提示
- 数据导出按钮

### 5. 题目搜索与筛选 (ISSUE-014)

**修改文件**: `src/components/UI/ExamDrawer.tsx`

**新增功能**:
- 顶部搜索框：支持题目关键词搜索（标题、知识点）
- 题型筛选：全部/选择题/填空题/简答题/读图题
- 难度筛选：全部/简单/中等/困难
- 知识点筛选：下拉多选
- 筛选结果计数显示

**实现方式**:
- 使用 `useMemo` 对 questions 数组进行多条件过滤
- 搜索使用 `title.includes(keyword)` 和 `keyPoints.includes(keyword)`
- 筛选项使用 Chip/Badge 组件样式

### 6. 错题本功能 (ISSUE-015)

**修改文件**: `src/components/UI/ExamDrawer.tsx`

**新增功能**:
- 错题本标签页切换（全部题目 / 错题本）
- 错题自动收集：答题后判定为错误则自动加入错题本
- 错题复习模式：仅显示错题，可重新作答
- 错题清空按钮
- 错题导出功能

**实现方式**:
- 错题本数据从 `examStorage.getWrongQuestions()` 获取
- 错题本视图复用题目列表渲染逻辑，但仅显示错题
- 重新作答后如果正确，可选择从错题本移除

### 7. 多题型答题交互 (ISSUE-012)

**修改文件**: `src/components/UI/ExamDrawer.tsx`

**新增交互**:
- **选择题**: 保持现有交互（点击选项选择）
- **填空题**: 显示文本输入框，提交后与参考答案比对（支持多个可接受答案）
- **简答题**: 显示文本域输入框，提交后显示参考答案，用户自行比对判断
- **读图题**: 显示 `diagramUrl` 图片 + 选择/填空组合

**评分逻辑**:
- 选择题：用户选择 === answer（索引） → 正确
- 填空题：用户输入.trim() 包含在参考答案中 → 正确
- 简答题：用户自行判断，默认标记为"待批改"，可手动标记正确/错误
- 读图题：同选择题逻辑

---

## 实施步骤

### 步骤1: 类型扩展
- 修改 `src/types/index.ts`：扩展 Question、新增 AnswerRecord、ExamStats
- 更新 `src/store/useStore.ts`：新增 examStats 相关状态

### 步骤2: localStorage 存储层
- 创建 `src/utils/examStorage.ts`
- 实现 saveAnswer / getStats / getWrongQuestions / clearHistory

### 步骤3: 题库扩充
- 创建 `src/data/questions/` 目录
- 按知识点拆分9个文件，每文件10-13题
- 创建 `src/data/questions/index.ts` 统一导出

### 步骤4: ExamDrawer 重构
- 添加搜索框和筛选器（搜索/题型/难度/知识点）
- 添加错题本标签页切换
- 添加多题型答题交互（填空/简答/读图）
- 集成答题记录保存

### 步骤5: ExamStatsPanel 统计面板
- 创建统计面板组件
- 集成到 ExamDrawer 或独立页面

### 步骤6: 验证
- TypeScript 编译
- Vite 构建
- 功能测试：答题→记录→统计→错题本→筛选→搜索

---

## 假设与决策

1. **简答题评分**: 不自动判分，由用户自行判断并手动标记。这是合理的，因为简答题无法用简单字符串匹配评判
2. **localStorage 持久化**: 使用 localStorage 而非后端数据库，数据在浏览器本地存储
3. **题目来源**: 基于高考真题和模拟题改编，确保知识点覆盖完整
4. **错题本**: 错题基于用户答题判定结果自动收集，用户可手动移除已掌握的错题
5. **搜索**: 使用客户端内存搜索，不依赖后端