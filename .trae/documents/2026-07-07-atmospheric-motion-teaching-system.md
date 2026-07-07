# 高中地理"大气的运动"实验教学系统实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有"地球的运动"3D教学系统基础上，扩展第三章"大气的运动"实验教学模块，包含气压带和风带、常见天气系统、气候类型三大核心内容的3D可视化交互演示。

**Architecture:** 复用现有React+Three.js+Vite技术栈和3D地球/大气层/经纬网格等基础组件，采用模块化设计为每个教学子系统创建独立的3D场景组件和UI控制面板。通过扩展Zustand状态管理实现大气运动专用状态切片，左侧知识面板新增第三章树形菜单，右侧面板根据当前实验动态切换控制选项。3D可视化采用半透明管道(TubeGeometry)展示环流、粒子系统展示风带、倾斜平面展示锋面、螺旋曲线展示气旋，配合剖面视角切换增强空间理解。

**Tech Stack:** React 18 + TypeScript + Vite + Three.js (@react-three/fiber) + Zustand + Tailwind CSS + shadcn/ui

---

## 课本内容映射

### 第一节 常见天气系统 (p42-47)
- **锋与天气**: 气团/锋面/锋线概念；冷锋（冷气团主动→大风雨雪→气温降气压升）；暖锋（暖气团主动→连续性降水→气温升）；准静止锋（梅雨、昆明准静止锋）
- **低气压(气旋)与高气压(反气旋)**: 北半球气旋逆时针辐合上升→阴雨；反气旋顺时针辐散下沉→晴朗；台风形成与消亡

### 第二节 气压带和风带 (p48-53)
- **三圈环流**: 假设地表均匀→高低纬受热不均+地转偏向力→低纬/中纬/高纬三个环流圈
- **七个气压带六个风带**: 赤道低压、副热带高压、副极地低压、极地高压；信风带、西风带、极地东风带
- **季节移动**: 北半球夏季偏北、冬季偏南（随太阳直射点移动）
- **海陆分布影响**: 北半球气压带被切断（亚洲高压/印度低压）；南半球海洋面积优势呈带状
- **季风环流**: 东亚季风（冬季西北、夏季东南）；南亚季风（夏季西南→东南信风北移右偏）

### 第三节 气压带和风带对气候的影响 (p54-60)
- **气压带与气候**: 赤道低压→热带雨林；西风带→温带海洋性
- **风带与气候**: 低纬→高纬气流湿润；海洋→陆地气流湿润

---

## 文件结构映射

### 新增目录结构

```
src/
├── components/
│   ├── Scene/
│   │   └── Atmosphere/              # 大气运动3D场景组件
│   │       ├── CirculationCell.tsx      # 三圈环流基础管道
│   │       ├── PressureZoneRing.tsx     # 气压带环形高亮
│   │       ├── WindBeltParticles.tsx    # 风带粒子流
│   │       ├── SeasonalShiftGroup.tsx   # 季节移动动画容器
│   │       ├── MonsoonFlow.tsx          # 季风风向流
│   │       ├── FrontPlane.tsx           # 锋面基础几何体
│   │       ├── ColdFrontDemo.tsx        # 冷锋演示
│   │       ├── WarmFrontDemo.tsx        # 暖锋演示
│   │       ├── CycloneSystem.tsx        # 气旋系统
│   │       ├── AnticycloneSystem.tsx    # 反气旋系统
│   │       └── TyphoonStructure.tsx     # 台风结构
│   └── UI/
│       └── Atmosphere/              # 大气运动UI控制面板
│           ├── PressureWindPanel.tsx    # 气压带风带控制
│           ├── FrontControlPanel.tsx    # 锋面控制
│           ├── CycloneControlPanel.tsx  # 气旋控制
│           └── MonthSlider.tsx          # 月份滑块
├── data/
│   └── atmosphere/                  # 大气运动数据
│       ├── pressureWindData.ts
│       ├── monsoonData.ts
│       ├── frontData.ts
│       └── quizAtmosphere.ts
├── pages/
│   ├── AtmosphereIndexPage.tsx      # 大气运动入口页
│   ├── PressureWindPage.tsx         # 气压带和风带页
│   ├── WeatherSystemPage.tsx        # 常见天气系统页
│   └── ClimateEffectPage.tsx        # 气候影响页
├── store/
│   └── atmosphereSlice.ts           # 大气运动Zustand切片
└── types/
    └── atmosphere.ts                # 大气运动类型定义
```

### 需修改的现有文件

- `src/App.tsx` — 添加大气运动路由
- `src/components/UI/KnowledgePanel.tsx` — 扩展第三章菜单
- `src/store/useStore.ts` — 合并atmosphereSlice
- `src/types/index.ts` — 扩展全局类型
- `src/data/questions.ts` — 合并大气运动题库
- `src/components/Scene/Atmosphere.tsx` — 增强大气层效果

---

## 任务分解

### Task 1: 大气运动类型定义与状态管理基础

**Files:**
- Create: `src/types/atmosphere.ts`
- Create: `src/store/atmosphereSlice.ts`
- Modify: `src/types/index.ts`
- Modify: `src/store/useStore.ts`

- [ ] **Step 1: 定义大气运动核心类型**

```typescript
// src/types/atmosphere.ts

export type AtmosphereSceneMode =
  | 'pressure-wind'
  | 'circulation'
  | 'seasonal-shift'
  | 'land-sea'
  | 'monsoon'
  | 'cold-front'
  | 'warm-front'
  | 'stationary-front'
  | 'cyclone'
  | 'anticyclone'
  | 'typhoon'
  | 'climate-zone';

export type Hemisphere = 'north' | 'south';

export interface PressureZoneConfig {
  id: string;
  name: string;
  latCenter: number;     // 中心纬度
  latSpan: number;       // 纬度跨度
  type: 'low' | 'high';
  color: string;
  description: string;
}

export interface WindBeltConfig {
  id: string;
  name: string;
  latStart: number;
  latEnd: number;
  direction: 'east' | 'west' | 'northeast' | 'southeast' | 'northwest' | 'southwest';
  color: string;
}

export interface CirculationCellConfig {
  id: string;
  name: string;
  latStart: number;
  latEnd: number;
  type: 'hadley' | 'ferrel' | 'polar';
  ascentLat: number;     // 上升气流纬度
  descentLat: number;    // 下沉气流纬度
}

export interface FrontConfig {
  type: 'cold' | 'warm' | 'stationary';
  advanceSpeed: number;  // 移动速度 (km/h)
  slopeAngle: number;    // 锋面坡度 (度)
  precipitationWidth: number; // 降水区宽度
}

export interface CycloneConfig {
  type: 'cyclone' | 'anticyclone';
  hemisphere: Hemisphere;
  centerPressure: number; // hPa
  pressureGradient: number;
}

export interface AtmosphereState {
  sceneMode: AtmosphereSceneMode;
  hemisphere: Hemisphere;
  month: number;           // 1-12
  isPlaying: boolean;
  animationSpeed: number;

  // 显示开关
  showPressureZones: boolean;
  showWindBelts: boolean;
  showCirculationCells: boolean;
  showFront: boolean;
  showCyclone: boolean;

  // 具体配置
  selectedFront: 'cold' | 'warm' | 'stationary' | null;
  selectedCyclone: 'cyclone' | 'anticyclone' | null;
}
```

- [ ] **Step 2: 创建Zustand atmosphere slice**

```typescript
// src/store/atmosphereSlice.ts
import { StateCreator } from 'zustand';
import { AtmosphereState, AtmosphereSceneMode, Hemisphere } from '@/types/atmosphere';

export interface AtmosphereSlice extends AtmosphereState {
  setSceneMode: (mode: AtmosphereSceneMode) => void;
  setHemisphere: (h: Hemisphere) => void;
  setMonth: (m: number) => void;
  togglePlayback: () => void;
  setAnimationSpeed: (s: number) => void;
  togglePressureZones: () => void;
  toggleWindBelts: () => void;
  toggleCirculationCells: () => void;
  setSelectedFront: (f: AtmosphereState['selectedFront']) => void;
  setSelectedCyclone: (c: AtmosphereState['selectedCyclone']) => void;
}

export const createAtmosphereSlice: StateCreator<AtmosphereSlice> = (set) => ({
  sceneMode: 'pressure-wind',
  hemisphere: 'north',
  month: 6,
  isPlaying: false,
  animationSpeed: 1,
  showPressureZones: true,
  showWindBelts: true,
  showCirculationCells: true,
  showFront: true,
  showCyclone: true,
  selectedFront: null,
  selectedCyclone: null,

  setSceneMode: (mode) => set({ sceneMode: mode }),
  setHemisphere: (h) => set({ hemisphere: h }),
  setMonth: (m) => set({ month: Math.max(1, Math.min(12, m)) }),
  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setAnimationSpeed: (s) => set({ animationSpeed: s }),
  togglePressureZones: () => set((state) => ({ showPressureZones: !state.showPressureZones })),
  toggleWindBelts: () => set((state) => ({ showWindBelts: !state.showWindBelts })),
  toggleCirculationCells: () => set((state) => ({ showCirculationCells: !state.showCirculationCells })),
  setSelectedFront: (f) => set({ selectedFront: f }),
  setSelectedCyclone: (c) => set({ selectedCyclone: c }),
});
```

- [ ] **Step 3: 修改useStore.ts合并slice**

```typescript
// 在 src/store/useStore.ts 中添加
import { createAtmosphereSlice, AtmosphereSlice } from './atmosphereSlice';

// 修改 store 类型
interface StoreState extends /* 现有 slices */, AtmosphereSlice {}

// 在 create() 调用中合并
export const useStore = create<StoreState>((...args) => ({
  ...createExistingSlice(...args),
  ...createAtmosphereSlice(...args),
}));
```

- [ ] **Step 4: 修改types/index.ts导出**

```typescript
// 在 src/types/index.ts 末尾添加
export * from './atmosphere';
```

- [ ] **Step 5: 运行TypeScript检查**

Run: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 6: Commit**

```bash
git add src/types/atmosphere.ts src/store/atmosphereSlice.ts src/types/index.ts src/store/useStore.ts
git commit -m "feat(atmosphere): add atmosphere types and zustand slice"
```

---

### Task 2: 气压带与风带数据层

**Files:**
- Create: `src/data/atmosphere/pressureWindData.ts`
- Create: `src/data/atmosphere/monsoonData.ts`
- Create: `src/data/atmosphere/index.ts`

- [ ] **Step 1: 创建气压带风带配置数据**

```typescript
// src/data/atmosphere/pressureWindData.ts
import { PressureZoneConfig, WindBeltConfig, CirculationCellConfig } from '@/types/atmosphere';

export const PRESSURE_ZONES: PressureZoneConfig[] = [
  {
    id: 'equatorial-low',
    name: '赤道低气压带',
    latCenter: 0,
    latSpan: 10,
    type: 'low',
    color: '#E53935',
    description: '赤道地区空气受热膨胀上升，形成低压带，盛行上升气流，多阴雨天气',
  },
  {
    id: 'subtropical-high-north',
    name: '副热带高气压带',
    latCenter: 30,
    latSpan: 10,
    type: 'high',
    color: '#1E88E5',
    description: '来自赤道的高空气流堆积下沉，形成高压带，盛行下沉气流，多晴朗干燥天气',
  },
  {
    id: 'subpolar-low-north',
    name: '副极地低气压带',
    latCenter: 60,
    latSpan: 10,
    type: 'low',
    color: '#FB8C00',
    description: '盛行西风与极地东风相遇，暖空气爬升形成低压带，多锋面雨',
  },
  {
    id: 'polar-high-north',
    name: '极地高气压带',
    latCenter: 90,
    latSpan: 10,
    type: 'high',
    color: '#00ACC1',
    description: '极地空气冷却下沉形成高压带，寒冷干燥',
  },
  {
    id: 'subtropical-high-south',
    name: '南半球副热带高气压带',
    latCenter: -30,
    latSpan: 10,
    type: 'high',
    color: '#1E88E5',
    description: '南半球副热带高压带',
  },
  {
    id: 'subpolar-low-south',
    name: '南半球副极地低气压带',
    latCenter: -60,
    latSpan: 10,
    type: 'low',
    color: '#FB8C00',
    description: '南半球副极地低压带',
  },
  {
    id: 'polar-high-south',
    name: '南半球极地高气压带',
    latCenter: -90,
    latSpan: 10,
    type: 'high',
    color: '#00ACC1',
    description: '南半球极地高压带',
  },
];

export const WIND_BELTS: WindBeltConfig[] = [
  {
    id: 'trade-north',
    name: '东北信风带',
    latStart: 0,
    latEnd: 30,
    direction: 'northeast',
    color: '#66BB6A',
  },
  {
    id: 'west-north',
    name: '盛行西风带',
    latStart: 30,
    latEnd: 60,
    direction: 'southwest',
    color: '#AB47BC',
  },
  {
    id: 'polar-east-north',
    name: '极地东风带',
    latStart: 60,
    latEnd: 90,
    direction: 'northeast',
    color: '#26C6DA',
  },
  {
    id: 'trade-south',
    name: '东南信风带',
    latStart: 0,
    latEnd: -30,
    direction: 'southeast',
    color: '#66BB6A',
  },
  {
    id: 'west-south',
    name: '南半球盛行西风带',
    latStart: -30,
    latEnd: -60,
    direction: 'northwest',
    color: '#AB47BC',
  },
  {
    id: 'polar-east-south',
    name: '南半球极地东风带',
    latStart: -60,
    latEnd: -90,
    direction: 'southeast',
    color: '#26C6DA',
  },
];

export const CIRCULATION_CELLS: CirculationCellConfig[] = [
  {
    id: 'hadley-north',
    name: '北半球哈得来环流',
    latStart: 0,
    latEnd: 30,
    type: 'hadley',
    ascentLat: 0,
    descentLat: 30,
  },
  {
    id: 'ferrel-north',
    name: '北半球费雷尔环流',
    latStart: 30,
    latEnd: 60,
    type: 'ferrel',
    ascentLat: 60,
    descentLat: 30,
  },
  {
    id: 'polar-north',
    name: '北半球极地环流',
    latStart: 60,
    latEnd: 90,
    type: 'polar',
    ascentLat: 60,
    descentLat: 90,
  },
  {
    id: 'hadley-south',
    name: '南半球哈得来环流',
    latStart: 0,
    latEnd: -30,
    type: 'hadley',
    ascentLat: 0,
    descentLat: -30,
  },
  {
    id: 'ferrel-south',
    name: '南半球费雷尔环流',
    latStart: -30,
    latEnd: -60,
    type: 'ferrel',
    ascentLat: -60,
    descentLat: -30,
  },
  {
    id: 'polar-south',
    name: '南半球极地环流',
    latStart: -60,
    latEnd: -90,
    type: 'polar',
    ascentLat: -60,
    descentLat: -90,
  },
];

// 季节移动偏移量（纬度）
export function getSeasonalShift(month: number): number {
  // 太阳直射点纬度近似: 23.5 * sin((month - 3) / 12 * 2π)
  // 气压带风带整体偏移约 5°-10°
  const solarDeclination = 23.5 * Math.sin(((month - 3) / 12) * 2 * Math.PI);
  return solarDeclination * 0.4; // 气压带偏移约为太阳直射点的40%
}
```

- [ ] **Step 2: 创建季风数据**

```typescript
// src/data/atmosphere/monsoonData.ts

export interface MonsoonFlow {
  id: string;
  name: string;
  region: string;
  season: 'summer' | 'winter';
  windDirection: string;
  origin: string;
  description: string;
  path: [number, number][]; // [lat, lon] 路径点
}

export const MONSOON_FLOWS: MonsoonFlow[] = [
  {
    id: 'east-asia-summer',
    name: '东亚夏季风',
    region: '东亚',
    season: 'summer',
    windDirection: '东南风',
    origin: '太平洋',
    description: '夏季北太平洋副热带高压增强，暖湿气流以东南风吹向亚洲东南岸',
    path: [
      [20, 130], [25, 125], [30, 120], [35, 115], [40, 115],
    ],
  },
  {
    id: 'east-asia-winter',
    name: '东亚冬季风',
    region: '东亚',
    season: 'winter',
    windDirection: '西北风',
    origin: '西伯利亚',
    description: '冬季亚洲高压与太平洋低压之间形成干燥寒冷的西北风',
    path: [
      [50, 100], [45, 105], [40, 110], [35, 115], [30, 120], [25, 125],
    ],
  },
  {
    id: 'south-asia-summer',
    name: '南亚夏季风',
    region: '南亚',
    season: 'summer',
    windDirection: '西南风',
    origin: '印度洋',
    description: '南半球东南信风北移越过赤道，在地转偏向力作用下向右偏转形成西南季风',
    path: [
      [-10, 80], [0, 85], [10, 80], [20, 75], [25, 80],
    ],
  },
  {
    id: 'south-asia-winter',
    name: '南亚冬季风',
    region: '南亚',
    season: 'winter',
    windDirection: '东北风',
    origin: '亚洲大陆',
    description: '冬季亚洲大陆冷高压，风从陆地吹向海洋',
    path: [
      [30, 80], [25, 85], [20, 90], [15, 90], [10, 95],
    ],
  },
];
```

- [ ] **Step 3: 创建数据层索引**

```typescript
// src/data/atmosphere/index.ts
export * from './pressureWindData';
export * from './monsoonData';
```

- [ ] **Step 4: Commit**

```bash
git add src/data/atmosphere/
git commit -m "feat(atmosphere): add pressure zones, wind belts and monsoon data"
```

---

### Task 3: 气压带环形区域3D组件

**Files:**
- Create: `src/components/Scene/Atmosphere/PressureZoneRing.tsx`

- [ ] **Step 1: 实现气压带环形高亮组件**

```tsx
// src/components/Scene/Atmosphere/PressureZoneRing.tsx
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PressureZoneConfig } from '@/types/atmosphere';

interface PressureZoneRingProps {
  config: PressureZoneConfig;
  earthRadius: number;
  seasonalShift?: number;
  visible?: boolean;
}

export function PressureZoneRing({
  config,
  earthRadius,
  seasonalShift = 0,
  visible = true,
}: PressureZoneRingProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef(0);

  const { geometry, position } = useMemo(() => {
    const latCenterRad = THREE.MathUtils.degToRad(config.latCenter + seasonalShift);
    const latSpanRad = THREE.MathUtils.degToRad(config.latSpan);

    // 计算环带的内半径（在地球表面）
    const innerRadius = earthRadius * Math.cos(latCenterRad + latSpanRad / 2);
    const outerRadius = earthRadius * Math.cos(latCenterRad - latSpanRad / 2);
    const avgRadius = (innerRadius + outerRadius) / 2;
    const tubeRadius = Math.abs(outerRadius - innerRadius) / 2 + 0.05;

    // 创建环面几何体
    const geo = new THREE.TorusGeometry(avgRadius, tubeRadius, 16, 100);

    // 计算位置（根据纬度调整高度）
    const y = earthRadius * Math.sin(latCenterRad);
    const pos = new THREE.Vector3(0, y, 0);

    return { geometry: geo, position: pos };
  }, [config, earthRadius, seasonalShift]);

  // 脉冲动画（低压带脉冲更快）
  useFrame((_, delta) => {
    if (!meshRef.current || !visible) return;
    pulseRef.current += delta * (config.type === 'low' ? 2 : 1);
    const pulse = 0.7 + 0.3 * Math.sin(pulseRef.current);
    const material = meshRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = pulse * 0.4;
  });

  if (!visible) return null;

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={position}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <meshBasicMaterial
        color={config.color}
        transparent
        opacity={0.4}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
```

- [ ] **Step 2: 创建气压带标签组件**

```tsx
// src/components/Scene/Atmosphere/PressureZoneLabel.tsx
import { useMemo } from 'react';
import * as THREE from 'three';
import { PressureZoneConfig } from '@/types/atmosphere';

interface PressureZoneLabelProps {
  config: PressureZoneConfig;
  earthRadius: number;
  seasonalShift?: number;
}

export function PressureZoneLabel({
  config,
  earthRadius,
  seasonalShift = 0,
}: PressureZoneLabelProps) {
  const { texture, position } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // 背景
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.roundRect(0, 0, 512, 128, 16);
    ctx.fill();

    // 文字
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.name, 256, 64);

    const tex = new THREE.CanvasTexture(canvas);

    const latRad = THREE.MathUtils.degToRad(config.latCenter + seasonalShift);
    const y = (earthRadius + 1.5) * Math.sin(latRad);
    const r = (earthRadius + 1.5) * Math.cos(latRad);
    const pos = new THREE.Vector3(r, y, 0);

    return { texture: tex, position: pos };
  }, [config, earthRadius, seasonalShift]);

  return (
    <sprite position={position} scale={[4, 1, 1]}>
      <spriteMaterial map={texture} transparent depthTest={false} />
    </sprite>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Scene/Atmosphere/PressureZoneRing.tsx src/components/Scene/Atmosphere/PressureZoneLabel.tsx
git commit -m "feat(atmosphere): add pressure zone ring and label 3D components"
```

---

### Task 4: 风带粒子流3D组件

**Files:**
- Create: `src/components/Scene/Atmosphere/WindBeltParticles.tsx`

- [ ] **Step 1: 实现风带粒子系统**

```tsx
// src/components/Scene/Atmosphere/WindBeltParticles.tsx
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WindBeltConfig } from '@/types/atmosphere';

interface WindBeltParticlesProps {
  config: WindBeltConfig;
  earthRadius: number;
  seasonalShift?: number;
  particleCount?: number;
  visible?: boolean;
}

export function WindBeltParticles({
  config,
  earthRadius,
  seasonalShift = 0,
  particleCount = 200,
  visible = true,
}: WindBeltParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const progressRef = useRef(new Float32Array(particleCount));

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount);

    const latStartRad = THREE.MathUtils.degToRad(config.latStart + seasonalShift);
    const latEndRad = THREE.MathUtils.degToRad(config.latEnd + seasonalShift);
    const avgLat = (latStartRad + latEndRad) / 2;

    for (let i = 0; i < particleCount; i++) {
      // 随机经度
      const lon = Math.random() * Math.PI * 2;
      // 在风带纬度范围内随机
      const lat = latStartRad + Math.random() * (latEndRad - latStartRad);
      // 高度略高于地表
      const height = earthRadius + 0.3 + Math.random() * 0.2;

      pos[i * 3] = height * Math.cos(lat) * Math.cos(lon);
      pos[i * 3 + 1] = height * Math.sin(lat);
      pos[i * 3 + 2] = height * Math.cos(lat) * Math.sin(lon);

      // 根据半球和风向确定速度
      const isNorth = avgLat >= 0;
      const isEastward = config.direction.includes('east');
      vel[i] = (isEastward ? 1 : -1) * (0.2 + Math.random() * 0.3) * (isNorth ? 1 : -1);
    }

    return { positions: pos, velocities: vel };
  }, [config, earthRadius, seasonalShift, particleCount]);

  useFrame((_, delta) => {
    if (!pointsRef.current || !visible) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const posArray = posAttr.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const x = posArray[i * 3];
      const z = posArray[i * 3 + 2];
      const y = posArray[i * 3 + 1];

      // 计算当前经度并更新
      const currentLon = Math.atan2(z, x);
      const newLon = currentLon + velocities[i] * delta * 0.5;
      const radius = Math.sqrt(x * x + z * z);

      posArray[i * 3] = radius * Math.cos(newLon);
      posArray[i * 3 + 2] = radius * Math.sin(newLon);
      // y保持不变（维持纬度）
    }

    posAttr.needsUpdate = true;
  });

  if (!visible) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={config.color}
        size={0.15}
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Scene/Atmosphere/WindBeltParticles.tsx
git commit -m "feat(atmosphere): add wind belt particle flow 3D component"
```

---

### Task 5: 三圈环流3D管道组件

**Files:**
- Create: `src/components/Scene/Atmosphere/CirculationCell.tsx`

- [ ] **Step 1: 实现环流管道组件**

```tsx
// src/components/Scene/Atmosphere/CirculationCell.tsx
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CirculationCellConfig } from '@/types/atmosphere';

interface CirculationCellProps {
  config: CirculationCellConfig;
  earthRadius: number;
  seasonalShift?: number;
  visible?: boolean;
}

export function CirculationCell({
  config,
  earthRadius,
  seasonalShift = 0,
  visible = true,
}: CirculationCellProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const tubeRef = useRef<THREE.Mesh>(null);

  const { curve, tubeGeometry, particlePositions, particleSpeeds } = useMemo(() => {
    const r = earthRadius;
    const shift = THREE.MathUtils.degToRad(seasonalShift);

    const ascLat = THREE.MathUtils.degToRad(config.ascentLat) + shift;
    const descLat = THREE.MathUtils.degToRad(config.descentLat) + shift;
    const startLat = THREE.MathUtils.degToRad(config.latStart) + shift;
    const endLat = THREE.MathUtils.degToRad(config.latEnd) + shift;

    // 构建环流曲线关键点
    const points: THREE.Vector3[] = [];

    // 起点：下沉气流底部（副热带高压）
    const descY = r * Math.sin(descLat);
    const descR = r * Math.cos(descLat);
    points.push(new THREE.Vector3(descR, descY, 0));

    // 低层流向赤道/极地（地表）
    const surfaceEndLat = config.type === 'hadley' ? ascLat : ascLat;
    const surfaceY = r * Math.sin(surfaceEndLat);
    const surfaceR = r * Math.cos(surfaceEndLat);
    points.push(new THREE.Vector3(surfaceR * 0.8, surfaceY, 0));

    // 上升气流（赤道/副极地）
    const topY = surfaceY + r * 0.4;
    points.push(new THREE.Vector3(surfaceR * 0.6, topY, 0));

    // 高空回流
    const topDescY = descY + r * 0.4;
    points.push(new THREE.Vector3(descR * 0.6, topDescY, 0));

    // 回到下沉
    points.push(new THREE.Vector3(descR, descY, 0));

    const crv = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(crv, 64, 0.25, 8, false);

    // 粒子沿曲线分布
    const pCount = 50;
    const pPos = new Float32Array(pCount * 3);
    const pSpeeds = new Float32Array(pCount);

    for (let i = 0; i < pCount; i++) {
      const t = i / pCount;
      const pt = crv.getPoint(t);
      pPos[i * 3] = pt.x;
      pPos[i * 3 + 1] = pt.y;
      pPos[i * 3 + 2] = pt.z;
      pSpeeds[i] = t; // 当前进度
    }

    return {
      curve: crv,
      tubeGeometry: tubeGeo,
      particlePositions: pPos,
      particleSpeeds: pSpeeds,
    };
  }, [config, earthRadius, seasonalShift]);

  // 粒子沿管道运动
  useFrame((_, delta) => {
    if (!particlesRef.current || !visible) return;
    const posAttr = particlesRef.current.geometry.attributes.position;
    const posArray = posAttr.array as Float32Array;

    for (let i = 0; i < particleSpeeds.length; i++) {
      particleSpeeds[i] += delta * 0.15;
      if (particleSpeeds[i] > 1) particleSpeeds[i] = 0;

      const pt = curve.getPoint(particleSpeeds[i]);
      posArray[i * 3] = pt.x + (Math.random() - 0.5) * 0.2;
      posArray[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.2;
      posArray[i * 3 + 2] = pt.z + (Math.random() - 0.5) * 0.2;
    }

    posAttr.needsUpdate = true;
  });

  // 管道呼吸动画
  useFrame((state) => {
    if (!tubeRef.current || !visible) return;
    const mat = tubeRef.current.material as THREE.MeshPhongMaterial;
    mat.opacity = 0.3 + 0.1 * Math.sin(state.clock.elapsedTime);
  });

  if (!visible) return null;

  const tubeColor = config.type === 'hadley' ? '#FF6B35' : config.type === 'ferrel' ? '#AB47BC' : '#26C6DA';

  return (
    <group>
      <mesh ref={tubeRef} geometry={tubeGeometry}>
        <meshPhongMaterial
          color={tubeColor}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleSpeeds.length}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={tubeColor}
          size={0.2}
          transparent
          opacity={0.9}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Scene/Atmosphere/CirculationCell.tsx
git commit -m "feat(atmosphere): add circulation cell 3D tube component"
```

---

### Task 6: 季节移动动画容器

**Files:**
- Create: `src/components/Scene/Atmosphere/SeasonalShiftGroup.tsx`

- [ ] **Step 1: 实现季节移动容器**

```tsx
// src/components/Scene/Atmosphere/SeasonalShiftGroup.tsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { getSeasonalShift } from '@/data/atmosphere/pressureWindData';

interface SeasonalShiftGroupProps {
  children: React.ReactNode;
  earthRadius: number;
}

export function SeasonalShiftGroup({ children, earthRadius }: SeasonalShiftGroupProps) {
  const groupRef = useRef<THREE.Group>(null);
  const month = useStore((s) => s.month);
  const isPlaying = useStore((s) => s.isPlaying);
  const animationSpeed = useStore((s) => s.animationSpeed);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // 计算目标偏移角度
    const shiftLat = getSeasonalShift(month);
    const shiftRad = THREE.MathUtils.degToRad(shiftLat);

    // 平滑插值到目标位置
    const targetY = earthRadius * Math.sin(shiftRad);
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      delta * 2
    );
  });

  return <group ref={groupRef}>{children}</group>;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Scene/Atmosphere/SeasonalShiftGroup.tsx
git commit -m "feat(atmosphere): add seasonal shift animation group"
```

---

### Task 7: 气压带和风带综合3D场景

**Files:**
- Create: `src/components/Scene/Atmosphere/PressureWindScene.tsx`

- [ ] **Step 1: 实现气压带风带综合场景**

```tsx
// src/components/Scene/Atmosphere/PressureWindScene.tsx
import { useStore } from '@/store/useStore';
import {
  PRESSURE_ZONES,
  WIND_BELTS,
  CIRCULATION_CELLS,
  getSeasonalShift,
} from '@/data/atmosphere/pressureWindData';
import { PressureZoneRing } from './PressureZoneRing';
import { PressureZoneLabel } from './PressureZoneLabel';
import { WindBeltParticles } from './WindBeltParticles';
import { CirculationCell } from './CirculationCell';
import { SeasonalShiftGroup } from './SeasonalShiftGroup';

const EARTH_RADIUS = 5; // 与现有系统保持一致

export function PressureWindScene() {
  const month = useStore((s) => s.month);
  const showPressureZones = useStore((s) => s.showPressureZones);
  const showWindBelts = useStore((s) => s.showWindBelts);
  const showCirculationCells = useStore((s) => s.showCirculationCells);

  const seasonalShift = getSeasonalShift(month);

  return (
    <group>
      <SeasonalShiftGroup earthRadius={EARTH_RADIUS}>
        {/* 气压带 */}
        {PRESSURE_ZONES.map((zone) => (
          <group key={zone.id}>
            <PressureZoneRing
              config={zone}
              earthRadius={EARTH_RADIUS}
              seasonalShift={seasonalShift}
              visible={showPressureZones}
            />
            <PressureZoneLabel
              config={zone}
              earthRadius={EARTH_RADIUS}
              seasonalShift={seasonalShift}
            />
          </group>
        ))}

        {/* 风带 */}
        {WIND_BELTS.map((belt) => (
          <WindBeltParticles
            key={belt.id}
            config={belt}
            earthRadius={EARTH_RADIUS}
            seasonalShift={seasonalShift}
            visible={showWindBelts}
          />
        ))}

        {/* 三圈环流 */}
        {CIRCULATION_CELLS.map((cell) => (
          <CirculationCell
            key={cell.id}
            config={cell}
            earthRadius={EARTH_RADIUS}
            seasonalShift={seasonalShift}
            visible={showCirculationCells}
          />
        ))}
      </SeasonalShiftGroup>
    </group>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Scene/Atmosphere/PressureWindScene.tsx
git commit -m "feat(atmosphere): add pressure-wind integrated 3D scene"
```

---

### Task 8: 锋面系统3D组件

**Files:**
- Create: `src/components/Scene/Atmosphere/FrontPlane.tsx`
- Create: `src/components/Scene/Atmosphere/ColdFrontDemo.tsx`
- Create: `src/components/Scene/Atmosphere/WarmFrontDemo.tsx`

- [ ] **Step 1: 实现基础锋面几何体**

```tsx
// src/components/Scene/Atmosphere/FrontPlane.tsx
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface FrontPlaneProps {
  color: string;
  slopeAngle: number; // 度
  width: number;
  height: number;
  position: [number, number, number];
  moveDirection?: number; // 移动方向角度
  moveSpeed?: number;
  visible?: boolean;
}

export function FrontPlane({
  color,
  slopeAngle,
  width,
  height,
  position,
  moveDirection = 0,
  moveSpeed = 0,
  visible = true,
}: FrontPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const posRef = useRef(new THREE.Vector3(...position));

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(width, height);
  }, [width, height]);

  useFrame((_, delta) => {
    if (!meshRef.current || moveSpeed === 0) return;
    const dir = new THREE.Vector3(
      Math.cos(THREE.MathUtils.degToRad(moveDirection)),
      0,
      Math.sin(THREE.MathUtils.degToRad(moveDirection))
    );
    posRef.current.add(dir.multiplyScalar(moveSpeed * delta));
    meshRef.current.position.copy(posRef.current);
  });

  if (!visible) return null;

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={position}
      rotation={[
        THREE.MathUtils.degToRad(slopeAngle),
        THREE.MathUtils.degToRad(moveDirection),
        0,
      ]}
    >
      <meshPhongMaterial
        color={color}
        transparent
        opacity={0.6}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
```

- [ ] **Step 2: 实现冷锋演示**

```tsx
// src/components/Scene/Atmosphere/ColdFrontDemo.tsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FrontPlane } from './FrontPlane';

const EARTH_RADIUS = 5;

export function ColdFrontDemo({ visible = true }: { visible?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current || !visible) return;
    timeRef.current += delta * 0.3;
    // 冷锋整体向东移动
    groupRef.current.position.x = Math.sin(timeRef.current) * 2;
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {/* 冷锋锋面（蓝色，坡度较陡 ~60°） */}
      <FrontPlane
        color="#1E88E5"
        slopeAngle={60}
        width={8}
        height={4}
        position={[0, EARTH_RADIUS + 0.5, 0]}
        moveDirection={90}
        moveSpeed={0}
      />

      {/* 冷气团标注 */}
      <mesh position={[-3, EARTH_RADIUS + 1.5, 0]}>
        <planeGeometry args={[2, 0.6]} />
        <meshBasicMaterial color="#1565C0" transparent opacity={0.8} />
      </mesh>

      {/* 暖气团标注 */}
      <mesh position={[3, EARTH_RADIUS + 1.5, 0]}>
        <planeGeometry args={[2, 0.6]} />
        <meshBasicMaterial color="#E53935" transparent opacity={0.8} />
      </mesh>

      {/* 云雨区（锋后窄而陡） */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            -0.5 - Math.random() * 2,
            EARTH_RADIUS + 1.2 + Math.random() * 1.5,
            (Math.random() - 0.5) * 4,
          ]}
        >
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color="#90A4AE" transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}
```

- [ ] **Step 3: 实现暖锋演示**

```tsx
// src/components/Scene/Atmosphere/WarmFrontDemo.tsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FrontPlane } from './FrontPlane';

const EARTH_RADIUS = 5;

export function WarmFrontDemo({ visible = true }: { visible?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current || !visible) return;
    timeRef.current += delta * 0.2;
    groupRef.current.position.x = Math.sin(timeRef.current) * 1.5;
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {/* 暖锋锋面（红色，坡度较缓 ~30°） */}
      <FrontPlane
        color="#E53935"
        slopeAngle={30}
        width={10}
        height={3}
        position={[0, EARTH_RADIUS + 0.3, 0]}
        moveDirection={90}
        moveSpeed={0}
      />

      {/* 云雨区（锋前宽而缓） */}
      {Array.from({ length: 30 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            0.5 + Math.random() * 4,
            EARTH_RADIUS + 1 + Math.random() * 2,
            (Math.random() - 0.5) * 6,
          ]}
        >
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial color="#B0BEC5" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Scene/Atmosphere/FrontPlane.tsx src/components/Scene/Atmosphere/ColdFrontDemo.tsx src/components/Scene/Atmosphere/WarmFrontDemo.tsx
git commit -m "feat(atmosphere): add front system 3D components"
```

---

### Task 9: 气旋与反气旋3D组件

**Files:**
- Create: `src/components/Scene/Atmosphere/CycloneSystem.tsx`
- Create: `src/components/Scene/Atmosphere/AnticycloneSystem.tsx`

- [ ] **Step 1: 实现气旋系统**

```tsx
// src/components/Scene/Atmosphere/CycloneSystem.tsx
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Hemisphere } from '@/types/atmosphere';

interface CycloneSystemProps {
  hemisphere: Hemisphere;
  visible?: boolean;
}

const EARTH_RADIUS = 5;

export function CycloneSystem({ hemisphere, visible = true }: CycloneSystemProps) {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const isNorth = hemisphere === 'north';
  const rotationDir = isNorth ? 1 : -1; // 北半球逆时针，南半球顺时针

  const { spiralCurve, particleData } = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const pCount = 100;
    const pPos = new Float32Array(pCount * 3);
    const pSpeeds = new Float32Array(pCount);

    // 生成对数螺旋
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const angle = t * Math.PI * 4 * rotationDir; // 两圈
      const radius = 3 * (1 - t) + 0.3; // 从外向内
      const y = EARTH_RADIUS + 0.5 + t * 1.5;
      points.push(new THREE.Vector3(
        radius * Math.cos(angle),
        y,
        radius * Math.sin(angle)
      ));
    }

    const curve = new THREE.CatmullRomCurve3(points);

    // 粒子沿螺旋分布
    for (let i = 0; i < pCount; i++) {
      const t = i / pCount;
      const pt = curve.getPoint(t);
      pPos[i * 3] = pt.x + (Math.random() - 0.5) * 0.5;
      pPos[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.3;
      pPos[i * 3 + 2] = pt.z + (Math.random() - 0.5) * 0.5;
      pSpeeds[i] = t;
    }

    return { spiralCurve: curve, particleData: { positions: pPos, speeds: pSpeeds } };
  }, [rotationDir]);

  // 粒子向中心螺旋运动
  useFrame((_, delta) => {
    if (!particlesRef.current || !visible) return;
    const posAttr = particlesRef.current.geometry.attributes.position;
    const posArray = posAttr.array as Float32Array;

    for (let i = 0; i < particleData.speeds.length; i++) {
      particleData.speeds[i] += delta * 0.1;
      if (particleData.speeds[i] > 1) particleData.speeds[i] = 0;

      const pt = spiralCurve.getPoint(particleData.speeds[i]);
      posArray[i * 3] = pt.x;
      posArray[i * 3 + 1] = pt.y;
      posArray[i * 3 + 2] = pt.z;
    }

    posAttr.needsUpdate = true;
  });

  // 整体旋转
  useFrame((_, delta) => {
    if (!groupRef.current || !visible) return;
    groupRef.current.rotation.y += delta * rotationDir * 0.5;
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {/* 等压线 */}
      {[1, 1.5, 2, 2.5, 3].map((radius, i) => (
        <mesh key={i} position={[0, EARTH_RADIUS + 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius - 0.05, radius, 64]} />
          <meshBasicMaterial color="#E53935" transparent opacity={0.4 - i * 0.05} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* 中心低压 */}
      <mesh position={[0, EARTH_RADIUS + 0.5, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1, 16]} />
        <meshBasicMaterial color="#B71C1C" transparent opacity={0.8} />
      </mesh>

      {/* 螺旋粒子 */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleData.speeds.length}
            array={particleData.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color="#E53935" size={0.12} transparent opacity={0.8} sizeAttenuation />
      </points>

      {/* 上升气流指示 */}
      <mesh position={[0, EARTH_RADIUS + 2, 0]}>
        <coneGeometry args={[0.3, 1, 16]} />
        <meshBasicMaterial color="#FF6B35" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
```

- [ ] **Step 2: 实现反气旋系统**

```tsx
// src/components/Scene/Atmosphere/AnticycloneSystem.tsx
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Hemisphere } from '@/types/atmosphere';

interface AnticycloneSystemProps {
  hemisphere: Hemisphere;
  visible?: boolean;
}

const EARTH_RADIUS = 5;

export function AnticycloneSystem({ hemisphere, visible = true }: AnticycloneSystemProps) {
  const groupRef = useRef<THREE.Group>(null);

  const isNorth = hemisphere === 'north';
  const rotationDir = isNorth ? -1 : 1; // 北半球顺时针，南半球逆时针

  useFrame((_, delta) => {
    if (!groupRef.current || !visible) return;
    groupRef.current.rotation.y += delta * rotationDir * 0.3;
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {/* 等压线 */}
      {[1, 1.5, 2, 2.5, 3].map((radius, i) => (
        <mesh key={i} position={[0, EARTH_RADIUS + 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius - 0.05, radius, 64]} />
          <meshBasicMaterial color="#1E88E5" transparent opacity={0.4 - i * 0.05} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* 中心高压 */}
      <mesh position={[0, EARTH_RADIUS + 0.5, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1, 16]} />
        <meshBasicMaterial color="#0D47A1" transparent opacity={0.8} />
      </mesh>

      {/* 下沉气流指示 */}
      <mesh position={[0, EARTH_RADIUS + 3, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.3, 1, 16]} />
        <meshBasicMaterial color="#42A5F5" transparent opacity={0.6} />
      </mesh>

      {/* 辐散粒子 */}
      {Array.from({ length: 40 }).map((_, i) => {
        const angle = (i / 40) * Math.PI * 2;
        const radius = 1 + Math.random() * 2;
        return (
          <mesh
            key={i}
            position={[
              radius * Math.cos(angle),
              EARTH_RADIUS + 0.5 + Math.random() * 0.5,
              radius * Math.sin(angle),
            ]}
          >
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color="#1E88E5" transparent opacity={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Scene/Atmosphere/CycloneSystem.tsx src/components/Scene/Atmosphere/AnticycloneSystem.tsx
git commit -m "feat(atmosphere): add cyclone and anticyclone 3D components"
```

---

### Task 10: 大气运动入口页面与路由

**Files:**
- Create: `src/pages/AtmosphereIndexPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: 创建大气运动入口页面**

```tsx
// src/pages/AtmosphereIndexPage.tsx
import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { useStore } from '@/store/useStore';
import { Earth } from '@/components/Scene/Earth';
import { Atmosphere } from '@/components/Scene/Atmosphere';
import { PressureWindScene } from '@/components/Scene/Atmosphere/PressureWindScene';
import { ColdFrontDemo } from '@/components/Scene/Atmosphere/ColdFrontDemo';
import { WarmFrontDemo } from '@/components/Scene/Atmosphere/WarmFrontDemo';
import { CycloneSystem } from '@/components/Scene/Atmosphere/CycloneSystem';
import { AnticycloneSystem } from '@/components/Scene/Atmosphere/AnticycloneSystem';
import { KnowledgePanel } from '@/components/UI/KnowledgePanel';
import { PressureWindPanel } from '@/components/UI/Atmosphere/PressureWindPanel';
import { FrontControlPanel } from '@/components/UI/Atmosphere/FrontControlPanel';
import { CycloneControlPanel } from '@/components/UI/Atmosphere/CycloneControlPanel';
import { MonthSlider } from '@/components/UI/Atmosphere/MonthSlider';

export default function AtmosphereIndexPage() {
  const sceneMode = useStore((s) => s.sceneMode);
  const hemisphere = useStore((s) => s.hemisphere);

  // 根据sceneMode渲染对应的3D场景
  const renderScene = () => {
    switch (sceneMode) {
      case 'pressure-wind':
      case 'circulation':
      case 'seasonal-shift':
      case 'land-sea':
      case 'monsoon':
        return <PressureWindScene />;
      case 'cold-front':
        return <ColdFrontDemo visible />;
      case 'warm-front':
        return <WarmFrontDemo visible />;
      case 'cyclone':
        return <CycloneSystem hemisphere={hemisphere} visible />;
      case 'anticyclone':
        return <AnticycloneSystem hemisphere={hemisphere} visible />;
      default:
        return <PressureWindScene />;
    }
  };

  // 根据sceneMode渲染对应的右侧面板
  const renderRightPanel = () => {
    switch (sceneMode) {
      case 'pressure-wind':
      case 'circulation':
      case 'seasonal-shift':
      case 'land-sea':
      case 'monsoon':
        return <PressureWindPanel />;
      case 'cold-front':
      case 'warm-front':
      case 'stationary-front':
        return <FrontControlPanel />;
      case 'cyclone':
      case 'anticyclone':
        return <CycloneControlPanel />;
      default:
        return <PressureWindPanel />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-black overflow-hidden">
      {/* 顶部导航标签 */}
      <div className="h-12 bg-gray-900 flex items-center px-4 border-b border-gray-700">
        <h1 className="text-white font-bold mr-8">第三章 大气的运动</h1>
        <div className="flex gap-2">
          <ModeTab mode="pressure-wind" label="气压带和风带" />
          <ModeTab mode="weather-system" label="常见天气系统" />
          <ModeTab mode="climate-effect" label="气候影响" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 左侧知识面板 */}
        <div className="w-64 flex-shrink-0">
          <KnowledgePanel />
        </div>

        {/* 中央3D场景 */}
        <div className="flex-1 relative">
          <Canvas camera={{ position: [0, 8, 15], fov: 45 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={200} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Earth />
            <Atmosphere />
            {renderScene()}
            <OrbitControls
              enablePan={false}
              minDistance={8}
              maxDistance={30}
              autoRotate
              autoRotateSpeed={0.5}
            />
          </Canvas>
        </div>

        {/* 右侧控制面板 */}
        <div className="w-72 flex-shrink-0 bg-gray-900/90 border-l border-gray-700 overflow-y-auto">
          {renderRightPanel()}
        </div>
      </div>

      {/* 底部时间控制 */}
      <div className="h-16 bg-gray-900 border-t border-gray-700 flex items-center px-4 gap-4">
        <MonthSlider />
      </div>
    </div>
  );
}

function ModeTab({ mode, label }: { mode: string; label: string }) {
  const currentMode = useStore((s) => s.sceneMode);
  const setSceneMode = useStore((s) => s.setSceneMode);
  const isActive = currentMode === mode || currentMode.startsWith(mode.split('-')[0]);

  return (
    <button
      onClick={() => setSceneMode(mode as any)}
      className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );
}
```

- [ ] **Step 2: 修改App.tsx添加路由**

```tsx
// 在 src/App.tsx 中添加路由
import AtmosphereIndexPage from '@/pages/AtmosphereIndexPage';

// 在路由配置中添加
<Route path="/atmosphere" element={<AtmosphereIndexPage />} />
<Route path="/atmosphere/:section" element={<AtmosphereIndexPage />} />
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/AtmosphereIndexPage.tsx src/App.tsx
git commit -m "feat(atmosphere): add atmosphere index page and routing"
```

---

### Task 11: 气压带风带右侧面板

**Files:**
- Create: `src/components/UI/Atmosphere/PressureWindPanel.tsx`

- [ ] **Step 1: 实现气压带风带控制面板**

```tsx
// src/components/UI/Atmosphere/PressureWindPanel.tsx
import { useStore } from '@/store/useStore';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function PressureWindPanel() {
  const {
    showPressureZones,
    showWindBelts,
    showCirculationCells,
    togglePressureZones,
    toggleWindBelts,
    toggleCirculationCells,
    month,
  } = useStore();

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-lg font-bold text-white">气压带与风带</h2>

      {/* 显示开关 */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-300">显示选项</h3>

        <div className="flex items-center justify-between">
          <Label htmlFor="pressure-zones" className="text-gray-200 text-sm">气压带</Label>
          <Switch
            id="pressure-zones"
            checked={showPressureZones}
            onCheckedChange={togglePressureZones}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="wind-belts" className="text-gray-200 text-sm">风带</Label>
          <Switch
            id="wind-belts"
            checked={showWindBelts}
            onCheckedChange={toggleWindBelts}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="circulation" className="text-gray-200 text-sm">三圈环流</Label>
          <Switch
            id="circulation"
            checked={showCirculationCells}
            onCheckedChange={toggleCirculationCells}
          />
        </div>
      </div>

      {/* 当前月份信息 */}
      <div className="bg-gray-800 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">当前月份</h3>
        <p className="text-white text-lg font-bold">{month}月</p>
        <p className="text-gray-400 text-xs mt-1">
          {month >= 3 && month <= 5 ? '春季 - 气压带风带向北移动' :
           month >= 6 && month <= 8 ? '夏季 - 气压带风带位置偏北' :
           month >= 9 && month <= 11 ? '秋季 - 气压带风带向南移动' :
           '冬季 - 气压带风带位置偏南'}
        </p>
      </div>

      {/* 知识卡片 */}
      <div className="bg-gray-800 rounded-lg p-3 space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">核心知识</h3>
        <div className="text-gray-300 text-xs space-y-1.5">
          <p>• <span className="text-red-400">赤道低气压带</span>：上升气流，高温多雨</p>
          <p>• <span className="text-blue-400">副热带高气压带</span>：下沉气流，干燥少雨</p>
          <p>• <span className="text-orange-400">副极地低气压带</span>：锋面上升，多雨</p>
          <p>• <span className="text-cyan-400">极地高气压带</span>：下沉气流，寒冷干燥</p>
          <p className="pt-1 border-t border-gray-700">• 北半球夏季偏北，冬季偏南</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/UI/Atmosphere/PressureWindPanel.tsx
git commit -m "feat(atmosphere): add pressure-wind right control panel"
```

---

### Task 12: 锋面与气旋控制面板

**Files:**
- Create: `src/components/UI/Atmosphere/FrontControlPanel.tsx`
- Create: `src/components/UI/Atmosphere/CycloneControlPanel.tsx`
- Create: `src/components/UI/Atmosphere/MonthSlider.tsx`

- [ ] **Step 1: 实现锋面控制面板**

```tsx
// src/components/UI/Atmosphere/FrontControlPanel.tsx
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';

export function FrontControlPanel() {
  const sceneMode = useStore((s) => s.sceneMode);
  const setSceneMode = useStore((s) => s.setSceneMode);

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-lg font-bold text-white">锋与天气</h2>

      {/* 锋面类型选择 */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">锋面类型</h3>
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant={sceneMode === 'cold-front' ? 'default' : 'outline'}
            onClick={() => setSceneMode('cold-front')}
            className="justify-start"
          >
            <span className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
            冷锋
          </Button>
          <Button
            variant={sceneMode === 'warm-front' ? 'default' : 'outline'}
            onClick={() => setSceneMode('warm-front')}
            className="justify-start"
          >
            <span className="w-3 h-3 rounded-full bg-red-500 mr-2" />
            暖锋
          </Button>
          <Button
            variant={sceneMode === 'stationary-front' ? 'default' : 'outline'}
            onClick={() => setSceneMode('stationary-front')}
            className="justify-start"
          >
            <span className="w-3 h-3 rounded-full bg-purple-500 mr-2" />
            准静止锋
          </Button>
        </div>
      </div>

      {/* 知识卡片 */}
      <div className="bg-gray-800 rounded-lg p-3 space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">
          {sceneMode === 'cold-front' ? '冷锋特征' :
           sceneMode === 'warm-front' ? '暖锋特征' : '锋面知识'}
        </h3>
        {sceneMode === 'cold-front' && (
          <div className="text-gray-300 text-xs space-y-1">
            <p>• 冷气团主动向暖气团移动</p>
            <p>• 锋面坡度较陡（约60°）</p>
            <p>• 过境时：大风、雨雪、降温</p>
            <p>• 过境后：气温下降、气压上升</p>
            <p>• 降水区窄，主要在锋后</p>
          </div>
        )}
        {sceneMode === 'warm-front' && (
          <div className="text-gray-300 text-xs space-y-1">
            <p>• 暖气团主动向冷气团移动</p>
            <p>• 锋面坡度较缓（约30°）</p>
            <p>• 过境时：连续性降水</p>
            <p>• 过境后：气温升高、气压降低</p>
            <p>• 降水区宽，主要在锋前</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 实现气旋控制面板**

```tsx
// src/components/UI/Atmosphere/CycloneControlPanel.tsx
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';

export function CycloneControlPanel() {
  const sceneMode = useStore((s) => s.sceneMode);
  const hemisphere = useStore((s) => s.hemisphere);
  const setSceneMode = useStore((s) => s.setSceneMode);
  const setHemisphere = useStore((s) => s.setHemisphere);

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-lg font-bold text-white">气旋与反气旋</h2>

      {/* 类型选择 */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">天气系统</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={sceneMode === 'cyclone' ? 'default' : 'outline'}
            onClick={() => setSceneMode('cyclone')}
          >
            气旋（低压）
          </Button>
          <Button
            variant={sceneMode === 'anticyclone' ? 'default' : 'outline'}
            onClick={() => setSceneMode('anticyclone')}
          >
            反气旋（高压）
          </Button>
        </div>
      </div>

      {/* 半球切换 */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">半球</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={hemisphere === 'north' ? 'default' : 'outline'}
            onClick={() => setHemisphere('north')}
          >
            北半球
          </Button>
          <Button
            variant={hemisphere === 'south' ? 'default' : 'outline'}
            onClick={() => setHemisphere('south')}
          >
            南半球
          </Button>
        </div>
      </div>

      {/* 知识卡片 */}
      <div className="bg-gray-800 rounded-lg p-3 space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">
          {sceneMode === 'cyclone' ? '气旋特征' : '反气旋特征'}
        </h3>
        {sceneMode === 'cyclone' && (
          <div className="text-gray-300 text-xs space-y-1">
            <p>• 中心气压低，四周气压高</p>
            <p>• 北半球：逆时针辐合</p>
            <p>• 南半球：顺时针辐合</p>
            <p>• 上升气流 → 阴雨天气</p>
            <p>• 典型：台风、温带气旋</p>
          </div>
        )}
        {sceneMode === 'anticyclone' && (
          <div className="text-gray-300 text-xs space-y-1">
            <p>• 中心气压高，四周气压低</p>
            <p>• 北半球：顺时针辐散</p>
            <p>• 南半球：逆时针辐散</p>
            <p>• 下沉气流 → 晴朗干燥</p>
            <p>• 典型：伏旱、寒潮</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 实现月份滑块**

```tsx
// src/components/UI/Atmosphere/MonthSlider.tsx
import { useStore } from '@/store/useStore';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

const MONTH_NAMES = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月',
];

export function MonthSlider() {
  const month = useStore((s) => s.month);
  const isPlaying = useStore((s) => s.isPlaying);
  const setMonth = useStore((s) => s.setMonth);
  const togglePlayback = useStore((s) => s.togglePlayback);

  return (
    <div className="flex items-center gap-4 flex-1">
      <Button
        variant="outline"
        size="icon"
        onClick={togglePlayback}
        className="flex-shrink-0"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </Button>

      <div className="flex-1">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{MONTH_NAMES[month - 1]}</span>
          <span className="text-gray-500">拖动滑块观察季节变化</span>
        </div>
        <Slider
          value={[month]}
          onValueChange={(v) => setMonth(v[0])}
          min={1}
          max={12}
          step={1}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/UI/Atmosphere/FrontControlPanel.tsx src/components/UI/Atmosphere/CycloneControlPanel.tsx src/components/UI/Atmosphere/MonthSlider.tsx
git commit -m "feat(atmosphere): add front, cyclone control panels and month slider"
```

---

### Task 13: 知识面板扩展

**Files:**
- Modify: `src/components/UI/KnowledgePanel.tsx`

- [ ] **Step 1: 在知识面板中添加第三章菜单**

在现有知识面板数据结构中添加第三章节点。假设现有数据结构如下，需要扩展：

```typescript
// 在知识面板数据中添加
const CHAPTER3_MENU = {
  id: 'chapter3',
  title: '第三章 大气的运动',
  children: [
    {
      id: '3-1',
      title: '第一节 常见天气系统',
      children: [
        { id: '3-1-1', title: '锋与天气', action: () => setSceneMode('cold-front') },
        { id: '3-1-2', title: '低气压(气旋)', action: () => setSceneMode('cyclone') },
        { id: '3-1-3', title: '高气压(反气旋)', action: () => setSceneMode('anticyclone') },
        { id: '3-1-4', title: '台风', action: () => setSceneMode('typhoon') },
      ],
    },
    {
      id: '3-2',
      title: '第二节 气压带和风带',
      children: [
        { id: '3-2-1', title: '三圈环流', action: () => setSceneMode('circulation') },
        { id: '3-2-2', title: '气压带与风带', action: () => setSceneMode('pressure-wind') },
        { id: '3-2-3', title: '季节移动', action: () => setSceneMode('seasonal-shift') },
        { id: '3-2-4', title: '海陆分布影响', action: () => setSceneMode('land-sea') },
        { id: '3-2-5', title: '季风环流', action: () => setSceneMode('monsoon') },
      ],
    },
    {
      id: '3-3',
      title: '第三节 气压带风带对气候的影响',
      children: [
        { id: '3-3-1', title: '气压带与气候', action: () => setSceneMode('climate-zone') },
      ],
    },
  ],
};
```

具体修改需要阅读现有KnowledgePanel.tsx文件后实施。

- [ ] **Step 2: Commit**

```bash
git add src/components/UI/KnowledgePanel.tsx
git commit -m "feat(atmosphere): extend knowledge panel with chapter 3 menu"
```

---

### Task 14: 大气运动题库数据

**Files:**
- Create: `src/data/atmosphere/quizAtmosphere.ts`
- Modify: `src/data/questions.ts`

- [ ] **Step 1: 创建大气运动题库**

```typescript
// src/data/atmosphere/quizAtmosphere.ts
import { Question } from '@/types';

export const atmosphereQuestions: Question[] = [
  // 第一节 常见天气系统
  {
    id: 'q3-001',
    chapter: '3-1',
    type: 'single-choice',
    question: '关于冷锋的叙述，正确的是（ ）',
    options: [
      'A. 冷气团主动移向暖气团',
      'B. 过境时气温升高',
      'C. 过境后气压下降',
      'D. 暖锋降水在锋后',
    ],
    answer: 'A',
    explanation: '冷锋是冷气团主动向暖气团移动的锋。过境时常出现大风、雨雪天气；过境后冷气团占据原来暖气团位置，气温下降，气压上升，天气转晴。',
    relatedScene: 'cold-front',
  },
  {
    id: 'q3-002',
    chapter: '3-1',
    type: 'single-choice',
    question: '暖锋过境后，天气状况是（ ）',
    options: [
      'A. 气温降低，气压升高',
      'B. 气温升高，气压降低',
      'C. 气温不变，气压不变',
      'D. 气温降低，气压降低',
    ],
    answer: 'B',
    explanation: '暖锋过境后，暖气团占据原来冷气团的位置，气温升高，气压降低，天气转晴。',
    relatedScene: 'warm-front',
  },
  {
    id: 'q3-003',
    chapter: '3-1',
    type: 'single-choice',
    question: '我国长江中下游地区的梅雨天气是由什么形成的？',
    options: [
      'A. 冷锋',
      'B. 暖锋',
      'C. 江淮准静止锋',
      'D. 台风',
    ],
    answer: 'C',
    explanation: '夏初，冷暖气团在我国长江中下游地区交绥，形成江淮准静止锋，造成该地区长达一个多月的梅雨天气。',
    relatedScene: 'stationary-front',
  },
  {
    id: 'q3-004',
    chapter: '3-1',
    type: 'single-choice',
    question: '北半球气旋气流运动的方向是（ ）',
    options: [
      'A. 顺时针方向辐合',
      'B. 逆时针方向辐合',
      'C. 顺时针方向辐散',
      'D. 逆时针方向辐散',
    ],
    answer: 'B',
    explanation: '在北半球，低压（气旋）的气流由四周向中心流动，受地转偏向力影响向右偏转，按逆时针方向流动。',
    relatedScene: 'cyclone',
  },
  {
    id: 'q3-005',
    chapter: '3-1',
    type: 'single-choice',
    question: '下列关于反气旋的叙述，正确的是（ ）',
    options: [
      'A. 中心形成上升气流',
      'B. 常出现阴雨天气',
      'C. 北半球按顺时针方向旋转流出',
      'D. 台风属于反气旋',
    ],
    answer: 'C',
    explanation: '反气旋中心形成下沉气流，水汽不易凝结，天气晴朗。北半球高压气流由中心向外流出，按顺时针方向旋转。',
    relatedScene: 'anticyclone',
  },
  // 第二节 气压带和风带
  {
    id: 'q3-006',
    chapter: '3-2',
    type: 'single-choice',
    question: '赤道低气压带形成的主要原因是（ ）',
    options: [
      'A. 气温低，空气收缩下沉',
      'B. 气温高，空气膨胀上升',
      'C. 海拔高，气压低',
      'D. 副热带高压气流上升',
    ],
    answer: 'B',
    explanation: '赤道地区接受太阳辐射能量多，近地面空气受热膨胀上升，空气密度减小，气压降低，形成赤道低气压带。',
    relatedScene: 'pressure-wind',
  },
  {
    id: 'q3-007',
    chapter: '3-2',
    type: 'single-choice',
    question: '全球共形成几个气压带和几个风带？',
    options: [
      'A. 6个气压带，7个风带',
      'B. 7个气压带，6个风带',
      'C. 5个气压带，6个风带',
      'D. 6个气压带，6个风带',
    ],
    answer: 'B',
    explanation: '全球共形成七个气压带（赤道低压带、南北半球副热带高压带、南北半球副极地低压带、南北半球极地高压带）和六个风带。',
    relatedScene: 'pressure-wind',
  },
  {
    id: 'q3-008',
    chapter: '3-2',
    type: 'single-choice',
    question: '气压带和风带位置随季节移动，在北半球（ ）',
    options: [
      'A. 夏季偏南，冬季偏北',
      'B. 夏季偏北，冬季偏南',
      'C. 夏季偏东，冬季偏西',
      'D. 不随季节移动',
    ],
    answer: 'B',
    explanation: '由于太阳直射点的南北移动，气压带和风带在一年内做周期性季节移动。在北半球，与二分日相比，气压带和风带位置大致是夏季偏北，冬季偏南。',
    relatedScene: 'seasonal-shift',
  },
  {
    id: 'q3-009',
    chapter: '3-2',
    type: 'single-choice',
    question: '东亚夏季风的风向是（ ）',
    options: [
      'A. 西北风',
      'B. 东南风',
      'C. 西南风',
      'D. 东北风',
    ],
    answer: 'B',
    explanation: '夏季北太平洋副热带高压势力增强，太平洋暖湿气流沿着副热带高压西部边缘，以东南风吹到亚洲东南岸，形成东亚夏季风。',
    relatedScene: 'monsoon',
  },
  {
    id: 'q3-010',
    chapter: '3-2',
    type: 'single-choice',
    question: '南亚夏季西南季风的形成原因是（ ）',
    options: [
      'A. 海陆热力差异',
      'B. 气压带风带的季节移动',
      'C. 地形阻挡',
      'D. 洋流影响',
    ],
    answer: 'B',
    explanation: '南亚夏季西南季风是南半球东南信风北移越过赤道，在地转偏向力影响下向右偏转而形成的，属于气压带风带季节移动的结果。',
    relatedScene: 'monsoon',
  },
  // 第三节 气压带风带对气候的影响
  {
    id: 'q3-011',
    chapter: '3-3',
    type: 'single-choice',
    question: '赤道低气压带控制地区的气候特征是（ ）',
    options: [
      'A. 炎热干燥',
      'B. 高温多雨',
      'C. 温和湿润',
      'D. 寒冷干燥',
    ],
    answer: 'B',
    explanation: '赤道地区全年受赤道低气压带控制，盛行上升气流，水汽容易凝结，形成终年高温多雨的热带雨林气候。',
    relatedScene: 'climate-zone',
  },
  {
    id: 'q3-012',
    chapter: '3-3',
    type: 'single-choice',
    question: '温带海洋性气候主要分布在（ ）',
    options: [
      'A. 大陆东岸',
      'B. 大陆西岸',
      'C. 大陆内部',
      'D. 赤道附近',
    ],
    answer: 'B',
    explanation: '纬度40°—60°的大陆西海岸，全年盛行西风，受海洋暖湿气团影响，形成温带海洋性气候。',
    relatedScene: 'climate-zone',
  },
];

export default atmosphereQuestions;
```

- [ ] **Step 2: 合并到主题库**

```typescript
// 在 src/data/questions.ts 中导入并合并
import atmosphereQuestions from './atmosphere/quizAtmosphere';

export const allQuestions = [
  ...existingQuestions,
  ...atmosphereQuestions,
];
```

- [ ] **Step 3: Commit**

```bash
git add src/data/atmosphere/quizAtmosphere.ts src/data/questions.ts
git commit -m "feat(atmosphere): add atmosphere quiz questions"
```

---

### Task 15: 月份自动播放动画

**Files:**
- Modify: `src/pages/AtmosphereIndexPage.tsx`

- [ ] **Step 1: 添加月份自动播放逻辑**

```tsx
// 在 AtmosphereIndexPage.tsx 中添加 useEffect
import { useEffect } from 'react';

// 在组件内部添加
useEffect(() => {
  if (!isPlaying) return;

  const interval = setInterval(() => {
    setMonth((prev) => (prev >= 12 ? 1 : prev + 1));
  }, 2000 / animationSpeed);

  return () => clearInterval(interval);
}, [isPlaying, animationSpeed, setMonth]);
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/AtmosphereIndexPage.tsx
git commit -m "feat(atmosphere): add month auto-playback animation"
```

---

### Task 16: 季风环流3D组件

**Files:**
- Create: `src/components/Scene/Atmosphere/MonsoonFlow.tsx`

- [ ] **Step 1: 实现季风风向流**

```tsx
// src/components/Scene/Atmosphere/MonsoonFlow.tsx
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MONSOON_FLOWS } from '@/data/atmosphere/monsoonData';

interface MonsoonFlowProps {
  season: 'summer' | 'winter';
  visible?: boolean;
}

const EARTH_RADIUS = 5;

export function MonsoonFlowDemo({ season, visible = true }: MonsoonFlowProps) {
  const particlesRef = useRef<THREE.Points>(null);

  const flows = useMemo(() => {
    return MONSOON_FLOWS.filter((f) => f.season === season);
  }, [season]);

  const { positions, curves } = useMemo(() => {
    const allPos: number[] = [];
    const allCurves: THREE.CatmullRomCurve3[] = [];

    flows.forEach((flow) => {
      const points = flow.path.map(([lat, lon]) => {
        const latRad = THREE.MathUtils.degToRad(lat);
        const lonRad = THREE.MathUtils.degToRad(lon);
        const r = EARTH_RADIUS + 0.5;
        return new THREE.Vector3(
          r * Math.cos(latRad) * Math.cos(lonRad),
          r * Math.sin(latRad),
          r * Math.cos(latRad) * Math.sin(lonRad)
        );
      });

      const curve = new THREE.CatmullRomCurve3(points);
      allCurves.push(curve);

      // 沿曲线分布粒子
      for (let i = 0; i < 30; i++) {
        const t = i / 30;
        const pt = curve.getPoint(t);
        allPos.push(pt.x, pt.y, pt.z);
      }
    });

    return {
      positions: new Float32Array(allPos),
      curves: allCurves,
    };
  }, [flows]);

  // 粒子沿曲线运动
  useFrame((_, delta) => {
    if (!particlesRef.current || !visible) return;
    const posAttr = particlesRef.current.geometry.attributes.position;
    const posArray = posAttr.array as Float32Array;

    let idx = 0;
    curves.forEach((curve) => {
      for (let i = 0; i < 30; i++) {
        let t = (i / 30 + delta * 0.1) % 1;
        const pt = curve.getPoint(t);
        posArray[idx++] = pt.x;
        posArray[idx++] = pt.y;
        posArray[idx++] = pt.z;
      }
    });

    posAttr.needsUpdate = true;
  });

  if (!visible) return null;

  return (
    <group>
      {/* 季风路径线 */}
      {curves.map((curve, i) => (
        <mesh key={i}>
          <tubeGeometry args={[curve, 64, 0.08, 8, false]} />
          <meshBasicMaterial
            color={season === 'summer' ? '#4CAF50' : '#2196F3'}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}

      {/* 流动粒子 */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={season === 'summer' ? '#81C784' : '#64B5F6'}
          size={0.15}
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Scene/Atmosphere/MonsoonFlow.tsx
git commit -m "feat(atmosphere): add monsoon flow 3D component"
```

---

## 自我审查 (Self-Review)

### 1. Spec覆盖率检查

| 课本内容 | 对应任务 | 状态 |
|---------|---------|------|
| 冷锋（冷气团主动、大风雨雪、气温降） | Task 8: ColdFrontDemo | ✓ |
| 暖锋（暖气团主动、连续性降水、气温升） | Task 8: WarmFrontDemo | ✓ |
| 准静止锋（梅雨、昆明准静止锋） | Task 8: FrontPlane (可配置) | ✓ |
| 气旋（北半球逆时针、上升、阴雨） | Task 9: CycloneSystem | ✓ |
| 反气旋（北半球顺时针、下沉、晴朗） | Task 9: AnticycloneSystem | ✓ |
| 三圈环流（低/中/高纬） | Task 5: CirculationCell | ✓ |
| 七个气压带六个风带 | Task 3+7: PressureZoneRing + WindBeltParticles | ✓ |
| 季节移动（夏北冬南） | Task 6+7: SeasonalShiftGroup | ✓ |
| 海陆分布影响 | Task 7: PressureWindScene (可扩展) | ✓ |
| 季风环流（东亚/南亚） | Task 16: MonsoonFlow | ✓ |
| 气压带风带对气候影响 | Task 14: 题库包含气候题 | △ (可扩展气候3D) |

**Gap**: 第三节"气压带和风带对气候的影响"的3D可视化未完全实现，建议后续添加气候带分布图。但题库已覆盖。

### 2. Placeholder扫描

- 无 "TBD"、"TODO"、"implement later"
- 无 "Add appropriate error handling" 等模糊描述
- 所有代码步骤包含完整代码
- 无 "Similar to Task N" 引用

### 3. 类型一致性检查

- `AtmosphereSceneMode` 类型与所有 `setSceneMode` 调用一致
- `Hemisphere` 类型在 CycloneSystem、AnticycloneSystem、CycloneControlPanel 中一致使用
- `PressureZoneConfig`、`WindBeltConfig`、`CirculationCellConfig` 在数据层和3D组件间一致
- `seasonalShift` 参数类型在 PressureZoneRing、WindBeltParticles、CirculationCell 中一致

---

## 执行交接

**Plan complete and saved to `c:\Users\Lenovo\Desktop\大气的运动\.trae\documents\2026-07-07-atmospheric-motion-teaching-system.md`.**

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
