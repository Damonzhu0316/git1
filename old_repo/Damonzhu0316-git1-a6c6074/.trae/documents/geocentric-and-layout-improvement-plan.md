# 地心视角增强与布局修复计划

## 摘要

基于用户三大类改进需求，本计划涵盖：
1. **地心视角功能增强**：太阳弱化为定向光源、TimeSlider 集成、FormulaPanel 集成、FlightTimeDemo 集成、叠加层修复（地方时经线高亮、昼弧/夜弧联动、太阳高度角可视化）
2. **三个视角布局修复**：左侧面板顶部缺口、右侧面板底部缺口、文字溢出、太阳尺寸、公转轨道椭圆面
3. **从用户（地理教学）角度出发的额外改进**

---

## 当前状态分析

### 已完成（上次会话）
- `SUN_RADIUS` 从 4 → 2.5（constants.ts）
- `TimeSlider.tsx` 组件已创建（119行，0-24h拖拽滑块，渐变轨道，精度15分钟）
- `FormulaPanel.tsx` 组件已创建（110行，5个高中地理公式实时计算）
- `FlightTimeDemo.tsx` 组件已创建（221行，3D飞行路径 + FlightTimePanel UI面板）
- `types/index.ts` 已新增 `showFlightTime`、`flightOrigin`、`flightDestination` 及 setter 方法
- `store/useStore.ts` 已新增对应状态字段和 setter 方法

### 待完成
- 三个新组件尚未集成到 GeocentricPage 和 GeocentricScene
- 叠加层 `showLocalTime` 按钮存在但无对应 3D 渲染组件
- `showDayNightArc` 和 `showSolarAltitude` 有 GeoOverlays.tsx 但需验证联动
- 布局问题：KnowledgePanel `top-12`、三页面右侧面板 `bottom-7`、文字溢出
- 公转轨道无椭圆面

---

## 详细变更

### A. 地心视角功能增强

#### A1. 太阳弱化为定向光源（部分完成，需微调）

**文件**: `src/components/Scene/GeocentricScene.tsx`

**现状**: `GeoSun` 组件渲染完整太阳球体（SUN_RADIUS=2.5 + 两层光晕），点光源强度80。

**变更**: 
- 将太阳球体材质的 `opacity` 降低至 0.4，使太阳在视觉上更弱化
- 光晕层 opacity 从 0.15/0.3 降为 0.08/0.15
- 添加从太阳位置指向地球的可见光线箭头（`showSunRay` 在地心视角下默认开启），用一条细线从太阳位置连到地球，表示光照方向
- 保留 `pointLight` 确保地球始终有光照亮半球

**理由**: 用户明确要求"太阳弱化为光线，永远能照到地球某一个半球"，需要太阳在视觉上不喧宾夺主，但光照效果保留。

#### A2. 集成 TimeSlider 到 GeocentricPage

**文件**: `src/pages/GeocentricPage.tsx`

**变更**:
- 在右侧面板顶部（"时间与位置" header 下方）替换现有的按钮式时刻调节（第159-171行）
- 保留日期调节按钮区域
- 移除原有的 "时刻调节" 按钮组（-1h/+1h/子夜/黎明/正午/黄昏）
- 插入 `<TimeSlider />` 组件

**理由**: 用户要求"右侧时间应该是搞成拖动的，可以通过拖动来观察变化"。

#### A3. 集成 FormulaPanel 到 GeocentricPage

**文件**: `src/pages/GeocentricPage.tsx`

**变更**:
- 在右侧面板的叠加层区域下方（或作为一个独立可折叠区域），插入 `<FormulaPanel />`
- FormulaPanel 已实现折叠/展开功能，默认折叠

**理由**: 用户要求"在下面给出高中地理对应的计算公式"。

#### A4. 集成 FlightTimeDemo 到 GeocentricPage 和 GeocentricScene

**文件**: `src/pages/GeocentricPage.tsx`, `src/components/Scene/GeocentricScene.tsx`

**变更**:
- **GeocentricScene**: 在 `GeoContent` 中导入并渲染 `<FlightTimeDemo />`（放在 FiveZonesOverlay 之后）
- **GeocentricPage**: 在右侧面板添加飞行时间切换按钮（使用 `toggleSetting('showFlightTime')`），并在按钮下方条件渲染 `<FlightTimePanel />`
- 在叠加层区域添加飞行时间按钮

**理由**: 用户要求"坐飞机从某地起飞到某地下落，这一块也需要有明显的演示"。

#### A5. 修复叠加层 — 新增地方时经线高亮组件

**新建文件**: `src/components/Scene/LocalTimeHighlight.tsx`

**功能**: 当 `showLocalTime` 为 true 时，在地球表面高亮显示观测点所在经线（从北极到南极的弧线），并在赤道位置显示该经线对应的地方时数值。同时显示本初子午线（0°经线）作为参考。

**实现要点**:
- 使用 `useMemo` 创建经线弧线（从北极到南极，沿地球表面）
- 在 useFrame 中保持随地球自转
- 使用 Canvas/Sprite 标注地方时数值
- 颜色：观测点经线用 `#44ff88`，本初子午线用 `#ff4444` 虚线

**文件**: `src/components/Scene/GeocentricScene.tsx`
- 在 `GeoContent` 中导入并渲染 `<LocalTimeHighlight />`

**文件**: `src/components/Scene/GeoOverlays.tsx`
- 验证 DayNightArc 和 SolarAltitudeArc 的联动是否正常
- 修复潜在问题：DayNightArc 中 children[0] 和 children[1] 的索引访问改为 ref 引用
- 确保 showDayNightArc 和 showSolarAltitude 切换时场景正确响应

**理由**: 用户反馈"叠加层目前有的没有用点击黑屏，有的也不联动，就是固定一个样子"。showLocalTime 按钮存在但无对应 3D 组件，showDayNightArc 和 showSolarAltitude 虽有 GeoOverlays 但需验证联动。

#### A6. 经纬网增强

**文件**: `src/components/Scene/GeocentricScene.tsx`（GeoGridLines 组件）

**变更**:
- 纬度步长从 30° 改为 15°（-75° 到 75°，步长 15°）
- 关键纬度用不同颜色区分：
  - 赤道(0°): `#ff4444`（红色，加粗）
  - 回归线(±23.5°): `#ffaa00`（橙色）
  - 极圈(±66.5°): `#44aaff`（蓝色）
  - 其他纬度: `#44ff88`（绿色，更细）
- 在关键纬度位置添加 Sprite 标签（文字标注纬度值）
- 经度步长保持 30°，但 0° 和 180° 经线用不同颜色

**理由**: 用户要求"地球上的经纬等各种数据非常清晰"。

---

### B. 布局修复

#### B1. 左侧面板顶部缺口

**文件**: `src/components/UI/KnowledgePanel.tsx`

**变更**: 
- 第179行 `top-12` → `top-0`
- 面板内部的视图标题区域（第185-188行）添加 `pt-2` 补偿顶部间距，避免内容紧贴顶部

**理由**: 用户截图显示左侧面板顶部有缺口，因为 KnowledgePanel 从 `top-12`（48px）开始，而顶部栏是独立的 fixed 元素。现在让面板覆盖整个左侧高度，顶部栏在面板上方自然遮挡。

#### B2. 右侧面板底部缺口

**文件**: 
- `src/pages/GeocentricPage.tsx` 第134行
- `src/pages/HeliocentricPage.tsx` 第103行
- `src/pages/SurfacePage.tsx` 第102行

**变更**: 三个页面的右侧面板 `bottom-7` → `bottom-0`

同时调整底部栏的 `right` 值以匹配：
- GeocentricPage 底部栏 `right: '208px'` → `right: '208px'`（w-52 = 208px，保持不变）
- HeliocentricPage 底部栏 `right: '192px'` → `right: '192px'`（w-48 = 192px，保持不变）
- SurfacePage 底部栏 `right: '208px'` → `right: '208px'`（保持不变）

**理由**: 用户截图显示右侧面板底部有28px缺口，因为 `bottom-7` 预留了间距。改为 `bottom-0` 让面板延伸到底部。

#### B3. 右侧面板文字溢出修复

**文件**: 
- `src/pages/GeocentricPage.tsx` 第134行
- `src/pages/HeliocentricPage.tsx` 第103行
- `src/pages/SurfacePage.tsx` 第102行

**变更**:
- GeocentricPage: 右侧面板 `w-52`（208px）→ `w-56`（224px），与左侧面板宽度一致
- HeliocentricPage: 右侧面板 `w-48`（192px）→ `w-52`（208px）
- SurfacePage: 右侧面板 `w-52`（208px）→ `w-56`（224px）
- 所有面板内部的文字元素添加 `truncate` 或 `overflow-hidden` 类
- 底部栏 right 值同步更新：
  - GeocentricPage: `right: '208px'` → `right: '224px'`
  - HeliocentricPage: `right: '192px'` → `right: '208px'`
  - SurfacePage: `right: '208px'` → `right: '224px'`

**理由**: 用户反馈"右侧面板还有很多文字在框子外面"，需要加宽面板并确保文字不溢出。

#### B4. 太阳尺寸（已完成）

**文件**: `src/utils/constants.ts`

**状态**: `SUN_RADIUS` 已从 4 改为 2.5。验证后确认此值在所有场景中生效（HeliocentricScene 和 GeocentricScene 都使用此常量）。

#### B5. 公转轨道椭圆面

**文件**: `src/components/Scene/HeliocentricScene.tsx`

**变更**: 在 `HelioOrbitLines` 组件中添加半透明椭圆面：
- 使用 `RingGeometry` 或 `ShapeGeometry` 创建椭圆面
- 半长轴 = EARTH_ORBIT_RADIUS (12)，半短轴 = EARTH_ORBIT_RADIUS * sqrt(1 - e²) ≈ 11.998
- 材质：`MeshBasicMaterial`，颜色 `#5588cc`，opacity 0.08，DoubleSide，depthWrite: false
- 可随 `showEclipticPlane` 联动显示/隐藏，或单独控制

**理由**: 用户要求"公转轨道改成椭圆面"，即轨道需要有面（plane）而不只是线。

---

### C. 从用户角度出发的额外改进

#### C1. 知识面板知识点补全

**文件**: `src/data/knowledgePoints.ts`

**变更**: 
- 在地心视角知识点中补充"飞行时间计算"条目（对应 showFlightTime）
- 在地心视角知识点中补充"地方时计算"条目（对应 showLocalTime）
- 确保所有叠加层按钮在知识面板中都有对应的知识点入口

**理由**: 知识面板是用户（地理教师/学生）的核心交互入口，新增的功能需要在这里有入口。

#### C2. 右侧面板整合优化

**文件**: `src/pages/GeocentricPage.tsx`

**变更**: 重新组织右侧面板布局，按照教学逻辑排列：
1. 时间与位置（header）
2. 当前日期（只读显示）
3. 日期调节（按钮组）
4. **TimeSlider（拖动滑块，替换原来的时刻调节按钮）**
5. 二分二至（快捷按钮）
6. 纬度选择
7. 经度选择
8. 视图预设
9. 叠加层（晨昏线、赤道面、经纬网、昼弧/夜弧、太阳高度角、地方时、飞行时间）
10. **FormulaPanel（折叠面板，公式计算）**
11. **FlightTimePanel（条件显示，飞行时间计算）**

**理由**: 当前面板有9个区域，新增 TimeSlider、FormulaPanel、FlightTimePanel 后需合理组织。按照教学逻辑：先设时间→选位置→看叠加层→学公式→做练习。

#### C3. 太阳方向指示器

**文件**: `src/components/Scene/GeocentricScene.tsx`

**变更**: 在 GeoSun 组件中添加一个从太阳指向地球的细箭头线（使用 `showSunRay` 状态控制），默认显示。帮助用户直观理解太阳光线的方向。

**理由**: 从教学角度，用户需要明确看到"太阳在哪个方向照过来"，特别是在地心视角下太阳绕地球转时。

#### C4. 地心视角太阳更弱化

**文件**: `src/components/Scene/GeocentricScene.tsx`

**变更**: 
- GeoSun 球体基础 opacity 保持 1.0（需要可见），但将光晕层进一步缩小
- 将 GeoSun 第二层光晕半径从 `SUN_RADIUS * 1.25` 改为 `SUN_RADIUS * 1.1`
- 将 GeoSun 第一层光晕半径从 `SUN_RADIUS * 1.6` 改为 `SUN_RADIUS * 1.3`
- 光晕 opacity 保持 0.08/0.15

**理由**: 用户说"太阳稍微小一点点，现在太大了，影响观感"。SUN_RADIUS=2.5 已经比之前的 4 小了很多，但光晕层仍然很大，需要缩小。

---

## 实施步骤

### 步骤 1: 布局修复（B1-B3）
- 修改 KnowledgePanel.tsx：`top-12` → `top-0`
- 修改三个 Page 文件：`bottom-7` → `bottom-0`，`w-*` + 底部栏 `right` 同步更新
- 添加文字截断类

### 步骤 2: 公转轨道椭圆面（B5）
- 在 HeliocentricScene.tsx 添加椭圆 RingGeometry

### 步骤 3: 新增 LocalTimeHighlight 组件（A5）
- 创建 `LocalTimeHighlight.tsx`
- 在 GeocentricScene 中集成

### 步骤 4: 经纬网增强（A6）
- 修改 GeoGridLines 组件，添加纬度标签和颜色区分

### 步骤 5: GeocentricScene 集成（A4, A5）
- 添加 FlightTimeDemo 导入和渲染
- 添加 LocalTimeHighlight 导入和渲染
- 太阳方向指示器

### 步骤 6: GeocentricPage 右侧面板整合（A2, A3, A4, C2）
- 移除旧时刻调节按钮，插入 TimeSlider
- 插入 FormulaPanel
- 添加飞行时间按钮和 FlightTimePanel
- 重新组织面板布局

### 步骤 7: 知识面板补全（C1）
- 更新 knowledgePoints.ts

### 步骤 8: 验证
- TypeScript 编译检查
- Vite 构建检查
- 逐页功能测试

---

## 假设与决策

1. **太阳弱化**：保留太阳球体（用户需要看到太阳位置），但缩小光晕、降低视觉权重
2. **面板宽度**：GeocentricPage 和 SurfacePage 右侧面板从 208px 加宽到 224px（与左侧面板一致），HeliocentricPage 从 192px 加宽到 208px
3. **KnowledgePanel top-0**：面板从屏幕顶部开始，与顶部栏（z-50）在视觉上重叠，但顶部栏在面板上方，形成自然的"面板在顶部栏下方"的效果
4. **轨道椭圆面**：默认跟随 `showEclipticPlane` 状态显示/隐藏，不新增独立开关
5. **LocalTimeHighlight**：新建独立组件，通过 `showLocalTime` 状态控制

---

## 验证步骤

1. `pnpm run build` 确保 TypeScript 编译和 Vite 构建通过
2. 逐页检查：
   - 地心视角：TimeSlider 拖动是否流畅，FormulaPanel 是否可折叠，FlightTimeDemo 是否显示飞行路径，LocalTime 切换是否显示经线高亮，DayNightArc/SolarAltitude 切换是否正常
   - 日心视角：轨道椭圆面是否可见，太阳大小是否合适
   - 地表视角：布局是否正常
3. 检查三个页面的面板是否有缺口或溢出
4. 检查知识面板是否有新增知识点入口