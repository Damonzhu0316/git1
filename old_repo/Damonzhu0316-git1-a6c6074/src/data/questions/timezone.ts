import type { Question } from '@/types';

export const timezoneQuestions: Question[] = [
  // ========== 选择题（6题）==========

  {
    id: 'tz-001',
    category: '地方时与时区',
    type: 'choice',
    difficulty: 'easy',
    source: '2022全国卷改编',
    title: '关于地方时的叙述，正确的是（  ）',
    options: [
      'A. 同一纬线上各地地方时相同',
      'B. 同一经线上各地地方时相同',
      'C. 地方时与经度无关',
      'D. 地方时由纬度决定',
    ],
    answer: 1,
    explanation:
      '地方时是因经度不同而不同的时刻。同一经线上的各地，地方时相同；同一纬线上不同经度的地方，地方时不同。经度每差15°，地方时相差1小时。',
    sceneConfig: {
      cameraPreset: 'top',
      showGridLines: true,
      focusEarth: true,
    },
    keyPoints: ['地方时', '经度'],
  },
  {
    id: 'tz-002',
    category: '地方时与时区',
    type: 'choice',
    difficulty: 'easy',
    source: '2021全国卷改编',
    title: '全球共划分为多少个时区？每个时区跨多少经度？（  ）',
    options: [
      'A. 12个时区，每个跨30°',
      'B. 24个时区，每个跨15°',
      'C. 24个时区，每个跨10°',
      'D. 36个时区，每个跨10°',
    ],
    answer: 1,
    explanation:
      '全球共划分为24个时区，每个时区跨15°经度。以本初子午线（0°经线）为中心，向东向西各7.5°为中时区（零时区），然后每隔15°划分为一个时区。东十二区和西十二区各跨7.5°，合为一个时区。',
    sceneConfig: {
      cameraPreset: 'top',
      showGridLines: true,
      focusEarth: true,
    },
    keyPoints: ['时区划分', '24时区', '15°'],
  },
  {
    id: 'tz-003',
    category: '地方时与时区',
    type: 'choice',
    difficulty: 'easy',
    source: '2023全国卷I改编',
    title: '已知北京（116°E）的地方时为12:00，则拉萨（91°E）的地方时约为（  ）',
    options: [
      'A. 10:20',
      'B. 10:40',
      'C. 13:20',
      'D. 13:40',
    ],
    answer: 0,
    explanation:
      '经度差：116°E - 91°E = 25°。经度每差1°，时间差4分钟，25° × 4min = 100min = 1h40min。拉萨在北京以西，地方时更晚，12:00 - 1h40min = 10:20。',
    sceneConfig: {
      cameraPreset: 'top',
      highlightLongitude: 116,
      showGridLines: true,
      focusEarth: true,
    },
    keyPoints: ['地方时计算', '经度差', '4分钟/度'],
  },
  {
    id: 'tz-004',
    category: '地方时与时区',
    type: 'choice',
    difficulty: 'medium',
    source: '2024全国卷II改编',
    title: '当北京时间（东八区）为2024年6月21日12:00时，纽约（西五区）的区时为（  ）',
    options: [
      'A. 6月21日1:00',
      'B. 6月20日23:00',
      'C. 6月21日23:00',
      'D. 6月20日11:00',
    ],
    answer: 1,
    explanation:
      '东八区与西五区相差13个时区（8+5=13小时），纽约在北京以西，区时更晚。12:00 - 13h = 前一天23:00，即6月20日23:00。计算窍门：东加西减，跨时区数=两地时区数之和（一东一西时）。',
    sceneConfig: {
      cameraPreset: 'top',
      highlightLongitude: 120,
      showGridLines: true,
      showLocalTime: true,
      focusEarth: true,
    },
    keyPoints: ['时区换算', '东八区', '西五区'],
  },
  {
    id: 'tz-005',
    category: '地方时与时区',
    type: 'choice',
    difficulty: 'hard',
    source: '2024浙江卷改编',
    title: '一艘轮船于2024年1月1日12:00从东十二区向东越过日界线进入西十二区，此时西十二区的区时为（  ）',
    options: [
      'A. 1月1日12:00',
      'B. 1月2日12:00',
      'C. 12月31日12:00',
      'D. 12月31日0:00',
    ],
    answer: 2,
    explanation:
      '东十二区与西十二区钟点相同，但日期相差一天。从东十二区向东越过日界线（180°经线）进入西十二区，日期减一天。因此1月1日12:00变为12月31日12:00。若从西向东越过日界线，则日期加一天。',
    sceneConfig: {
      cameraPreset: 'top',
      highlightLongitude: 180,
      showGridLines: true,
      focusEarth: true,
    },
    keyPoints: ['日界线', '日期变更', '东十二区', '西十二区'],
  },
  {
    id: 'tz-006',
    category: '地方时与时区',
    type: 'choice',
    difficulty: 'hard',
    source: '2023北京卷改编',
    title: '一架飞机于北京时间7月1日8:00从北京起飞，飞行12小时后到达伦敦（中时区），到达时伦敦的区时为（  ）',
    options: [
      'A. 7月1日12:00',
      'B. 7月1日20:00',
      'C. 7月1日13:00',
      'D. 7月2日4:00',
    ],
    answer: 0,
    explanation:
      '起飞时北京（东八区）为7月1日8:00，此时伦敦（中时区）为7月1日0:00（8:00 - 8h = 0:00）。飞行12小时后，伦敦时间为0:00 + 12h = 7月1日12:00。另一种算法：到达时北京时间为8:00 + 12h = 20:00，换算伦敦时间：20:00 - 8h = 12:00。',
    sceneConfig: {
      cameraPreset: 'top',
      showGridLines: true,
      showLocalTime: true,
      focusEarth: true,
    },
    keyPoints: ['飞行时间', '时区换算', '北京时间'],
  },

  // ========== 填空题（3题）==========

  {
    id: 'tz-007',
    category: '地方时与时区',
    type: 'fill-blank',
    difficulty: 'easy',
    source: '2021全国卷改编',
    title: '经度每相差1°，地方时相差______分钟。',
    answer: '4|四',
    explanation:
      '地球自转一周（360°）耗时24小时，即1440分钟。每度对应的时间为 1440÷360 = 4分钟。因此经度每差1°，地方时相差4分钟；经度每差15°，地方时相差1小时。',
    keyPoints: ['地方时', '经度', '4分钟'],
  },
  {
    id: 'tz-008',
    category: '地方时与时区',
    type: 'fill-blank',
    difficulty: 'medium',
    source: '2023全国卷II改编',
    title: '某地经度为97°E，该地所在的时区是______（填"东/西XX区"格式）。',
    answer: '东六区|东6区',
    explanation:
      '时区号 = 经度 ÷ 15°，四舍五入取整。97 ÷ 15 ≈ 6.47，四舍五入为6，位于东六区（中央经线90°E，范围82.5°E-97.5°E）。注意：97°E刚好小于东七区边界97.5°E，因此属于东六区。',
    keyPoints: ['时区计算', '经度换算'],
  },
  {
    id: 'tz-009',
    category: '地方时与时区',
    type: 'fill-blank',
    difficulty: 'medium',
    source: '2024山东卷改编',
    title: '国际日期变更线大致沿______经线分布，为避免穿过陆地，在俄罗斯楚科奇半岛、阿留申群岛和太平洋岛国等处发生弯曲。',
    answer: '180°|180度',
    explanation:
      '国际日期变更线大致沿180°经线分布，但为避免穿过陆地，在三个地方发生弯曲：绕过俄罗斯楚科奇半岛向东凸出，绕过阿留申群岛向西凸出，以及绕过基里巴斯和斐济等太平洋岛国向东大幅凸出。',
    keyPoints: ['日界线', '180°', '弯曲'],
  },

  // ========== 简答题（2题）==========

  {
    id: 'tz-010',
    category: '地方时与时区',
    type: 'short-answer',
    difficulty: 'medium',
    source: '2022全国卷改编',
    title: '简述地方时与区时的区别与联系。',
    answer:
      '区别：地方时是因经度不同而不同的时刻，同一经线上的各地地方时相同；区时是各时区中央经线的地方时，同一时区内各地使用相同的区时。联系：区时本质上就是该时区中央经线的地方时，例如北京时间（东八区区时）就是120°E经线的地方时。',
    explanation:
      '理解要点：地方时是"天然的"（由太阳位置决定），区时是"人为规定的"（为方便统一管理）。我国虽然跨东五区至东九区共五个时区，但全国统一使用东八区区时（北京时间）。',
    keyPoints: ['地方时', '区时', '中央经线'],
  },
  {
    id: 'tz-011',
    category: '地方时与时区',
    type: 'short-answer',
    difficulty: 'hard',
    source: '2023浙江卷改编',
    title: '国际日期变更线（日界线）为什么不完全沿180°经线分布？请说明弯曲原因和日期变更规则。',
    answer:
      '日界线不完全沿180°经线分布，原因是为了避免穿过陆地国家，造成同一国家内出现两个日期的不便。具体弯曲处：向东北绕过俄罗斯楚科奇半岛，向西绕过阿留申群岛，向东南绕过基里巴斯等太平洋岛国。日期变更规则：自东十二区向东越过日界线进入西十二区，日期减一天；自西十二区向西越过日界线进入东十二区，日期加一天。',
    explanation:
      '日界线是一条人为规定的界线，其弯曲体现了地理学中"以人为本"的原则。值得注意的是，日界线并非唯一决定日期变更的界线，自然界还存在一条0时经线（子夜线），两者共同将全球分为两个日期。',
    keyPoints: ['日界线', '弯曲原因', '日期变更'],
  },

  // ========== 读图题（2题）==========

  {
    id: 'tz-012',
    category: '地方时与时区',
    type: 'diagram',
    difficulty: 'medium',
    source: '2022北京卷改编',
    title: '读世界时区分布图（局部），图中标注了A（120°E）、B（0°）、C（75°W）三地的经度位置。请分别写出三地所在的时区名称，并计算当A地为12:00时，B、C两地的区时。',
    answer:
      'A地（120°E）位于东八区；B地（0°）位于中时区（零时区）；C地（75°W）位于西五区。当A地（东八区）为12:00时，B地（中时区）区时为12:00 - 8h = 4:00；C地（西五区）区时为12:00 - 13h = 前一天23:00。',
    diagramUrl: '/diagrams/timezone/world-timezone-map.svg',
    explanation:
      '时区计算基本方法：中央经线 = 时区号 × 15°。东时区为正，西时区为负。两地时区差 = 时区号之差（同在东或同在西时相减，一东一西时相加）。',
    keyPoints: ['时区分布', '区时计算', '中央经线'],
  },
  {
    id: 'tz-013',
    category: '地方时与时区',
    type: 'diagram',
    difficulty: 'hard',
    source: '2024全国卷I改编',
    title: '读某航班飞行路线图，该航班从上海（东八区，约121°E）起飞，经11小时飞行后抵达洛杉矶（西八区，约118°W）。若起飞时上海当地时间为7月2日17:00，请计算到达时洛杉矶的当地时间。',
    answer:
      '起飞时上海时间7月2日17:00（东八区），对应洛杉矶时间（西八区）：17:00 - 16h = 7月2日1:00。飞行11小时后，洛杉矶当地时间 = 7月2日1:00 + 11h = 7月2日12:00。注意：东八区与西八区相差16个时区。',
    diagramUrl: '/diagrams/timezone/flight-route.svg',
    explanation:
      '飞行时间计算的一般步骤：（1）将起飞时间统一换算为目的地时间；（2）目的地时间 + 飞行时长 = 到达时目的地当地时间。特别注意：若跨越日界线，需相应加减一天。',
    keyPoints: ['飞行时间', '跨时区计算', '到达时间'],
  },
];