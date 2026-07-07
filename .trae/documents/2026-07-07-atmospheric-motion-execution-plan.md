# 大气的运动教学系统 - 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成高中地理"大气的运动"实验教学系统的开发、测试与部署，确保构建通过、功能完整、教学效果显著。

**Architecture:** 基于 React 18 + TypeScript + Vite + Three.js(@react-three/fiber) 构建单页 3D 教学系统。左侧知识导航面板、中央 3D 场景、右侧控制面板、底部时间控制栏。使用 Zustand 管理全局状态。

**Tech Stack:** React 18, TypeScript 5.x, Vite 6, Three.js, @react-three/fiber v9, @react-three/drei v10, Zustand, Tailwind CSS v4, Lucide React

---

## 当前状态分析

**已完成：**
- 项目基础架构（Vite + React + TS + Tailwind）
- 类型定义系统 (`src/types/`)
- Zustand 状态管理 (`src/store/`)
- 数据层（气压带风带、季风数据、题库）
- 3D 场景组件（地球、大气层、气压带圆环、风带粒子、环流细胞、锋面、气旋/反气旋、季风）
- UI 面板（知识导航、气压风带控制、锋面控制、气旋控制、月份滑块）
- 主页面框架与场景切换逻辑

**已知问题：**
1. `AtmosphereIndexPage` 和 `MonthSlider` 中存在重复的自动播放 `useEffect`，会导致计时器冲突
2. `AtmosphereIndexPage` 顶部标签页包含"气候影响"，但 `climate-zone` 模式无对应场景实现
3. 缺少准静止锋 (`stationary-front`) 的 3D 演示组件
4. 题库数据已存在但无展示/交互界面
5. 地球当前为纯色材质，无纹理
6. 尚未验证 `npm run build` 是否能通过
7. `data/atmosphere/index.ts` 未导出 `quizAtmosphere.ts`
8. 右侧面板缺少风速调节滑块（store 中已有 `animationSpeed`）

---

## Task 1: 修复构建错误与代码缺陷

**Files:**
- Modify: `src/components/UI/Atmosphere/MonthSlider.tsx`
- Modify: `src/pages/AtmosphereIndexPage.tsx`
- Modify: `src/data/atmosphere/index.ts`
- Modify: `src/store/atmosphereSlice.ts`

- [ ] **Step 1: 移除 MonthSlider 中重复的自动播放逻辑**

MonthSlider 中的 `useEffect` 与 AtmosphereIndexPage 中的重复，保留 AtmosphereIndexPage 中的即可。删除 MonthSlider 中的 `useEffect`：

```tsx
// 删除以下代码块
useEffect(() => {
  if (!isPlaying) return;
  const interval = setInterval(() => {
    setMonth(month >= 12 ? 1 : month + 1);
  }, 2000 / animationSpeed);
  return () => clearInterval(interval);
}, [isPlaying, animationSpeed, month, setMonth]);
```

- [ ] **Step 2: 在 AtmosphereIndexPage 中添加 animationSpeed 依赖**

确认 AtmosphereIndexPage 中的自动播放 `useEffect` 已包含 `animationSpeed` 依赖（当前已包含，无需修改）。

- [ ] **Step 3: 导出题库数据**

修改 `src/data/atmosphere/index.ts`：

```ts
export * from './pressureWindData';
export * from './monsoonData';
export * from './quizAtmosphere';
```

- [ ] **Step 4: 运行构建验证**

Run: `npm run build`
Expected: 构建成功，无 TypeScript 错误

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "fix: remove duplicate autoplay timer, export quiz data, verify build"
```

---

## Task 2: 添加准静止锋 3D 演示组件

**Files:**
- Create: `src/components/Scene/Atmosphere/StationaryFrontDemo.tsx`
- Modify: `src/pages/AtmosphereIndexPage.tsx`

- [ ] **Step 1: 创建准静止锋组件**

```tsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FrontPlane } from './FrontPlane';

const EARTH_RADIUS = 5;

export function StationaryFrontDemo({ visible = true }: { visible?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current || !visible) return;
    timeRef.current += delta * 0.15;
    // 准静止锋：来回小幅摆动，模拟僵持状态
    groupRef.current.position.x = Math.sin(timeRef.current) * 0.5;
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      <FrontPlane
        color="#7B1FA2"
        slopeAngle={45}
        width={9}
        height={3.5}
        position={[0, EARTH_RADIUS + 0.4, 0]}
        moveDirection={90}
        moveSpeed={0}
      />

      {/* 锋面附近大量降水云 */}
      {Array.from({ length: 35 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 3,
            EARTH_RADIUS + 1 + Math.random() * 2,
            (Math.random() - 0.5) * 5,
          ]}
        >
          <sphereGeometry args={[0.18 + Math.random() * 0.1, 8, 8]} />
          <meshBasicMaterial color="#9FA8DA" transparent opacity={0.65} />
        </mesh>
      ))}

      {/* 标注线 */}
      <mesh position={[0, EARTH_RADIUS + 2.5, 0]}>
        <boxGeometry args={[6, 0.03, 0.03]} />
        <meshBasicMaterial color="#7B1FA2" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
```

- [ ] **Step 2: 在主页面导入并渲染准静止锋**

修改 `src/pages/AtmosphereIndexPage.tsx`，在导入区添加：

```tsx
import { StationaryFrontDemo } from '@/components/Scene/Atmosphere/StationaryFrontDemo';
```

在 `renderScene` 函数的 switch case 中添加：

```tsx
case 'stationary-front':
  return <StationaryFrontDemo visible />;
```

- [ ] **Step 3: 运行构建验证**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add stationary front 3D demo component"
```

---

## Task 3: 添加题库测验交互界面

**Files:**
- Create: `src/components/UI/Atmosphere/QuizPanel.tsx`
- Modify: `src/pages/AtmosphereIndexPage.tsx`
- Modify: `src/store/atmosphereSlice.ts`
- Modify: `src/types/atmosphere.ts`

- [ ] **Step 1: 扩展 store 支持测验状态**

修改 `src/types/atmosphere.ts`，在 `AtmosphereState` 中添加：

```ts
export interface AtmosphereState {
  // ... 现有字段
  showQuiz: boolean;
  currentQuizIndex: number;
  quizScore: number;
  quizAnswers: Record<string, string>;
}
```

修改 `src/store/atmosphereSlice.ts`，添加对应状态和 actions：

```ts
export interface AtmosphereSlice extends AtmosphereState {
  // ... 现有 actions
  toggleQuiz: () => void;
  setCurrentQuizIndex: (i: number) => void;
  answerQuestion: (questionId: string, answer: string) => void;
  resetQuiz: () => void;
}

export const createAtmosphereSlice: StateCreator<AtmosphereSlice> = (set) => ({
  // ... 现有初始状态
  showQuiz: false,
  currentQuizIndex: 0,
  quizScore: 0,
  quizAnswers: {},

  // ... 现有 actions
  toggleQuiz: () => set((state) => ({ showQuiz: !state.showQuiz })),
  setCurrentQuizIndex: (i) => set({ currentQuizIndex: i }),
  answerQuestion: (questionId, answer) =>
    set((state) => ({
      quizAnswers: { ...state.quizAnswers, [questionId]: answer },
    })),
  resetQuiz: () => set({ currentQuizIndex: 0, quizScore: 0, quizAnswers: {} }),
});
```

- [ ] **Step 2: 创建测验面板组件**

```tsx
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { atmosphereQuestions } from '@/data/atmosphere';
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

export function QuizPanel() {
  const {
    currentQuizIndex,
    quizAnswers,
    setCurrentQuizIndex,
    answerQuestion,
    resetQuiz,
  } = useStore();

  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const question = atmosphereQuestions[currentQuizIndex];
  const hasAnswered = quizAnswers[question.id] !== undefined;
  const isCorrect = hasAnswered && quizAnswers[question.id] === question.answer;

  const handleAnswer = (option: string) => {
    if (hasAnswered) return;
    answerQuestion(question.id, option.charAt(0));
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuizIndex < atmosphereQuestions.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setShowExplanation(false);
    }
  };

  const handlePrev = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex(currentQuizIndex - 1);
      setShowExplanation(false);
    }
  };

  const handleReset = () => {
    resetQuiz();
    setShowResult(false);
    setShowExplanation(false);
  };

  const correctCount = atmosphereQuestions.filter(
    (q) => quizAnswers[q.id] === q.answer
  ).length;

  if (showResult) {
    return (
      <div className="p-4 space-y-4 text-white">
        <h2 className="text-lg font-bold">测验结果</h2>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-blue-400">{correctCount} / {atmosphereQuestions.length}</p>
          <p className="text-gray-400 text-sm mt-2">
            正确率: {Math.round((correctCount / atmosphereQuestions.length) * 100)}%
          </p>
        </div>
        <button
          onClick={handleReset}
          className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          重新测验
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 text-white">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">随堂测验</h2>
        <span className="text-sm text-gray-400">
          {currentQuizIndex + 1} / {atmosphereQuestions.length}
        </span>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 space-y-3">
        <p className="text-sm leading-relaxed">{question.question}</p>

        {question.options && (
          <div className="space-y-2">
            {question.options.map((option) => {
              const optionLetter = option.charAt(0);
              const isSelected = quizAnswers[question.id] === optionLetter;
              const isAnswer = optionLetter === question.answer;

              let bgClass = 'bg-gray-700 hover:bg-gray-600';
              if (hasAnswered) {
                if (isAnswer) bgClass = 'bg-green-900/50 border border-green-600';
                else if (isSelected) bgClass = 'bg-red-900/50 border border-red-600';
                else bgClass = 'bg-gray-700 opacity-50';
              }

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={hasAnswered}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${bgClass}`}
                >
                  <div className="flex items-center gap-2">
                    {hasAnswered && isAnswer && <CheckCircle className="w-4 h-4 text-green-400" />}
                    {hasAnswered && isSelected && !isAnswer && <XCircle className="w-4 h-4 text-red-400" />}
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {showExplanation && (
          <div className="bg-blue-900/30 border border-blue-700/50 rounded p-3 text-xs text-gray-300">
            <p className="font-semibold text-blue-300 mb-1">解析：</p>
            <p>{question.explanation}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          onClick={handlePrev}
          disabled={currentQuizIndex === 0}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-30 flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          上一题
        </button>

        {currentQuizIndex === atmosphereQuestions.length - 1 ? (
          <button
            onClick={() => setShowResult(true)}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded"
          >
            查看结果
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded flex items-center gap-1"
          >
            下一题
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <button
        onClick={handleReset}
        className="w-full py-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        重新开始
      </button>
    </div>
  );
}
```

- [ ] **Step 3: 在主页面集成测验面板**

修改 `src/pages/AtmosphereIndexPage.tsx`，在右侧面板渲染逻辑中添加测验入口：

在顶部导入区添加：
```tsx
import { QuizPanel } from '@/components/UI/Atmosphere/QuizPanel';
import { BookOpen } from 'lucide-react';
```

在 state 解构中添加：
```tsx
const showQuiz = useStore((s) => s.showQuiz);
const toggleQuiz = useStore((s) => s.toggleQuiz);
```

在右侧工具面板上方添加测验切换按钮（在右侧面板 div 内部开头）：

修改右侧面板区域：
```tsx
<div className="w-72 flex-shrink-0 bg-gray-900/90 border-l border-gray-700 overflow-y-auto">
  <div className="p-3 border-b border-gray-700 flex gap-2">
    <button
      onClick={() => toggleQuiz()}
      className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
        showQuiz ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
      }`}
    >
      <BookOpen className="w-3 h-3 inline mr-1" />
      随堂测验
    </button>
  </div>
  {showQuiz ? <QuizPanel /> : renderRightPanel()}
</div>
```

- [ ] **Step 4: 运行构建验证**

Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add interactive quiz panel with 12 atmosphere questions"
```

---

## Task 4: 优化 3D 场景视觉效果

**Files:**
- Modify: `src/components/Scene/Earth.tsx`
- Modify: `src/pages/AtmosphereIndexPage.tsx`
- Create: `public/earth-texture.jpg` (可选，如网络允许)

- [ ] **Step 1: 增强地球视觉效果**

修改 `src/components/Scene/Earth.tsx`，添加经纬线网格：

```tsx
import * as THREE from 'three';

export function Earth() {
  return (
    <group>
      {/* 地球本体 */}
      <mesh>
        <sphereGeometry args={[5, 64, 64]} />
        <meshPhongMaterial
          color="#1a5276"
          emissive="#0d1b2a"
          specular="#2e86c1"
          shininess={25}
        />
      </mesh>

      {/* 经纬线网格 */}
      <lineSegments>
        <wireframeGeometry args={[new THREE.SphereGeometry(5.01, 36, 18)]} />
        <lineBasicMaterial color="#2e86c1" transparent opacity={0.15} />
      </lineSegments>

      {/* 赤道线 */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.98, 5.02, 128]} />
        <meshBasicMaterial color="#E53935" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* 南北回归线 */}
      {[23.5, -23.5].map((lat, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[0, 5 * Math.sin(THREE.MathUtils.degToRad(lat)), 0]}>
          <ringGeometry args={[5 * Math.cos(THREE.MathUtils.degToRad(lat)) - 0.02, 5 * Math.cos(THREE.MathUtils.degToRad(lat)) + 0.02, 128]} />
          <meshBasicMaterial color="#FB8C00" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* 极圈 */}
      {[66.5, -66.5].map((lat, i) => (
        <mesh key={`polar-${i}`} rotation={[Math.PI / 2, 0, 0]} position={[0, 5 * Math.sin(THREE.MathUtils.degToRad(lat)), 0]}>
          <ringGeometry args={[5 * Math.cos(THREE.MathUtils.degToRad(lat)) - 0.02, 5 * Math.cos(THREE.MathUtils.degToRad(lat)) + 0.02, 128]} />
          <meshBasicMaterial color="#00ACC1" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}
```

- [ ] **Step 2: 优化光照**

修改 `src/pages/AtmosphereIndexPage.tsx` 中的光照设置：

```tsx
<ambientLight intensity={0.12} />
<pointLight position={[10, 10, 10]} intensity={250} color="#fff8e7" />
<pointLight position={[-10, -5, -10]} intensity={30} color="#4a90d9" />
```

- [ ] **Step 3: 运行构建验证**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "style: enhance earth visuals with grid lines, equator, tropics, and polar circles"
```

---

## Task 5: 添加气候影响演示基础

**Files:**
- Create: `src/components/Scene/Atmosphere/ClimateZoneScene.tsx`
- Create: `src/components/UI/Atmosphere/ClimateZonePanel.tsx`
- Modify: `src/pages/AtmosphereIndexPage.tsx`

- [ ] **Step 1: 创建气候带场景组件**

```tsx
import { useMemo } from 'react';
import * as THREE from 'three';

interface ClimateZone {
  name: string;
  latStart: number;
  latEnd: number;
  color: string;
  climate: string;
  features: string;
}

const CLIMATE_ZONES: ClimateZone[] = [
  {
    name: '热带雨林气候区',
    latStart: -10,
    latEnd: 10,
    color: '#1B5E20',
    climate: '热带雨林气候',
    features: '终年高温多雨',
  },
  {
    name: '热带草原/沙漠气候区',
    latStart: 10,
    latEnd: 23.5,
    color: '#F57F17',
    climate: '热带草原/沙漠气候',
    features: '干湿季分明/炎热干燥',
  },
  {
    name: '地中海气候区',
    latStart: 23.5,
    latEnd: 35,
    color: '#E65100',
    climate: '地中海气候',
    features: '夏季炎热干燥，冬季温和多雨',
  },
  {
    name: '温带季风/大陆性气候区',
    latStart: 35,
    latEnd: 55,
    color: '#1565C0',
    climate: '温带季风/大陆性气候',
    features: '四季分明，雨热同期',
  },
  {
    name: '温带海洋性气候区',
    latStart: 40,
    latEnd: 60,
    color: '#00695C',
    climate: '温带海洋性气候',
    features: '终年温和湿润',
  },
  {
    name: '亚寒带/寒带气候区',
    latStart: 55,
    latEnd: 90,
    color: '#455A64',
    climate: '亚寒带针叶林/极地气候',
    features: '寒冷漫长',
  },
];

const EARTH_RADIUS = 5;

export function ClimateZoneScene() {
  const zones = useMemo(() => {
    return CLIMATE_ZONES.map((zone) => {
      const latStartRad = THREE.MathUtils.degToRad(zone.latStart);
      const latEndRad = THREE.MathUtils.degToRad(zone.latEnd);
      const avgLat = (latStartRad + latEndRad) / 2;
      const height = Math.abs(Math.sin(latEndRad) - Math.sin(latStartRad)) * EARTH_RADIUS;
      const y = EARTH_RADIUS * Math.sin(avgLat);
      const radius = EARTH_RADIUS * Math.cos(avgLat) + 0.05;

      return { ...zone, y, height, radius };
    });
  }, []);

  return (
    <group>
      {zones.map((zone) => (
        <mesh key={zone.name} position={[0, zone.y, 0]}>
          <cylinderGeometry args={[zone.radius, zone.radius, zone.height, 64, 1, true]} />
          <meshPhongMaterial
            color={zone.color}
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* 南半球对称 */}
      {zones.map((zone) => (
        <mesh key={`${zone.name}-south`} position={[0, -zone.y, 0]}>
          <cylinderGeometry args={[zone.radius, zone.radius, zone.height, 64, 1, true]} />
          <meshPhongMaterial
            color={zone.color}
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
```

- [ ] **Step 2: 创建气候带控制面板**

```tsx
const CLIMATE_DATA = [
  { name: '热带雨林气候', pressure: '赤道低气压带', wind: '赤道无风带', precip: '全年多雨', color: '#1B5E20' },
  { name: '热带沙漠气候', pressure: '副热带高气压带', wind: '信风带', precip: '全年少雨', color: '#F57F17' },
  { name: '地中海气候', pressure: '副热带高气压带/西风带', wind: '西风带', precip: '冬雨型', color: '#E65100' },
  { name: '温带海洋性气候', pressure: '西风带', wind: '盛行西风', precip: '全年湿润', color: '#00695C' },
  { name: '温带季风气候', pressure: '海陆热力差异', wind: '季风', precip: '夏雨型', color: '#1565C0' },
  { name: '极地气候', pressure: '极地高气压带', wind: '极地东风', precip: '全年少雨', color: '#455A64' },
];

export function ClimateZonePanel() {
  return (
    <div className="p-4 space-y-6 text-white">
      <h2 className="text-lg font-bold">气压带风带与气候</h2>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">气候类型与成因</h3>
        <div className="space-y-2">
          {CLIMATE_DATA.map((item) => (
            <div key={item.name} className="bg-gray-800 rounded-lg p-2.5 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <div className="text-xs text-gray-400 space-y-0.5 pl-5">
                <p>气压带/风带: {item.pressure}</p>
                <p>降水特征: {item.precip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-3 space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">核心规律</h3>
        <div className="text-gray-300 text-xs space-y-1">
          <p>• 低压带 + 上升气流 → 多雨</p>
          <p>• 高压带 + 下沉气流 → 少雨</p>
          <p>• 西风带（低纬→高纬）→ 多雨</p>
          <p>• 信风带（高纬→低纬）→ 少雨</p>
          <p>• 大陆东岸季风 → 夏雨型</p>
          <p>• 大陆西岸西风 → 年雨型</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 在主页面集成气候带场景**

修改 `src/pages/AtmosphereIndexPage.tsx`：

导入：
```tsx
import { ClimateZoneScene } from '@/components/Scene/Atmosphere/ClimateZoneScene';
import { ClimateZonePanel } from '@/components/UI/Atmosphere/ClimateZonePanel';
```

在 `renderScene` 中添加：
```tsx
case 'climate-zone':
  return <ClimateZoneScene />;
```

在 `renderRightPanel` 中添加：
```tsx
case 'climate-zone':
  return <ClimateZonePanel />;
```

- [ ] **Step 4: 运行构建验证**

Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add climate zone visualization and control panel"
```

---

## Task 6: 启动开发服务器并功能测试

**Files:**
- N/A (runtime verification)

- [ ] **Step 1: 启动开发服务器**

Run: `npm run dev`
Expected: Server starts at `http://localhost:5173/`

- [ ] **Step 2: 逐项功能验证**

1. 页面加载正常，3D 地球显示，无黑屏
2. 左侧知识面板可展开/收起，点击子项可切换场景
3. 顶部标签页切换正常（气压带和风带、常见天气系统、气候影响）
4. 气压带风带场景：显示/隐藏气压带、风带、环流细胞开关正常工作
5. 月份滑块拖动时，气压带风带随季节移动
6. 自动播放按钮正常工作，月份循环变化
7. 冷锋场景：锋面动画和降水云显示
8. 暖锋场景：锋面动画和降水云显示
9. 准静止锋场景：小幅摆动动画
10. 气旋/反气旋场景：半球切换正常，旋转方向正确
11. 季风场景：根据月份显示冬/夏季风
12. 气候影响场景：显示各气候带半透明覆盖层
13. 随堂测验：答题、切换题目、查看解析、查看结果正常
14. 地球经纬线、赤道、回归线、极圈清晰可见

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "test: verify all features working in dev server"
```

---

## Task 7: 生产构建与部署

**Files:**
- Modify: `vite.config.ts` (如需调整 base 路径)

- [ ] **Step 1: 生产构建**

Run: `npm run build`
Expected: `dist/` 目录生成，无错误

- [ ] **Step 2: 验证生产构建**

检查 `dist/index.html` 存在且引用正确的资源路径。

- [ ] **Step 3: 推送到 GitHub 并部署到 Netlify**

```bash
git add -A
git commit -m "build: production build for atmospheric motion teaching system"
git push origin master
```

确认 Netlify 自动部署成功。

---

## 自查清单

**1. Spec coverage (课本内容对应):**
- [x] 第一节 常见天气系统：锋与天气（冷锋、暖锋、准静止锋）→ Task 2
- [x] 第一节 常见天气系统：低气压(气旋)、高气压(反气旋) → 已有
- [x] 第二节 气压带和风带：三圈环流 → 已有
- [x] 第二节 气压带和风带：气压带与风带 → 已有
- [x] 第二节 气压带和风带：季节移动 → 已有
- [x] 第二节 气压带和风带：季风环流 → 已有
- [x] 第三节 气压带和风带对气候的影响 → Task 5
- [x] 随堂测验（应试特征）→ Task 3

**2. Placeholder scan:** 无 TBD/TODO/implement later

**3. Type consistency:** `AtmosphereSlice` 扩展与 `AtmosphereState` 字段一致；quiz actions 使用 string 类型的 questionId

---

## 执行方式选择

**Plan complete and saved to `.trae/documents/2026-07-07-atmospheric-motion-execution-plan.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
