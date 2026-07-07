import type { Question } from '@/types';

export const earthRotationQuestions: Question[] = [
  // ========== 选择题（6题）==========

  {
    id: 'er-001',
    category: '地球自转与昼夜',
    type: 'choice',
    difficulty: 'easy',
    source: '2023全国卷I改编',
    title: '从北极上空俯视，地球的自转方向是（  ）',
    options: [
      'A. 顺时针方向',
      'B. 逆时针方向',
      'C. 自东向西',
      'D. 自南向北',
    ],
    answer: 1,
    explanation:
      '地球自转方向为自西向东。从北极上空俯视，地球呈逆时针方向旋转；从南极上空俯视，则呈顺时针方向旋转。',
    sceneConfig: {
      cameraPreset: 'northPole',
      showGridLines: true,
      focusEarth: true,
    },
    keyPoints: ['自转方向', '北极俯视'],
  },
  {
    id: 'er-002',
    category: '地球自转与昼夜',
    type: 'choice',
    difficulty: 'easy',
    source: '2022全国卷改编',
    title: '地球上昼夜交替的周期是（  ）',
    options: [
      'A. 一个恒星日（约23时56分4秒）',
      'B. 一个太阳日（24小时）',
      'C. 一个恒星年',
      'D. 一个回归年',
    ],
    answer: 1,
    explanation:
      '昼夜交替的周期是一个太阳日，即24小时。恒星日是地球自转360°的周期（约23时56分4秒），而太阳日是太阳连续两次经过同一子午线的时间间隔，也是昼夜交替的实际周期。',
    sceneConfig: {
      cameraPreset: 'side',
      showTerminator: true,
      showSunRay: true,
      focusEarth: true,
    },
    keyPoints: ['自转周期', '太阳日', '恒星日'],
  },
  {
    id: 'er-003',
    category: '地球自转与昼夜',
    type: 'choice',
    difficulty: 'easy',
    source: '2024北京卷改编',
    title: '关于地球自转角速度的叙述，正确的是（  ）',
    options: [
      'A. 赤道最大，向两极递减',
      'B. 南北纬60°约为赤道的一半',
      'C. 除南北两极点外，各地角速度相同，约为15°/小时',
      'D. 角速度随海拔升高而增大',
    ],
    answer: 2,
    explanation:
      '地球自转角速度除南北两极点为零外，其余各地均相等，约为15°/小时（360°/24h）。线速度从赤道向两极递减，南北纬60°约为赤道的一半。海拔升高不影响自转角速度。',
    sceneConfig: {
      cameraPreset: 'top',
      showGridLines: true,
      focusEarth: true,
    },
    keyPoints: ['角速度', '15°/小时'],
  },
  {
    id: 'er-004',
    category: '地球自转与昼夜',
    type: 'choice',
    difficulty: 'medium',
    source: '2024全国卷II改编',
    title: '不考虑地形因素，以下四个城市中地球自转线速度最大的是（  ）',
    options: [
      'A. 北京（约40°N）',
      'B. 上海（约31°N）',
      'C. 海口（约20°N）',
      'D. 新加坡（约1°N）',
    ],
    answer: 3,
    explanation:
      '地球自转线速度公式为 v = 1670 × cosφ（km/h），φ为纬度。纬度越低，cosφ越大，线速度越大。新加坡纬度最低（约1°N），线速度接近赤道最大值约1670 km/h。',
    sceneConfig: {
      cameraPreset: 'equator',
      showGridLines: true,
      focusEarth: true,
    },
    keyPoints: ['线速度', '纬度'],
  },
  {
    id: 'er-005',
    category: '地球自转与昼夜',
    type: 'choice',
    difficulty: 'hard',
    source: '2024山东卷改编',
    title: '关于晨昏线（圈）的叙述，正确的是（  ）',
    options: [
      'A. 晨昏线始终与经线重合',
      'B. 晨昏线只有在春分日和秋分日才与经线重合',
      'C. 夏至日晨昏线与赤道垂直',
      'D. 晨昏线始终平分所有纬线',
    ],
    answer: 1,
    explanation:
      '晨昏线只有在春分日和秋分日（太阳直射赤道）时才与经线重合。其他时间晨昏线与经线有夹角，该夹角等于太阳直射点的纬度。夏至日晨昏线与极圈相切，而非与赤道垂直。晨昏线始终平分赤道，但不一定平分其他纬线。',
    sceneConfig: {
      date: '2024-06-21',
      cameraPreset: 'side',
      showTerminator: true,
      showGridLines: true,
      focusEarth: true,
    },
    keyPoints: ['晨昏线', '经线', '二分二至'],
  },
  {
    id: 'er-006',
    category: '地球自转与昼夜',
    type: 'choice',
    difficulty: 'hard',
    source: '2023浙江卷改编',
    title: '晨线与赤道交点的地方时为（  ）',
    options: [
      'A. 0时',
      'B. 6时',
      'C. 12时',
      'D. 18时',
    ],
    answer: 1,
    explanation:
      '晨线是黑夜进入白昼的分界线，晨线与赤道交点处恰好日出，此时太阳位于地平线上，地方时为6:00。昏线与赤道交点处恰好日落，地方时为18:00。这是解决时间计算问题的重要突破口。',
    sceneConfig: {
      cameraPreset: 'side',
      showTerminator: true,
      showSunRay: true,
      focusEarth: true,
    },
    keyPoints: ['晨线', '赤道', '6时'],
  },

  // ========== 填空题（3题）==========

  {
    id: 'er-007',
    category: '地球自转与昼夜',
    type: 'fill-blank',
    difficulty: 'easy',
    source: '2022全国卷改编',
    title: '地球自转一周（相对于恒星）所需的时间称为一个恒星日，其时长约为______。',
    answer: '23时56分4秒|23小时56分4秒|23h56min4s',
    explanation:
      '恒星日是地球自转360°的周期，约为23时56分4秒。太阳日是太阳连续两次经过同一子午线的时间间隔（24小时），比恒星日长约3分56秒，这是因为地球在自转的同时也在绕太阳公转。',
    keyPoints: ['恒星日', '自转周期'],
  },
  {
    id: 'er-008',
    category: '地球自转与昼夜',
    type: 'fill-blank',
    difficulty: 'medium',
    source: '2023全国卷I改编',
    title: '地球自转线速度随纬度变化，若赤道处线速度约为1670 km/h，则北纬60°处的线速度约为______ km/h。',
    answer: '835|837',
    explanation:
      '线速度公式：v = 1670 × cosφ。cos60° = 0.5，因此北纬60°处的线速度约为 1670 × 0.5 = 835 km/h。这体现了线速度从赤道向两极递减的规律。',
    keyPoints: ['线速度', 'cosφ', '纬度60°'],
  },
  {
    id: 'er-009',
    category: '地球自转与昼夜',
    type: 'fill-blank',
    difficulty: 'medium',
    source: '2024全国卷II改编',
    title: '某日晨昏线与北极圈（66°34′N）相切，且北极圈内出现极昼现象，此时太阳直射的纬线是______。',
    answer: '北回归线|23°26′N|23.5°N',
    explanation:
      '晨昏线与北极圈相切且北极圈内为极昼，说明太阳直射北回归线（23°26′N），此时为北半球夏至日前后。此时北极圈及其以北地区出现极昼，南极圈及其以南地区出现极夜。',
    keyPoints: ['晨昏线', '极圈相切', '直射点'],
  },

  // ========== 简答题（2题）==========

  {
    id: 'er-010',
    category: '地球自转与昼夜',
    type: 'short-answer',
    difficulty: 'medium',
    source: '2021全国卷改编',
    title: '简述地球上昼夜交替现象产生的原因。',
    answer:
      '地球是一个不透明、不发光的球体；在同一时刻，太阳只能照亮地球的一半，向着太阳的半球为白昼，背着太阳的半球为黑夜。由于地球不停地自转，使得昼夜不断交替，周期为24小时（一个太阳日）。',
    explanation:
      '昼夜交替需要两个条件：一是地球本身不透明不发光（产生昼夜现象），二是地球自转（使昼夜交替）。如果地球不自转只公转，昼夜交替周期将变为一年。',
    keyPoints: ['昼夜交替', '自转', '不透明'],
  },
  {
    id: 'er-011',
    category: '地球自转与昼夜',
    type: 'short-answer',
    difficulty: 'hard',
    source: '2023山东卷改编',
    title: '恒星日与太阳日时长不同，请解释其原因。',
    answer:
      '恒星日是地球自转360°的时间（约23h56min4s），太阳日是太阳连续两次经过同一子午线的时间（24h）。两者相差约3min56s，原因是地球在自转的同时还绕太阳公转。在一个太阳日内，地球在公转轨道上向东移动了约0.986°（约1°），因此需要多自转约0.986°（约3min56s）才能使太阳再次到达同一子午线位置。',
    explanation:
      '核心：地球自转的同时也在公转。太阳日地球需自转约360°59′，而恒星日只需自转360°。多出的59′对应约3分56秒。',
    keyPoints: ['恒星日', '太阳日', '公转影响'],
  },

  // ========== 读图题（2题）==========

  {
    id: 'er-012',
    category: '地球自转与昼夜',
    type: 'diagram',
    difficulty: 'medium',
    source: '2022北京卷改编',
    title: '读地球光照图（侧视图），图中阴影部分表示黑夜。判断图中弧AB是晨线还是昏线，并说明判断理由。',
    answer:
      '弧AB为晨线。判断理由：地球自转方向为自西向东（自左向右），弧AB东侧（右侧）为白昼，西侧（左侧）为黑夜，沿地球自转方向经过弧AB时由黑夜进入白昼，因此为晨线。',
    diagramUrl: '/diagrams/earth-rotation/terminator-side-view.svg',
    explanation:
      '判断晨昏线的关键：沿地球自转方向，由夜半球进入昼半球的界线为晨线，由昼半球进入夜半球的界线为昏线。晨线上各地正在日出，昏线上各地正在日落。',
    keyPoints: ['晨线', '昏线', '自转方向'],
  },
  {
    id: 'er-013',
    category: '地球自转与昼夜',
    type: 'diagram',
    difficulty: 'hard',
    source: '2024浙江卷改编',
    title: '读地球自转线速度随纬度变化示意图，图中A、B、C三点分别位于不同纬度。若A点线速度为1670 km/h，C点线速度为0，请判断A、B、C三点的纬度位置，并说明线速度变化规律。',
    answer:
      'A点位于赤道（0°），线速度最大约1670 km/h；B点位于中纬度地区（如30°-40°N/S），线速度约为赤道的70%-80%；C点位于极点（90°N或90°S），线速度为0。规律：地球自转线速度从赤道向两极递减，赤道最大，极点为零，公式为v=V₀cosφ。角速度除极点外处处相等（15°/h）。',
    diagramUrl: '/diagrams/earth-rotation/linear-velocity.svg',
    explanation:
      '线速度随纬度变化的关键公式：v = 1670 × cosφ。cos0°=1（最大），cos90°=0（最小）。特殊纬度：60°处线速度为赤道的一半（cos60°=0.5），30°处约为赤道的87%。',
    keyPoints: ['线速度', '纬度变化', '赤道', '极点'],
  },
];