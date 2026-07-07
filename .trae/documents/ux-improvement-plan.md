# 用户交互与体验大幅提升计划

## 摘要

基于对 `geosim1` 项目（地球的运动 · 3D交互实验系统）的全面代码审查，本计划系统性地提出 8 大类、共 30+ 项 UX 改进措施，覆盖：页面过渡动画、新手引导、视觉反馈与微交互、键盘快捷键、用户偏好持久化、全局搜索与导航、性能优化、以及3D场景交互增强。目标是将当前功能性工具提升为具有专业教学软件品质的交互体验。

---

## 一、当前状态分析

### 1.1 已完成的 UX 相关改进

| 项目 | 状态 | 说明 |
|------|------|------|
| 三个独立视角页面 | 已实现 | HeliocentricPage / GeocentricPage / SurfacePage 通过 React Router 切换 |
| 左侧知识面板 | 已实现 | KnowledgePanel 树形菜单，可折叠 |
| 右侧控制面板 | 已实现 | 各页面独立右侧面板，含叠加层切换 |
| 题库抽屉 | 已实现 | ExamDrawer 从右侧滑出，支持搜索筛选 |
| 播放控制 | 已实现 | PlaybackControls 播放/暂停/速度调节 |
| 时间滑块 | 已实现 | TimeSlider 拖拽式时间调节 |
| 公式面板 | 已实现 | FormulaPanel 可折叠地理公式展示 |
| 飞行时间演示 | 已实现 | FlightTimeDemo 3D飞行路径 |
| 错误边界 | 已实现 | ErrorBoundary 基本错误捕获和重试 |
| 帮助对话框 | 已实现 | HelpDialog 基础使用说明 |
| 移动端适配 | 部分实现 | MobileNavBar、移动端抽屉面板 |
| 响应式布局 | 部分实现 | useIsMobile hook 驱动布局切换 |

### 1.2 核心 UX 缺陷

| 类别 | 问题 | 影响 |
|------|------|------|
| **页面过渡** | 视图切换时无任何过渡动画，瞬间跳转 | 用户感到突兀，缺乏空间连续性 |
| **新手引导** | 无引导流程，首次使用者不知道从何开始 | 学习曲线陡峭，教学使用门槛高 |
| **视觉反馈** | 3D天体无悬停高亮、无点击涟漪、面板切换无动画 | 交互缺乏"响应感"，操作是否生效不明显 |
| **键盘操作** | 完全依赖鼠标，无键盘快捷键 | 教师演示时不便快速切换，无障碍性差 |
| **状态持久化** | 刷新页面后所有状态丢失（面板状态、最后视角、日期等） | 每次打开都需要重新设置 |
| **全局搜索** | 无全局搜索功能 | 知识点多时难以快速定位 |
| **性能感知** | 无加载进度、无FPS显示、无质量设置 | 低端设备体验差，用户不知道是否在加载 |
| **3D交互** | 天体点击信息卡简陋，无测量工具 | 教学交互深度不足 |

### 1.3 代码结构问题

- 三个页面（HeliocentricPage、GeocentricPage、SurfacePage）中约 40% 的布局代码重复
- 右侧面板组织方式不统一（HeliocentricPage 用内联 JSX，SurfacePage 用独立组件 SurfaceRightPanel）
- 缺少统一的动画/过渡工具函数
- 无全局的 Toast/通知系统

---

## 二、UX 改进详细计划

### 模块 A：页面过渡与动画系统

#### A1. 视图切换过渡动画

**新增文件**: `src/components/UI/PageTransition.tsx`

**内容**:
- 使用 CSS `@keyframes` 实现页面进入/退出动画
- 进入动画：从透明 + 缩放0.95 → 完全不透明 + 缩放1.0（300ms ease-out）
- 退出动画：反向（200ms ease-in）
- 使用 `framer-motion` 的 `AnimatePresence` 包装路由切换
- 或在 CSS 中使用 `view-transition-api`（Chrome 已支持）

**修改文件**: `src/App.tsx`
- 将 `<Routes>` 包装在过渡组件中

**修改文件**: `src/index.css`
- 添加 `@keyframes page-enter` 和 `@keyframes page-exit` 动画

#### A2. 面板滑入/滑出动画

**修改文件**: `src/components/UI/KnowledgePanel.tsx`
- 左侧面板展开/收起时使用 `transition-all duration-300` 替代当前的突变
- 面板内容（知识点树）在面板展开后延迟 100ms 淡入

**修改文件**: `src/components/UI/ExamDrawer.tsx`
- 已有 `transition-transform duration-300`，确认正常工作
- 添加遮罩层淡入/淡出动画

**修改文件**: 三个 Page 文件
- 右侧面板展开/收起添加平滑过渡
- 移动端抽屉确认使用 `translate-x` 过渡

#### A3. 3D场景加载过渡

**修改文件**: `src/components/Scene/LoadingFallback.tsx`
- 当前仅为 `<div>Loading...</div>` 文本
- 替换为带动画的加载指示器：旋转的地球图标 + 进度条 + "正在加载3D场景..."
- 使用 Canvas 2D 绘制简单的加载动画（避免依赖 Three.js）

**修改文件**: 三个 Page 文件中的 `<Suspense fallback={...}>`
- 统一使用新的 LoadingFallback 组件

---

### 模块 B：新手引导与帮助系统

#### B1. 首次使用引导流程

**新增文件**: `src/components/UI/OnboardingTour.tsx`

**内容**:
- 使用 `localStorage` 记录是否已完成引导（key: `onboarding_completed`）
- 引导步骤（共 5 步）：
  1. **欢迎页**：系统名称 + 简短介绍，居中模态框
  2. **视角选择**：高亮首页三个入口卡片，说明各自用途
  3. **左侧面板**：进入日心视角后，高亮知识面板，说明可以展开知识点
  4. **右侧面板**：高亮右侧控制面板，说明可以调节时间和叠加层
  5. **3D场景**：说明鼠标拖拽旋转、滚轮缩放、右键平移
- 每步都有"下一步"和"跳过"按钮
- 高亮使用半透明遮罩 + 白色边框脉冲动画
- 引导文字使用白色气泡卡片，带箭头指向目标元素

**修改文件**: `src/pages/IndexPage.tsx`
- 页面加载后检查 `onboarding_completed`，未完成则启动引导

#### B2. 上下文工具提示

**新增文件**: `src/components/UI/ContextTooltip.tsx`

**内容**:
- 通用 Tooltip 组件，支持 `content`、`position`（top/bottom/left/right）、`delay` 属性
- 悬停 500ms 后显示，带淡入动画
- 样式：深色半透明背景 + 白色文字 + 小三角箭头
- 使用 `React.cloneElement` 包装子元素，自动绑定 `onMouseEnter/onMouseLeave`

**修改范围**: 在以下位置添加 Tooltip：
- 所有叠加层按钮（说明该叠加层的教学意义）
- 播放控制按钮（播放/暂停/加速/减速）
- 视图预设按钮（自由/俯视/侧视/北极/赤道）
- 二分二至按钮（跳转到对应日期）
- 经纬度输入框（输入格式说明）
- 顶部导航按钮（返回首页、重置、题库）

#### B3. 帮助对话框增强

**修改文件**: `src/components/UI/HelpDialog.tsx`

**内容**:
- 添加 GIF/视频演示（或静态图示）展示关键操作
- 添加键盘快捷键速查表
- 添加"常见问题"折叠区
- 添加"联系反馈"入口
- 使用 Tab 切换：操作指南 / 快捷键 / 常见问题

---

### 模块 C：视觉反馈与微交互

#### C1. 3D天体悬停高亮

**修改文件**: `src/components/Scene/Sun.tsx`、`Earth.tsx`、`Moon.tsx`

**内容**:
- 使用 Three.js Raycaster 检测鼠标悬停
- 悬停时：
  - 天体边缘发光（outline glow，使用 `EffectComposer` + `OutlinePass` 或简单方案：放大光晕）
  - 鼠标指针变为 `pointer`
  - 显示天体名称浮动标签（已有 CelestialBodyLabel 组件，需确认）
- 点击时：
  - 天体短暂缩放动画（scale 1.0 → 1.05 → 1.0，200ms）
  - 显示信息卡片（已有逻辑，需增强卡片样式）

**修改文件**: `src/components/Scene/CelestialBodyLabel.tsx`
- 增强信息卡片样式：添加淡入动画、圆角边框、半透明玻璃效果
- 卡片内容更丰富：轨道参数、当前数据、教学要点

#### C2. 按钮交互增强

**修改文件**: `src/components/UI/GlassButton.tsx`

**内容**:
- 添加点击涟漪效果（CSS `::after` 伪元素 + `@keyframes ripple`）
- 添加 `active:scale-[0.97]` 按下缩放反馈
- 添加 `transition-all duration-150` 确保平滑过渡
- 禁用状态添加 `opacity-40 cursor-not-allowed`

#### C3. Toast 通知系统

**新增文件**: `src/components/UI/Toast.tsx`

**内容**:
- 全局 Toast 容器，固定在屏幕右上角
- 支持类型：`success`（绿色）、`error`（红色）、`info`（蓝色）、`warning`（黄色）
- 每条 Toast 自动 3 秒后消失，带滑出动画
- 使用 Zustand 管理 Toast 队列（在 store 中新增 `toasts` 数组和 `addToast`/`removeToast` 方法）

**修改文件**: `src/store/useStore.ts`
- 新增 `toasts: Toast[]` 状态
- 新增 `addToast(toast)` 和 `removeToast(id)` 方法

**修改文件**: `src/App.tsx`
- 在根组件中渲染 `<ToastContainer />`

**应用场景**:
- 日期切换成功 → "已切换到 2024年夏至"
- 叠加层切换 → "晨昏线 已开启/已关闭"
- 题库答题 → "回答正确！" / "答案错误，请查看解析"
- 场景重置 → "场景已重置"
- 错误提示 → "3D场景加载失败，请刷新页面"

#### C4. 数值变化动画

**新增文件**: `src/components/UI/AnimatedValue.tsx`

**内容**:
- 数值变化时使用 CSS `transition` 或 `countUp` 动画
- 适用场景：底部信息栏的实时数据（太阳高度角、方位角、昼长等）
- 当数值变化超过阈值时触发短暂的颜色闪烁（如太阳高度角变化时数值闪黄色）

**修改文件**: 三个 Page 文件中底部信息栏的数值显示
- 将静态 `<span>` 替换为 `<AnimatedValue>` 组件

---

### 模块 D：键盘快捷键系统

#### D1. 全局快捷键注册

**新增文件**: `src/hooks/useKeyboardShortcuts.ts`

**内容**:
- 使用 `useEffect` 监听全局 `keydown` 事件
- 快捷键映射表：

| 快捷键 | 功能 | 说明 |
|--------|------|------|
| `Space` | 播放/暂停 | 切换时间自动播放 |
| `←` / `→` | 日期 -1天 / +1天 | 快速切换日期 |
| `↑` / `↓` | 时间 +1h / -1h | 快速调节时刻 |
| `Shift+←` / `Shift+→` | 日期 -7天 / +7天 | 周级别切换 |
| `1` | 切换到日心视角 | 导航到 /heliocentric |
| `2` | 切换到地心视角 | 导航到 /geocentric |
| `3` | 切换到地表视角 | 导航到 /surface |
| `R` | 重置场景 | 回到默认状态 |
| `E` | 打开/关闭题库 | 切换 ExamDrawer |
| `K` | 打开/关闭知识面板 | 切换 KnowledgePanel |
| `?` | 打开帮助对话框 | 显示快捷键速查表 |
| `Esc` | 关闭所有面板 | 关闭抽屉、面板 |

- 在 ExamDrawer 打开时，部分快捷键（如 `E`）不触发，避免冲突
- 在输入框聚焦时，所有快捷键暂停

**修改文件**: 三个 Page 文件
- 在每个页面组件中调用 `useKeyboardShortcuts()`

#### D2. 快捷键提示面板

**新增文件**: `src/components/UI/ShortcutOverlay.tsx`

**内容**:
- 按 `?` 键时显示半透明遮罩 + 快捷键速查表
- 按组分类：导航 / 时间控制 / 面板 / 叠加层
- 每个快捷键显示键位图标（用 `<kbd>` 标签样式）
- 按 `Esc` 或点击遮罩关闭

**修改文件**: `src/components/UI/HelpDialog.tsx`
- 在"快捷键"Tab 中嵌入 ShortcutOverlay 内容

---

### 模块 E：用户偏好持久化

#### E1. localStorage 偏好存储

**新增文件**: `src/utils/preferences.ts`

**内容**:
- `savePreferences(prefs)` — 保存用户偏好到 localStorage
- `loadPreferences()` — 从 localStorage 加载偏好
- `clearPreferences()` — 清除所有偏好

**偏好字段**:
```typescript
interface UserPreferences {
  lastView: 'heliocentric' | 'geocentric' | 'surface'; // 上次使用的视角
  lastDate: string;          // 最后设置的日期（ISO字符串）
  lastLatitude: number;      // 最后设置的纬度
  lastLongitude: number;     // 最后设置的经度
  knowledgePanelOpen: boolean; // 知识面板是否展开
  timeSpeed: number;         // 时间流速
  completedOnboarding: boolean; // 是否完成引导
  theme: 'dark';             // 主题（预留）
}
```

**修改文件**: `src/store/useStore.ts`
- 在 `create` 的初始化中调用 `loadPreferences()` 恢复状态
- 使用 Zustand 的 `subscribe` 在状态变化时自动保存（debounce 500ms）

**修改文件**: `src/pages/IndexPage.tsx`
- 如果存在 `lastView` 偏好，在首页显示"继续上次实验"快捷入口

#### E2. "继续上次实验"入口

**修改文件**: `src/pages/IndexPage.tsx`

**内容**:
- 在三个视角卡片上方添加一个横幅卡片
- 显示上次使用的视角、日期等信息
- 点击直接跳转到上次的视角页面
- 使用 `Clock` 图标 + "继续上次实验" 文字
- 如果无历史记录则不显示

---

### 模块 F：全局搜索与导航

#### F1. 全局搜索功能

**新增文件**: `src/components/UI/GlobalSearch.tsx`

**内容**:
- 快捷键 `Ctrl+K` / `Cmd+K` 触发（类似 Spotlight）
- 搜索范围：
  - 知识点（knowledgePoints 中的名称和描述）
  - 题目（questions 的标题和分类）
  - 预设场景（二分二至、近日点、远日点）
  - 城市预设（北京、纽约、伦敦、东京等）
  - 功能操作（"打开晨昏线"、"显示经纬网"等）
- 搜索结果分组显示，每项有图标和描述
- 选择知识点 → 跳转到对应视角并激活该知识点
- 选择题目 → 打开题库抽屉并定位到该题
- 选择预设 → 设置场景到对应状态
- 使用 `fuse.js` 实现模糊搜索（npm 包，轻量级）

**修改文件**: `src/App.tsx` 或根布局
- 在全局渲染 `<GlobalSearch />`，监听 `Ctrl+K` 快捷键

**新增依赖**: `fuse.js`（约 10KB gzipped）

#### F2. 面包屑导航

**修改文件**: 三个 Page 文件中的顶部栏

**内容**:
- 在标题左侧添加面包屑：`首页 > 日心视角`
- 面包屑可点击返回上一级
- 样式：小号文字 + 分隔符 `/`，与标题风格协调
- 当前页面使用高亮色

---

### 模块 G：性能与质量设置

#### G1. 性能监测与 FPS 显示

**新增文件**: `src/components/UI/PerformanceMonitor.tsx`

**内容**:
- 开发模式下显示 FPS 计数器（右上角小标签）
- 使用 `requestAnimationFrame` 计算实时 FPS
- 颜色编码：绿色（≥55fps）、黄色（30-55fps）、红色（<30fps）
- 生产模式默认隐藏，可通过 URL 参数 `?debug=1` 开启

**修改文件**: 三个 Page 文件
- 在 3D 场景容器旁添加 `<PerformanceMonitor />`

#### G2. 画质设置

**新增文件**: `src/components/UI/QualitySettings.tsx`

**内容**:
- 在设置面板中新增"画质"选项
- 三档：高（默认）/ 中 / 低
- 各级别影响：
  | 设置 | 高 | 中 | 低 |
  |------|-----|-----|-----|
  | 星空粒子数 | 2000 | 1000 | 500 |
  | 阴影 | 开启 | 关闭 | 关闭 |
  | 抗锯齿 | 4x | 2x | 关闭 |
  | 大气层效果 | 完整 | 简化 | 关闭 |
  | 光晕 | 完整 | 单层 | 关闭 |
  | 纹理分辨率 | 2048 | 1024 | 512 |
- 设置保存到 localStorage 偏好中
- 首次加载时自动检测设备性能（使用 `navigator.hardwareConcurrency` 和屏幕分辨率推断）

**修改文件**: `src/store/useStore.ts`
- 新增 `quality: 'high' | 'medium' | 'low'` 状态
- 新增 `setQuality(quality)` 方法

**修改文件**: 各 Scene 组件
- 根据 `quality` 状态调整粒子数、阴影等参数

#### G3. 纹理加载进度

**修改文件**: `src/components/Scene/Earth.tsx`

**内容**:
- 使用 `useTexture` 的进度回调（或 `TextureLoader` 的 `onProgress` 事件）
- 在加载大型纹理（地球贴图）时显示进度百分比
- 通过 Zustand store 的 `textureProgress` 状态传递给 LoadingFallback 组件

**修改文件**: `src/store/useStore.ts`
- 新增 `textureProgress: number` 状态（0-1）

---

### 模块 H：3D 场景交互增强

#### H1. 天体信息卡片增强

**修改文件**: `src/components/Scene/CelestialBodyLabel.tsx`

**内容**:
- 卡片样式升级：毛玻璃背景 + 渐变边框 + 光晕阴影
- 太阳卡片：显示半径、表面温度、与地球距离
- 地球卡片：显示当前直射点、自转周期、公转速度
- 月球卡片：显示月相、与地球距离、公转周期
- 卡片出现时带缩放 + 淡入动画
- 卡片含"聚焦"按钮，点击后相机平滑移动到该天体

#### H2. 相机平滑过渡

**新增文件**: `src/hooks/useCameraTransition.ts`

**内容**:
- 封装相机动画逻辑
- 使用 `useFrame` 在每帧插值相机位置和目标点
- 使用 `THREE.MathUtils.lerp` 或自定义缓动函数
- 支持配置过渡时长（默认 800ms）
- 应用场景：视角预设切换、点击天体聚焦、知识面板切换场景

**修改文件**: 各 Scene 组件
- 将视角预设切换从直接设置相机位置改为使用 `useCameraTransition`

#### H3. 3D场景操作提示环

**修改文件**: 各 Scene 组件

**内容**:
- 在场景初始化后，显示 3 秒的操作提示环（半透明环形指示器）
- 提示环显示鼠标拖拽方向（旋转）、滚轮方向（缩放）
- 3 秒后淡出消失
- 仅在首次加载场景时显示（通过 localStorage 记录）

---

### 模块 I：移动端体验优化

#### I1. 触摸手势优化

**修改文件**: 各 Scene 组件中的 OrbitControls 配置

**内容**:
- 双指捏合缩放灵敏度调整（当前默认值可能过快）
- 双指旋转时禁用单指误触
- 添加双击重置视角手势
- 长按天体显示信息卡片（移动端无 hover）

#### I2. 移动端布局微调

**修改文件**: `src/components/UI/MobileNavBar.tsx`

**内容**:
- 底部导航栏增加"当前日期"显示（精简版）
- 导航栏按钮增加触觉反馈区域（minHeight: 44px 符合 iOS 指南）
- 底部安全区域适配（`env(safe-area-inset-bottom)`）

---

## 三、实施优先级与阶段

### 第一阶段：核心体验提升（优先级最高）

1. **A1 视图切换过渡动画** — 解决最明显的体验问题
2. **A3 3D场景加载过渡** — 消除"白屏等待"焦虑
3. **C1 3D天体悬停高亮** — 核心交互缺失
4. **C2 按钮交互增强** — 全局按钮反馈
5. **C3 Toast 通知系统** — 全局操作反馈
6. **D1 全局快捷键** — 教师演示必备

### 第二阶段：引导与辅助

7. **B1 首次使用引导流程** — 降低学习门槛
8. **B2 上下文工具提示** — 提升可发现性
9. **E1 用户偏好持久化** — 连续性体验
10. **E2 "继续上次实验"入口** — 快速恢复

### 第三阶段：高级功能

11. **F1 全局搜索** — 快速定位
12. **A2 面板滑入/滑出动画** — 视觉润色
13. **H2 相机平滑过渡** — 3D体验提升
14. **G1 性能监测** — 开发调试
15. **G2 画质设置** — 低端设备适配

### 第四阶段：深度优化

16. **H1 天体信息卡片增强** — 教学深度
17. **B3 帮助对话框增强** — 完善帮助
18. **C4 数值变化动画** — 数据可视化
19. **I1 触摸手势优化** — 移动端体验
20. **F2 面包屑导航** — 导航完善
21. **G3 纹理加载进度** — 加载体验
22. **H3 操作提示环** — 操作引导
23. **D2 快捷键提示面板** — 可发现性
24. **I2 移动端布局微调** — 移动端完善

---

## 四、文件变更清单

| 操作 | 文件 | 说明 |
|------|------|------|
| **新增** | `src/components/UI/PageTransition.tsx` | 页面过渡动画组件 |
| **新增** | `src/components/UI/OnboardingTour.tsx` | 首次使用引导流程 |
| **新增** | `src/components/UI/ContextTooltip.tsx` | 通用上下文工具提示 |
| **新增** | `src/components/UI/Toast.tsx` | Toast 通知系统 |
| **新增** | `src/components/UI/AnimatedValue.tsx` | 数值变化动画组件 |
| **新增** | `src/components/UI/ShortcutOverlay.tsx` | 快捷键速查面板 |
| **新增** | `src/components/UI/GlobalSearch.tsx` | 全局搜索组件 |
| **新增** | `src/components/UI/PerformanceMonitor.tsx` | FPS 性能监测 |
| **新增** | `src/components/UI/QualitySettings.tsx` | 画质设置面板 |
| **新增** | `src/hooks/useKeyboardShortcuts.ts` | 键盘快捷键 Hook |
| **新增** | `src/hooks/useCameraTransition.ts` | 相机平滑过渡 Hook |
| **新增** | `src/utils/preferences.ts` | 用户偏好持久化工具 |
| **修改** | `src/App.tsx` | 集成 PageTransition、Toast、GlobalSearch |
| **修改** | `src/index.css` | 新增动画 keyframes、kbd 样式 |
| **修改** | `src/store/useStore.ts` | 新增 toasts、quality、textureProgress 状态；偏好持久化 |
| **修改** | `src/components/UI/GlassButton.tsx` | 涟漪效果、按下缩放、过渡动画 |
| **修改** | `src/components/UI/HelpDialog.tsx` | Tab 切换、快捷键速查表、FAQ |
| **修改** | `src/components/UI/KnowledgePanel.tsx` | 平滑展开/收起动画 |
| **修改** | `src/components/Scene/LoadingFallback.tsx` | 动画加载指示器 |
| **修改** | `src/components/Scene/Sun.tsx` | 悬停高亮、点击动画 |
| **修改** | `src/components/Scene/Earth.tsx` | 悬停高亮、点击动画、纹理加载进度 |
| **修改** | `src/components/Scene/Moon.tsx` | 悬停高亮、点击动画 |
| **修改** | `src/components/Scene/CelestialBodyLabel.tsx` | 信息卡片样式增强 |
| **修改** | `src/pages/IndexPage.tsx` | 新手引导触发、继续上次实验入口 |
| **修改** | `src/pages/HeliocentricPage.tsx` | 快捷键、面包屑、偏好恢复 |
| **修改** | `src/pages/GeocentricPage.tsx` | 快捷键、面包屑、偏好恢复 |
| **修改** | `src/pages/SurfacePage.tsx` | 快捷键、面包屑、偏好恢复 |
| **修改** | `src/components/UI/MobileNavBar.tsx` | 日期显示、触觉反馈优化 |

---

## 五、假设与决策

1. **动画库选择**：不引入 `framer-motion`，使用纯 CSS 过渡 + `@keyframes` 减少依赖体积。Three.js 的相机动画使用自定义 `useFrame` 插值。

2. **搜索库选择**：引入 `fuse.js`（~10KB gzipped）实现模糊搜索，比手写搜索逻辑更健壮。

3. **状态持久化策略**：使用 Zustand 的 `subscribe` + `debounce` 自动保存，避免每次状态变化都写 localStorage。debounce 延迟 500ms。

4. **新手引导**：使用自建引导组件（高亮遮罩 + 气泡卡片），不引入第三方引导库（如 `react-joyride`），保持项目轻量。

5. **Toast 通知**：使用 Zustand 管理队列，不引入第三方 Toast 库。每个 Toast 默认 3 秒自动消失。

6. **快捷键设计**：使用单键快捷键（非组合键），在教学场景中更易操作。在输入框聚焦时自动禁用快捷键。

7. **画质设置**：默认"高"，首次加载时根据设备性能自动降级。使用 `navigator.hardwareConcurrency`（CPU 核心数）和屏幕像素比推断。

8. **移动端优先级**：移动端优化作为第四阶段，因为 PRD 明确"桌面端优先，移动端暂不作为主要目标"。

9. **向后兼容**：所有新增状态字段均有默认值，不影响现有功能。新增的组件均通过条件渲染集成。

10. **不引入新的大型依赖**：仅新增 `fuse.js` 一个轻量依赖，保持项目体积可控。

---

## 六、验证步骤

1. **TypeScript 编译**: `npx tsc --noEmit` 确保 0 错误
2. **Vite 构建**: `npm run build` 确保构建成功，检查 bundle 大小增量
3. **逐页功能测试**:
   - 首页：新手引导是否正常触发和完成；继续上次实验入口是否显示
   - 日心视角：页面过渡动画是否流畅；快捷键是否生效；悬停太阳是否高亮
   - 地心视角：Toast 通知是否正常弹出；工具提示是否显示；偏好是否保存
   - 地表视角：画质设置是否生效；FPS 监测是否正常
4. **全局搜索测试**: `Ctrl+K` 触发搜索，搜索知识点/题目/预设是否正常
5. **持久化测试**: 设置偏好后刷新页面，确认状态恢复
6. **控制台检查**: 无 JavaScript Error（忽略预加载脚本和 DevTools 的无关错误）
7. **性能测试**: 在 Chrome DevTools Performance 面板中录制操作，确认帧率稳定