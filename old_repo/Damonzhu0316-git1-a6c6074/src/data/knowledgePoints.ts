import type { KnowledgePoint } from '@/types';

export const knowledgePoints: KnowledgePoint[] = [
  /* ========== 日心视角 + 地心视角 ========== */
  {
    id: 'rotation',
    name: '地球的自转',
    icon: 'RotateCw',
    views: ['geocentric'],
    description: '地球绕地轴旋转，周期为1个恒星日（23时56分4秒），产生昼夜交替、时差和地转偏向力',
    children: [
      {
        id: 'rotation-direction',
        name: '自转方向',
        icon: 'ArrowRightLeft',
        views: ['geocentric'],
        description: '地球自西向东自转，从北极上空看呈逆时针方向，从南极上空看呈顺时针方向',
        actions: [
          { id: 'preset-top', label: '北极俯视视角', type: 'preset', key: 'cameraPreset', value: 'northPole' },
          { id: 'preset-equator', label: '赤道侧视视角', type: 'preset', key: 'cameraPreset', value: 'equator' },
        ],
      },
      {
        id: 'day-night',
        name: '昼夜交替',
        icon: 'SunMoon',
        views: ['geocentric'],
        description: '由于地球不发光、不透明，太阳光只能照亮地球的一半，产生昼夜现象；地球自转使昼夜不断交替',
        actions: [
          { id: 'toggle-terminator', label: '显示/隐藏晨昏线', type: 'toggle', key: 'showTerminator', value: true },
          { id: 'toggle-sun-ray', label: '显示太阳光线', type: 'toggle', key: 'showSunRay', value: true },
          { id: 'play-anim', label: '▶ 播放自转动画', type: 'setSpeed', key: 'timeSpeed', value: '5' },
        ],
      },
      {
        id: 'timezone',
        name: '时区与地方时',
        icon: 'Clock',
        views: ['geocentric'],
        description: '经度每隔15°地方时相差1小时，全球共分24个时区，东早西晚',
        actions: [
          { id: 'toggle-grid-lines', label: '显示经纬网', type: 'toggle', key: 'showGridLines', value: true },
          { id: 'toggle-localtime', label: '显示地方时', type: 'toggle', key: 'showLocalTime', value: true },
        ],
      },
      {
        id: 'flight-time',
        name: '飞行时间计算',
        icon: 'Plane',
        views: ['geocentric'],
        description: '跨越时区飞行时，到达时间 = 起飞地方时 + 飞行时长 + 时差。时差 = (目的地经度 − 出发地经度) / 15°',
        actions: [
          { id: 'toggle-flight-time', label: '显示飞行时间演示', type: 'toggle', key: 'showFlightTime', value: true },
          { id: 'toggle-localtime', label: '显示地方时经线', type: 'toggle', key: 'showLocalTime', value: true },
        ],
      },
      {
        id: 'coriolis',
        name: '地转偏向力',
        icon: 'MoveHorizontal',
        views: ['geocentric'],
        description: '由于地球自转，水平运动的物体在北半球向右偏转，南半球向左偏转，赤道上不偏转',
        actions: [
          { id: 'toggle-coriolis', label: '显示/隐藏地转偏向力演示', type: 'toggle', key: 'showCoriolis', value: true },
          { id: 'play-anim', label: '▶ 播放演示', type: 'setSpeed', key: 'timeSpeed', value: '1' },
        ],
      },
    ],
  },
  /* ========== 日心视角 ========== */
  {
    id: 'revolution',
    name: '地球的公转',
    icon: 'Orbit',
    views: ['heliocentric'],
    description: '地球绕太阳公转，周期为1个恒星年（365天6时9分10秒），轨道为近似正圆的椭圆',
    children: [
      {
        id: 'orbit',
        name: '公转轨道',
        icon: 'Circle',
        views: ['heliocentric'],
        description: '地球公转轨道为椭圆形，太阳位于椭圆的一个焦点上。1月初近日点，7月初远日点',
        actions: [
          { id: 'toggle-ecliptic', label: '显示黄道面', type: 'toggle', key: 'showEclipticPlane', value: true },
          { id: 'toggle-orbit', label: '显示轨道标记', type: 'toggle', key: 'showOrbitMarkers', value: true },
          { id: 'play-anim', label: '▶ 播放公转动画', type: 'setSpeed', key: 'timeSpeed', value: '10' },
        ],
      },
      {
        id: 'orbit-speed',
        name: '公转速度',
        icon: 'Gauge',
        views: ['heliocentric'],
        description: '近日点公转速度较快（约30.3 km/s），远日点较慢（约29.3 km/s），开普勒第二定律',
        actions: [
          { id: 'toggle-orbit-speed', label: '显示/隐藏速度指示器', type: 'toggle', key: 'showOrbitSpeed', value: true },
        ],
      },
    ],
  },
  {
    id: 'obliquity',
    name: '黄赤交角',
    icon: 'Triangle',
    views: ['heliocentric'],
    description: '黄道面与赤道面的夹角，目前约23°26′，是太阳直射点回归运动的根本原因',
    children: [
      {
        id: 'obliquity-concept',
        name: '黄赤交角概念',
        icon: 'Axis3d',
        views: ['heliocentric'],
        description: '黄赤交角是地球自转轴与公转轨道面法线之间的夹角，决定回归线和极圈的纬度',
        actions: [
          { id: 'toggle-equator-plane', label: '显示赤道面', type: 'toggle', key: 'showEquatorPlane', value: true },
          { id: 'toggle-ecliptic-plane', label: '显示黄道面', type: 'toggle', key: 'showEclipticPlane', value: true },
          { id: 'toggle-earth-axis', label: '显示地轴', type: 'toggle', key: 'showEarthAxis', value: true },
        ],
      },
      {
        id: 'solar-point',
        name: '太阳直射点运动',
        icon: 'Sun',
        views: ['heliocentric'],
        description: '太阳直射点在南北回归线之间做周期性的往返运动，周期为1个回归年',
        actions: [
          { id: 'toggle-sun-ray', label: '显示太阳光线', type: 'toggle', key: 'showSunRay', value: true },
          { id: 'play-anim', label: '▶ 自动演示回归运动', type: 'setSpeed', key: 'timeSpeed', value: '10' },
        ],
      },
    ],
  },
  /* ========== 地心视角 ========== */
  {
    id: 'day-length',
    name: '昼夜长短变化',
    icon: 'SunMoon',
    views: ['geocentric', 'surface'],
    description: '除赤道外，全球各地昼夜长短随太阳直射点的移动而发生变化',
    children: [
      {
        id: 'day-length-rule',
        name: '昼夜长短规律',
        icon: 'BarChart3',
        views: ['geocentric'],
        description: '太阳直射北半球时，北半球昼长夜短；太阳直射南半球时相反。春分秋分日全球昼夜等长',
        actions: [
          { id: 'date-summer', label: '夏至日（北半球昼最长）', type: 'date', key: 'currentDate', value: '2024-06-21' },
          { id: 'date-winter', label: '冬至日（北半球昼最短）', type: 'date', key: 'currentDate', value: '2024-12-22' },
          { id: 'toggle-night-arc', label: '显示昼弧/夜弧', type: 'toggle', key: 'showDayNightArc', value: true },
        ],
      },
      {
        id: 'polar-day',
        name: '极昼极夜',
        icon: 'SunMoon',
        views: ['geocentric'],
        description: '北半球夏至日北极圈及其以北极昼，南极圈及其以南极夜；冬至日相反',
        actions: [
          { id: 'preset-north', label: '北极俯视', type: 'preset', key: 'cameraPreset', value: 'northPole' },
          { id: 'date-summer', label: '夏至日（北极圈极昼）', type: 'date', key: 'currentDate', value: '2024-06-21' },
        ],
      },
    ],
  },
  {
    id: 'solar-altitude',
    name: '正午太阳高度',
    icon: 'Sun',
    views: ['geocentric', 'surface'],
    description: '太阳光线与地平面的夹角，正午时最大。正午太阳高度从直射点向南北两侧递减',
    children: [
      {
        id: 'solar-altitude-rule',
        name: '变化规律',
        icon: 'TrendingUp',
        views: ['geocentric'],
        description: '同一时刻，正午太阳高度由直射点向南北两侧递减；同一地点，随季节变化',
        actions: [
          { id: 'date-summer', label: '夏至日（北京太阳高度最大）', type: 'date', key: 'currentDate', value: '2024-06-21' },
          { id: 'date-winter', label: '冬至日（北京太阳高度最小）', type: 'date', key: 'currentDate', value: '2024-12-22' },
          { id: 'toggle-solar-alt', label: '显示太阳高度角', type: 'toggle', key: 'showSolarAltitude', value: true },
        ],
      },
      {
        id: 'solar-altitude-app',
        name: '实际应用',
        icon: 'Ruler',
        views: ['surface'],
        description: '楼间距计算、太阳能热水器倾角、日影长短、日晷原理等实际应用',
        actions: [
          { id: 'app-building', label: '楼间距演示', type: 'toggle', key: 'solarAppMode', value: 'buildingShadow' },
          { id: 'app-solar-panel', label: '太阳能板倾角', type: 'toggle', key: 'solarAppMode', value: 'solarPanel' },
          { id: 'app-sundial', label: '日晷原理', type: 'toggle', key: 'solarAppMode', value: 'sundial' },
        ],
      },
    ],
  },
  /* ========== 日心 + 地心 ========== */
  {
    id: 'seasons',
    name: '四季与五带',
    icon: 'Calendar',
    views: ['heliocentric', 'geocentric'],
    description: '天文四季由昼夜长短和正午太阳高度的季节变化决定，五带由纬度位置划分',
    children: [
      {
        id: 'four-seasons',
        name: '四季划分',
        icon: 'CalendarDays',
        views: ['heliocentric'],
        description: '天文四季由昼夜长短和太阳高度的季节变化决定。中国以四立为四季之始',
        actions: [
          { id: 'date-spring', label: '春分', type: 'date', key: 'currentDate', value: '2024-03-20' },
          { id: 'date-summer', label: '夏至', type: 'date', key: 'currentDate', value: '2024-06-21' },
          { id: 'date-autumn', label: '秋分', type: 'date', key: 'currentDate', value: '2024-09-23' },
          { id: 'date-winter', label: '冬至', type: 'date', key: 'currentDate', value: '2024-12-22' },
          { id: 'toggle-season-demo', label: '▶ 自动演示四季交替', type: 'toggle', key: 'showSeasonDemo', value: true },
        ],
      },
      {
        id: 'five-zones',
        name: '五带划分',
        icon: 'Globe',
        views: ['geocentric'],
        description: '根据太阳热量分布，划分为热带、北温带、南温带、北寒带、南寒带',
        actions: [
          { id: 'toggle-five-zones', label: '显示/隐藏五带色带', type: 'toggle', key: 'showFiveZones', value: true },
          { id: 'date-summer', label: '夏至日（直射北回归线）', type: 'date', key: 'currentDate', value: '2024-06-21' },
        ],
      },
    ],
  },
  /* ========== 日心 + 地心 ========== */
  {
    id: 'moon-earth',
    name: '地月系',
    icon: 'Orbit',
    views: ['heliocentric', 'geocentric'],
    description: '月球绕地球公转，产生月相变化、日食月食等天文现象',
    children: [
      {
        id: 'moon-phases',
        name: '月相变化',
        icon: 'SunMoon',
        views: ['geocentric'],
        description: '日地月相对位置变化产生新月、上弦月、满月、下弦月等月相，周期为1个朔望月',
        actions: [
          { id: 'toggle-moon-phases', label: '显示/隐藏月相图', type: 'toggle', key: 'showMoonPhases', value: true },
          { id: 'play-anim', label: '▶ 播放月球公转', type: 'setSpeed', key: 'timeSpeed', value: '2' },
        ],
      },
      {
        id: 'eclipse',
        name: '日食与月食',
        icon: 'Circle',
        views: ['heliocentric'],
        description: '月球运行到日地之间遮住太阳光时发生日食；地球位于日月之间时发生月食',
        actions: [
          { id: 'toggle-eclipse', label: '显示/隐藏日食月食演示', type: 'toggle', key: 'showEclipse', value: true },
          { id: 'play-anim', label: '▶ 播放月球公转', type: 'setSpeed', key: 'timeSpeed', value: '2' },
        ],
      },
    ],
  },
];