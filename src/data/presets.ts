import { getEquinoxSolsticeDates } from '@/utils/astronomy';

/** 动态获取指定年份的二分二至日期 */
export function getSolarTerms(year: number) {
  const dates = getEquinoxSolsticeDates(year);
  return [
    { label: '春分', date: formatDateStr(dates.spring) },
    { label: '夏至', date: formatDateStr(dates.summer) },
    { label: '秋分', date: formatDateStr(dates.autumn) },
    { label: '冬至', date: formatDateStr(dates.winter) },
  ];
}

/** Date → 'YYYY-MM-DD' */
function formatDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const LAT_PRESETS = [
  { label: '北京40°N', lat: 40 },
  { label: '赤道0°', lat: 0 },
  { label: '北极圈66.5°N', lat: 66.5 },
  { label: '北回归线23.5°N', lat: 23.5 },
  { label: '南回归线23.5°S', lat: -23.5 },
  { label: '南极圈66.5°S', lat: -66.5 },
];

export const LON_PRESETS = [
  { label: '北京116°E', lon: 116 },
  { label: '本初子午线0°', lon: 0 },
  { label: '纽约74°W', lon: -74 },
  { label: '东京140°E', lon: 140 },
];

/** 定格视角预设 —— 考试常见对比场景 */
export interface SnapshotPreset {
  id: string;
  label: string;
  category: string;
  date: string;       // 'YYYY-MM-DD'
  time: string;       // 'HH:mm'
  lat: number;
  lon: number;
  description: string;
}

/** 动态生成指定年份的定格视角预设 */
export function getSnapshotPresets(year: number): SnapshotPreset[] {
  const eq = getEquinoxSolsticeDates(year);
  const spring = formatDateStr(eq.spring);
  const summer = formatDateStr(eq.summer);
  const autumn = formatDateStr(eq.autumn);
  const winter = formatDateStr(eq.winter);

  return [
    // 同一地点，不同季节对比
    { id: 'beijing-summer-noon', label: '北京 夏至正午', category: '季节对比', date: summer, time: '12:00', lat: 40, lon: 116, description: '夏至日北京正午太阳高度最大，约73.5°' },
    { id: 'beijing-winter-noon', label: '北京 冬至正午', category: '季节对比', date: winter, time: '12:00', lat: 40, lon: 116, description: '冬至日北京正午太阳高度最小，约26.5°' },
    { id: 'beijing-spring-noon', label: '北京 春分正午', category: '季节对比', date: spring, time: '12:00', lat: 40, lon: 116, description: '春分日北京正午太阳高度约50°' },
    { id: 'beijing-autumn-noon', label: '北京 秋分正午', category: '季节对比', date: autumn, time: '12:00', lat: 40, lon: 116, description: '秋分日北京正午太阳高度约50°' },
    // 同一时间，不同纬度对比
    { id: 'equator-summer-noon', label: '赤道 夏至正午', category: '纬度对比', date: summer, time: '12:00', lat: 0, lon: 116, description: '夏至日赤道正午太阳高度约66.5°' },
    { id: 'tropic-summer-noon', label: '北回归线 夏至正午', category: '纬度对比', date: summer, time: '12:00', lat: 23.5, lon: 116, description: '夏至日太阳直射北回归线，正午高度角90°' },
    { id: 'arctic-summer-noon', label: '北极圈 夏至正午', category: '纬度对比', date: summer, time: '12:00', lat: 66.5, lon: 116, description: '夏至日北极圈极昼，正午高度约47°' },
    // 同一地点，一天中不同时刻
    { id: 'beijing-summer-6am', label: '北京 夏至 06:00', category: '时刻对比', date: summer, time: '06:00', lat: 40, lon: 116, description: '夏至日出时刻，太阳高度角约0°' },
    { id: 'beijing-summer-12pm', label: '北京 夏至 12:00', category: '时刻对比', date: summer, time: '12:00', lat: 40, lon: 116, description: '正午太阳高度角最大，约73.5°' },
    { id: 'beijing-summer-6pm', label: '北京 夏至 18:00', category: '时刻对比', date: summer, time: '18:00', lat: 40, lon: 116, description: '夏至日落时刻，太阳高度角约0°' },
    // 极昼极夜对比
    { id: 'arctic-summer-midnight', label: '北极圈 夏至 0:00', category: '极昼极夜', date: summer, time: '00:00', lat: 66.5, lon: 0, description: '夏至北极圈极昼，午夜太阳在地平线附近' },
    { id: 'arctic-winter-noon', label: '北极圈 冬至 12:00', category: '极昼极夜', date: winter, time: '12:00', lat: 66.5, lon: 0, description: '冬至北极圈极夜，正午太阳在地平线下' },
  ];
}

export function formatDateDisplay(date: Date) {
  return {
    y: date.getFullYear(),
    m: String(date.getMonth() + 1).padStart(2, '0'),
    d: String(date.getDate()).padStart(2, '0'),
    h: String(date.getHours()).padStart(2, '0'),
    min: String(date.getMinutes()).padStart(2, '0'),
  };
}

export function formatLatLabel(lat: number) {
  return `${Math.abs(lat)}°${lat >= 0 ? 'N' : 'S'}`;
}

export function formatLonLabel(lon: number) {
  return `${Math.abs(lon)}°${lon >= 0 ? 'E' : 'W'}`;
}