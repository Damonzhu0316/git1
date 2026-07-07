# 黑屏修复与UI布局全面优化计划

## 摘要

针对用户提出的三大类问题（地心视角功能增强、三个视角布局缺陷、系统整体优化）进行系统性修复和改进。涉及约15个文件的修改和新增，包括替换太阳为光线模型、添加时间拖拽滑块、整合地理公式面板、新增地方时飞行计算演示、修复叠加层联动、调整全局布局、缩小太阳、公转轨道改为椭圆面等。

---

## 一、当前状态分析

### 1.1 地心视角现状

| 项目 | 现状 | 问题 |
|------|------|------|
| 太阳 | `SUN_RADIUS=4` 的3D球体 + 两层光晕 | 太大，与轨道半径12的比例为1:3，视觉上占据太多空间 |
| 时间控制 | 按钮点击 `-1h/+1h` + 四时段快捷按钮 | 不直观，无法快速扫描一天变化 |
| 公式展示 | 无 | 缺少高中地理核心公式（正午太阳高度、地方时、时区计算等） |
| 地方时飞行演示 | 无 | 缺少地方时计算的实际应用场景演示 |
| 叠加层 | 6个按钮（晨昏线、赤道面、经纬网、昼弧/夜弧、太阳高度角、地方时） | 部分按钮点击后无视觉变化或黑屏；`showDayNightArc`、`showSolarAltitude`、`showLocalTime` 在 GeocentricScene 中无对应渲染组件 |
| 经纬网 | 步长30°的线框 | 不够清晰，缺少关键纬度标签（回归线、极圈） |

### 1.2 布局现状

| 问题 | 根因 | 影响 |
|------|------|------|
| 左侧面板顶部缺口 | `KnowledgePanel` 的 `top-12` 与顶部栏高度一致，但面板内标题区域与顶部栏之间留下空白 | 视觉效果不美观 |
| 右侧面板底部缺口 | 右侧面板 `bottom-7`（28px），底部栏 `py-1.5`（约28px），两者之间有空隙 | 视觉效果不连贯 |
| 右侧面板文字溢出 | 固定宽度 `w-52`（208px）容器内，文字超出边框 | 部分文字被截断或溢出 |
| 太阳过大 | `SUN_RADIUS=4`，光晕半径达6.4 | 影响观感，遮蔽其他天体 |
| 公转轨道为线 | 仅用 `Line` 绘制椭圆轨道 | 应有椭圆面（半透明填充） |

### 1.3 代码结构问题

- 三个页面（GeocentricPage、HeliocentricPage、SurfacePage）中存在大量重复的布局代码（PANEL_WIDTH、panelOffset 计算、固定定位元素样式）
- 叠加层按钮在右侧面板中定义了 toggle 操作，但部分按钮对应的 3D 组件在 Scene 中不存在或未正确响应状态变化

---

## 二、具体修改计划

### 阶段A：地心视角功能增强（5个修改 + 2个新增文件）

#### A1. 太阳改为光线模型（缩小 + 方向光）

**文件**: `src/components/Scene/GeocentricScene.tsx`（第21-48行）
**内容**: 
- 将 `GeoSun` 组件中的太阳球体半径从 `SUN_RADIUS` 改为 `SUN_RADIUS * 0.6`（约2.4）
- 光晕缩小为 `SUN_RADIUS * 0.9` 和 `SUN_RADIUS * 0.7`
- 保留点光源作为地球光照来源
- 在日心视角也同步缩小太阳

**文件**: `src/utils/constants.ts`（第3行）
**内容**: `SUN_RADIUS` 从 4 改为 2.5（全局生效）

#### A2. 时间拖拽滑块

**新增文件**: `src/components/UI/TimeSlider.tsx`
**内容**:
- 一个水平滑块组件，范围 0-24（代表一天中的小时）
- 实时显示当前时间
- 拖动时通过 `useStore.setDate()` 更新时间
- 下方显示当前小时对应的太阳高度角、方位角等实时数据
- 样式：Tailwind 渐变滑块，匹配深色主题

**修改文件**: `src/pages/GeocentricPage.tsx`（第159-169行）
**内容**: 在"时刻调节"区块中，将按钮式时间调节改为 `<TimeSlider />` 组件，保留 -1h/+1h 微调按钮在滑块两侧

#### A3. 地理公式面板

**新增文件**: `src/components/UI/FormulaPanel.tsx`
**内容**:
- 常驻显示在右侧面板底部（或折叠在"时刻调节"下方）
- 包含以下高中地理核心公式：
  - 正午太阳高度：`H = 90° - |φ - δ|`
  - 地方时计算：`T₂ = T₁ + (λ₂ - λ₁) / 15°`
  - 时区计算：`区时 = 已知区时 ± 时区差`
  - 昼长计算：`昼长 = 2 × arccos(-tan φ × tan δ) / 15°`
  - 日出/日落时刻：`cos ω = -tan φ × tan δ`
- 每个公式附带当前观测点的实时计算结果
- 可折叠/展开，默认折叠

**修改文件**: `src/pages/GeocentricPage.tsx`
**内容**: 在右侧面板的"叠加层"区块之后添加 `<FormulaPanel />`

#### A4. 地方时飞行计算演示

**新增文件**: `src/components/Scene/FlightTimeDemo.tsx`
**内容**:
- 在地球表面显示两个城市标记点（起点和终点）
- 显示飞行路径弧线
- 右侧面板显示计算步骤：
  - 起飞时当地时间
  - 飞行时长
  - 到达时目的地当地时间
  - 计算过程：`到达当地时间 = 起飞当地时间 + 飞行时长 + (目的地经度 - 出发地经度) / 15°`
- 可切换出发地和目的地（北京↔纽约、北京↔伦敦、东京↔洛杉矶等预设）

**修改文件**: `src/components/Scene/GeocentricScene.tsx`（第315-337行）
**内容**: 在 GeoContent 中添加 `<FlightTimeDemo />` 组件

**修改文件**: `src/pages/GeocentricPage.tsx`
**内容**: 在叠加层区块中添加"飞行时间计算"切换按钮

**修改文件**: `src/store/useStore.ts`
**内容**: 新增状态字段 `showFlightTime: false`，`flightOrigin: 'beijing'`，`flightDestination: 'newyork'`

#### A5. 修复叠加层联动

**问题诊断**: 以下叠加层按钮在 GeocentricPage 右侧面板中定义了，但 GeocentricScene 中没有对应的渲染组件：
- `showDayNightArc` → 无对应组件
- `showSolarAltitude` → 无对应组件（地表视角的 SolarAltitudeApp 在 SurfaceScene 中）
- `showLocalTime` → 无对应组件

**修复方案**:
- **昼弧/夜弧**: 在 `GeocentricScene` 中添加 `DayNightArcOverlay` 组件，使用 shader 在地球表面高亮显示当前观测点（targetLatitude）的昼弧和夜弧段
- **太阳高度角**: 在地心视角中，改为显示太阳直射点与观测点之间的角度关系线（从地心到观测点的连线与太阳方向的夹角可视化）
- **地方时**: 在地心视角中，高亮显示当前观测点经线，并显示该经线上各点的地方时

**修改文件**: `src/components/Scene/GeocentricScene.tsx`
**内容**: 在 GeoContent 中根据 `showDayNightArc`、`showSolarAltitude`、`showLocalTime` 条件渲染对应组件

**修改文件**: `src/pages/GeocentricPage.tsx`
**内容**: 确保叠加层按钮的 active 状态与实际渲染状态一致

#### A6. 经纬网增强

**修改文件**: `src/components/Scene/GeocentricScene.tsx`（第222-267行 GeoGridLines）
**内容**:
- 添加关键纬度标签（赤道0°、北回归线23.5°N、南回归线23.5°S、北极圈66.5°N、南极圈66.5°S）
- 使用 Sprite 文字标签显示在纬度线旁边
- 增加纬度线密度（步长从30°改为15°）
- 关键纬度线使用不同颜色高亮（回归线橙色、极圈蓝色）

---

### 阶段B：三个视角布局修复（4个文件修改）

#### B1. 左侧面板顶部缺口

**修改文件**: `src/components/UI/KnowledgePanel.tsx`
**内容**:
- 将面板的 `top-12` 改为 `top-0`，使面板占据全高
- 面板内部顶部添加标题区域（替代原先的顶部栏覆盖部分）
- 顶部栏的 `left` 偏移保持一致

**修改文件**: `src/pages/GeocentricPage.tsx`、`src/pages/HeliocentricPage.tsx`、`src/pages/SurfacePage.tsx`
**内容**: 顶部栏从 `top-0` 保持不变，但 KnowledgePanel 现在从 `top-0` 开始，面板顶部与顶部栏重叠区域由面板 z-index 处理

#### B2. 右侧面板底部缺口

**修改文件**: `src/pages/GeocentricPage.tsx`（第134行）、`src/pages/HeliocentricPage.tsx`、`src/pages/SurfacePage.tsx`
**内容**:
- 将右侧面板的 `bottom-7` 改为 `bottom-0`，使其延伸到底部
- 底部栏高度统一为 `h-8`（32px），右侧面板底部留出对应空间
- 或者：右侧面板 `bottom-8`，底部栏 `h-8`，两者无缝衔接

#### B3. 右侧面板文字溢出

**修改文件**: `src/pages/GeocentricPage.tsx`、`src/pages/HeliocentricPage.tsx`、`src/pages/SurfacePage.tsx`
**内容**:
- 为所有右侧面板内的文字标签添加 `truncate` 或 `text-ellipsis` 类
- 将右侧面板宽度从 `w-52`（208px）增加到 `w-56`（224px）以容纳更多内容
- 对于仍然溢出的文字，添加 `whitespace-nowrap overflow-hidden text-ellipsis`
- 所有 GlassButton 内的文字添加 `truncate` 类

#### B4. 太阳缩小

**修改文件**: `src/utils/constants.ts`（第3行）
**内容**: `SUN_RADIUS` 从 4 改为 2.5

**影响范围**:
- `GeocentricScene.tsx`: 太阳球体、光晕自动缩小
- `HeliocentricScene.tsx`: 太阳球体、光晕自动缩小
- `SurfaceScene.tsx`: 太阳球体 `radius=0.55` 保持不变（地表视角是另一个比例尺）

#### B5. 公转轨道改为椭圆面

**修改文件**: `src/components/Scene/HeliocentricScene.tsx`（第113-151行 HelioOrbitLines）
**内容**:
- 在当前轨道线下方添加半透明椭圆面
- 使用 `THREE.RingGeometry` 或自定义 `ShapeGeometry` 绘制椭圆面
- 使用带有透明度的 `MeshBasicMaterial`（opacity 0.15-0.2）
- 椭圆面颜色：`#335577`，与轨道线颜色协调
- 月球轨道也添加类似的小椭圆面

---

### 阶段C：系统整体优化（3个修改）

#### C1. 抽取公共布局组件

**新增文件**: `src/components/UI/ViewLayout.tsx`
**内容**:
- 封装三个页面共享的布局结构：
  - 顶部栏（标题、返回按钮、重置/题库按钮）
  - 左侧数据卡（位置、参数根据 props 传入）
  - 右侧控制面板（内容由 children 渲染）
  - 底部信息栏（内容由 props 传入）
- 统一管理 `panelOffset` 计算和过渡动画
- Props: `title`, `viewType`, `leftDataCard`, `rightPanel`, `bottomBar`

**修改文件**: `src/pages/GeocentricPage.tsx`、`src/pages/HeliocentricPage.tsx`、`src/pages/SurfacePage.tsx`
**内容**: 使用 `<ViewLayout>` 替换重复的布局代码，只保留各自特有的内容

#### C2. 右侧面板底部添加公式区

**修改文件**: `src/pages/GeocentricPage.tsx`
**内容**: 在右侧面板的叠加层区块之后，添加公式展示区：
```
┌─────────────────────┐
│    时间与位置        │
│    当前日期          │
│    日期调节          │
│    时刻调节 + 滑块   │
│    二分二至          │
│    纬度/经度         │
│    视图预设          │
│    叠加层            │
├─────────────────────┤
│  📐 地理公式         │
│  H = 90° - |φ - δ| │
│  = 90° - |40 - 23.5|│
│  = 73.5°            │
│  ─────────────────  │
│  地方时差 = Δλ/15°  │
│  ...                │
└─────────────────────┘
```

#### C3. 底部栏信息优化

**修改文件**: 三个页面文件
**内容**:
- 将底部栏的多行数据分成两行：
  - 第一行：关键动态数据（日期、直射点、昼长、太阳高度）
  - 第二行：次要数据 + 操作提示
- 或者使用可折叠的底部面板，默认显示一行摘要

---

## 三、假设与决策

1. **太阳缩小比例**: 当前 `SUN_RADIUS=4` 改为 `2.5`，缩小约37.5%，视觉上更协调
2. **时间滑块步长**: 滑块步长设为15分钟，精确到整点显示标签
3. **公式面板默认折叠**: 避免右侧面板过于拥挤，用户可点击展开
4. **飞行演示预设**: 预设北京↔纽约（标准高考题场景），可扩展到其他城市对
5. **椭圆面透明度**: opacity=0.15，既可见又不遮挡轨道线
6. **不修改 SurfaceScene 太阳**: 地表视角的太阳是一个独立的比例尺模型（`radius=0.55`），与轨道半径无关
7. **保持向后兼容**: 所有新增状态字段均有默认值，不影响现有功能

---

## 四、验证步骤

1. **TypeScript编译**: `npx tsc --noEmit` 确保0错误
2. **Vite构建**: `npx vite build` 确保构建成功
3. **逐页测试**:
   - 首页：三个视角入口正常
   - 地心视角：太阳缩小、时间滑块可拖动、公式面板显示、叠加层点击不黑屏、飞行演示正常
   - 日心视角：太阳缩小、椭圆面可见、面板布局正常
   - 地表视角：布局正常、太阳高度角应用正常
4. **布局检查**: 左侧面板顶部无缺口、右侧面板底部无缺口、文字无溢出
5. **叠加层联动**: 点击每个叠加层按钮，确认3D场景中有对应视觉变化
6. **控制台**: 无new Error（忽略预加载脚本和DevTools的无关错误）

---

## 五、文件变更清单

| 操作 | 文件 | 说明 |
|------|------|------|
| 修改 | `src/utils/constants.ts` | `SUN_RADIUS: 4 → 2.5` |
| 修改 | `src/components/Scene/GeocentricScene.tsx` | 太阳缩小、添加叠加层组件、添加FlightTimeDemo、经纬网增强 |
| 修改 | `src/components/Scene/HeliocentricScene.tsx` | 太阳缩小、轨道添加椭圆面 |
| 修改 | `src/pages/GeocentricPage.tsx` | 时间滑块、公式面板、飞行演示按钮、布局修复 |
| 修改 | `src/pages/HeliocentricPage.tsx` | 布局修复 |
| 修改 | `src/pages/SurfacePage.tsx` | 布局修复 |
| 修改 | `src/components/UI/KnowledgePanel.tsx` | 顶部缺口修复 |
| 修改 | `src/store/useStore.ts` | 新增 showFlightTime、flightOrigin、flightDestination 状态 |
| 新增 | `src/components/UI/TimeSlider.tsx` | 时间拖拽滑块组件 |
| 新增 | `src/components/UI/FormulaPanel.tsx` | 地理公式展示面板 |
| 新增 | `src/components/Scene/FlightTimeDemo.tsx` | 地方时飞行计算3D演示 |
| 新增 | `src/components/UI/ViewLayout.tsx` | 公共布局组件（可选，视复杂度决定） |
| 修改 | `src/data/knowledgePoints.ts` | 添加飞行时间演示知识点 |