import { EARTH_TILT, DAYS_PER_YEAR, ORBIT_ECCENTRICITY, EARTH_ORBIT_RADIUS } from './constants';

/** 获取某年中的第几天 (1-366) */
export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/** 计算太阳赤纬（直射点纬度），单位：度 */
export function getSolarDeclination(date: Date): number {
  const dayOfYear = getDayOfYear(date);
  // 简化公式：δ = -23.44° × cos(360/365 × (N + 10))
  const angleDeg = (360 / DAYS_PER_YEAR) * (dayOfYear + 10);
  const angleRad = (angleDeg * Math.PI) / 180;
  return -EARTH_TILT * Math.cos(angleRad);
}

/** 计算地球在公转轨道上的位置（角度，单位：弧度） */
export function getEarthOrbitAngle(date: Date): number {
  const dayOfYear = getDayOfYear(date);
  // 动态计算近日点在该年的第几天
  const perihelionDOY = getDayOfYear(getPerihelionDate(date.getFullYear()));
  const daysSincePerihelion = (dayOfYear - perihelionDOY + DAYS_PER_YEAR) % DAYS_PER_YEAR;
  return (daysSincePerihelion / DAYS_PER_YEAR) * Math.PI * 2;
}

/** 计算地球在轨道上的3D位置 (太阳在原点，即椭圆焦点处) */
export function getEarthPosition(date: Date): [number, number, number] {
  const angle = getEarthOrbitAngle(date);
  const a = EARTH_ORBIT_RADIUS; // 半长轴
  const b = a * Math.sqrt(1 - ORBIT_ECCENTRICITY * ORBIT_ECCENTRICITY); // 半短轴
  const c = a * ORBIT_ECCENTRICITY; // 焦点到中心距离
  // 椭圆中心在 (-c, 0, 0)，太阳（原点）在右焦点
  const x = a * Math.cos(angle) - c;
  const z = b * Math.sin(angle);
  return [x, 0, z];
}

/** 计算昼长（小时），latitude和declination单位：度 */
export function getDayLength(latitude: number, declination: number): number {
  const latRad = (latitude * Math.PI) / 180;
  const decRad = (declination * Math.PI) / 180;
  const tanLat = Math.tan(latRad);
  const tanDec = Math.tan(decRad);
  const cosHalfDay = -tanLat * tanDec;

  if (cosHalfDay >= 1) return 24; // 极昼
  if (cosHalfDay <= -1) return 0;  // 极夜

  const halfDayRad = Math.acos(cosHalfDay);
  return (halfDayRad / Math.PI) * 24;
}

/** 计算正午太阳高度角（度），latitude和declination单位：度 */
export function getNoonSolarAltitude(latitude: number, declination: number): number {
  return 90 - Math.abs(latitude - declination);
}

/** 计算日出/日落时间（地方时，小时），latitude和declination单位：度 */
export function getSunriseHour(latitude: number, declination: number): number {
  const dayLength = getDayLength(latitude, declination);
  return 12 - dayLength / 2;
}

export function getSunsetHour(latitude: number, declination: number): number {
  const dayLength = getDayLength(latitude, declination);
  return 12 + dayLength / 2;
}

/** 获取太阳直射点所在的半球描述 */
export function getSolarHemisphere(declination: number): string {
  if (declination > 0.1) return '北半球';
  if (declination < -0.1) return '南半球';
  return '赤道附近';
}

/** 获取直射点移动方向 */
export function getDeclinationTrend(date: Date): string {
  const dayOfYear = getDayOfYear(date);
  const angleDeg = (360 / DAYS_PER_YEAR) * (dayOfYear + 10);
  const angleRad = (angleDeg * Math.PI) / 180;
  // 导数：dδ/dN = 23.44° × (360/365) × sin(360/365 × (N+10)) × π/180
  const derivative = EARTH_TILT * (360 / DAYS_PER_YEAR) * Math.sin(angleRad) * (Math.PI / 180);
  if (derivative > 0.01) return '向北移动';
  if (derivative < -0.01) return '向南移动';
  return '折返';
}

/** 格式化太阳赤纬为可读字符串 */
export function formatDeclination(declination: number): string {
  const abs = Math.abs(declination);
  const deg = Math.floor(abs);
  const min = Math.round((abs - deg) * 60);
  const dir = declination >= 0 ? 'N' : 'S';
  return `${deg}°${min}′${dir}`;
}

/** 计算均时差（分钟），正值表示太阳时比平太阳时快 */
export function getEquationOfTime(date: Date): number {
  const dayOfYear = getDayOfYear(date);
  const B = (360 / 365) * (dayOfYear - 81) * (Math.PI / 180);
  return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
}

/** 根据经度计算地方时与标准时区时间差（分钟） */
export function getLocalTimeOffset(lon: number, timezoneOffset: number): number {
  const localSolarNoon = (lon / 15) * 60; // 按经度计算的地方时正午（分钟）
  const standardNoon = timezoneOffset * 60; // 时区标准正午（分钟）
  return localSolarNoon - standardNoon;
}

/** 格式化时间为HH:MM */
export function formatHour(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/** 计算太阳在天空中的位置（高度角、方位角），单位：弧度 */
export function getSunSkyPosition(date: Date, lat: number, lon: number): { altitude: number; azimuth: number } {
  const decl = (getSolarDeclination(date) * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;
  const localHour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  const lonOffset = (lon - 116) / 15;
  const trueLocalHour = localHour + lonOffset;
  const hourAngle = (trueLocalHour - 12) * 15 * (Math.PI / 180);

  const sinAlt = Math.sin(latRad) * Math.sin(decl) + Math.cos(latRad) * Math.cos(decl) * Math.cos(hourAngle);
  const altitude = Math.asin(Math.max(-1, Math.min(1, sinAlt)));

  const sinAz = -Math.cos(decl) * Math.sin(hourAngle) / Math.cos(altitude);
  const cosAz = (Math.sin(decl) - Math.sin(latRad) * Math.sin(altitude)) / (Math.cos(latRad) * Math.cos(altitude));
  const azimuth = Math.atan2(sinAz, cosAz);

  return { altitude, azimuth };
}

/* ===================================================================
 * 二分二至 & 近日/远日点 天文算法
 * 基于 Jean Meeus《Astronomical Algorithms》近似公式
 * 精度：±1分钟内（1000-3000年范围）
 * =================================================================== */

/** 儒略日数(JDE) → JavaScript Date */
function jdeToDate(jde: number): Date {
  const jd = jde - 2451545.0; // 距 J2000.0 的天数
  const unixMs = jd * 86400000 + 946684800000; // J2000.0 = 2000-01-01 12:00 UTC
  return new Date(unixMs);
}

/** 二分二至日期 */
export interface EquinoxSolsticeDates {
  spring: Date;   // 春分
  summer: Date;   // 夏至
  autumn: Date;   // 秋分
  winter: Date;   // 冬至
}

/** 动态计算指定年份的二分二至日期 */
export function getEquinoxSolsticeDates(year: number): EquinoxSolsticeDates {
  const y = (year - 2000) / 1000;

  // Meeus 公式：JDE = JDE0 + JDE1 * y + JDE2 * y² + JDE3 * y³
  const springJDE = 2451623.80984 + 365242.37404 * y + 0.05169 * y * y - 0.00411 * y * y * y;
  const summerJDE = 2451716.56767 + 365241.62603 * y + 0.00325 * y * y + 0.00888 * y * y * y;
  const autumnJDE = 2451810.21715 + 365242.01767 * y - 0.11575 * y * y + 0.00337 * y * y * y;
  const winterJDE = 2451900.05952 + 365242.74049 * y - 0.06223 * y * y - 0.00823 * y * y * y;

  return {
    spring: jdeToDate(springJDE),
    summer: jdeToDate(summerJDE),
    autumn: jdeToDate(autumnJDE),
    winter: jdeToDate(winterJDE),
  };
}

/** 动态计算指定年份的近日点日期 */
export function getPerihelionDate(year: number): Date {
  // 近日点近似：约在1月3日附近，使用简化公式
  const y = (year - 2000) / 1000;
  const periJDE = 2451547.507 + 365.2596358 * (year - 2000) + 0.0000000188 * (year - 2000) * (year - 2000);
  return jdeToDate(periJDE);
}

/** 动态计算指定年份的远日点日期 */
export function getAphelionDate(year: number): Date {
  // 远日点近似：约在7月4日附近
  const y = (year - 2000) / 1000;
  const aphJDE = 2451547.507 + 365.2596358 * (year - 2000) + 0.0000000188 * (year - 2000) * (year - 2000) + 182.6211;
  return jdeToDate(aphJDE);
}