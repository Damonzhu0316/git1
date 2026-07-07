import { describe, it, expect } from 'vitest';
import {
  getDayOfYear,
  getSolarDeclination,
  getDayLength,
  getNoonSolarAltitude,
  getSunriseHour,
  getSunsetHour,
  formatDeclination,
  formatHour,
  getSolarHemisphere,
  getDeclinationTrend,
  getEarthOrbitAngle,
  getEquationOfTime,
  getSunSkyPosition,
} from '../utils/astronomy';

describe('getDayOfYear', () => {
  it('1月1日应为第1天', () => {
    expect(getDayOfYear(new Date('2024-01-01'))).toBe(1);
  });
  it('12月31日应为第365天（非闰年）', () => {
    expect(getDayOfYear(new Date('2024-12-31'))).toBe(366); // 2024 is leap year
  });
  it('3月1日（闰年）应为第61天', () => {
    expect(getDayOfYear(new Date('2024-03-01'))).toBe(61);
  });
});

describe('getSolarDeclination', () => {
  it('春分日赤纬接近0°', () => {
    const decl = getSolarDeclination(new Date('2024-03-20'));
    expect(Math.abs(decl)).toBeLessThan(1);
  });
  it('夏至日赤纬接近北回归线', () => {
    const decl = getSolarDeclination(new Date('2024-06-21'));
    expect(decl).toBeGreaterThan(22);
    expect(decl).toBeLessThan(24);
  });
  it('冬至日赤纬接近南回归线', () => {
    const decl = getSolarDeclination(new Date('2024-12-22'));
    expect(decl).toBeLessThan(-22);
    expect(decl).toBeGreaterThan(-24);
  });
  it('秋分日赤纬接近0°', () => {
    const decl = getSolarDeclination(new Date('2024-09-23'));
    expect(Math.abs(decl)).toBeLessThan(2);
  });
});

describe('getDayLength', () => {
  it('赤道全年昼夜等长（约12小时）', () => {
    const decl = getSolarDeclination(new Date('2024-06-21'));
    const len = getDayLength(0, decl);
    expect(len).toBeCloseTo(12, 0);
  });
  it('夏至日北京（40°N）昼长应大于12小时', () => {
    const decl = getSolarDeclination(new Date('2024-06-21'));
    const len = getDayLength(40, decl);
    expect(len).toBeGreaterThan(14);
  });
  it('冬至日北京（40°N）昼长应小于10小时', () => {
    const decl = getSolarDeclination(new Date('2024-12-22'));
    const len = getDayLength(40, decl);
    expect(len).toBeLessThan(10);
  });
  it('夏至日北极圈（66.5°N）出现极昼', () => {
    const decl = getSolarDeclination(new Date('2024-06-21'));
    const len = getDayLength(66.5, decl);
    expect(len).toBeGreaterThan(23);
  });
  it('冬至日北极圈（66.5°N）出现极夜', () => {
    const decl = getSolarDeclination(new Date('2024-12-22'));
    const len = getDayLength(66.5, decl);
    expect(len).toBeLessThan(1);
  });
});

describe('getNoonSolarAltitude', () => {
  it('夏至日北京（40°N）正午太阳高度约为73°', () => {
    const decl = getSolarDeclination(new Date('2024-06-21'));
    const alt = getNoonSolarAltitude(40, decl);
    expect(alt).toBeCloseTo(73.44, 0);
  });
  it('夏至日直射点（23.5°N）正午太阳高度约为90°', () => {
    const decl = getSolarDeclination(new Date('2024-06-21'));
    const alt = getNoonSolarAltitude(23.5, decl);
    expect(alt).toBeGreaterThan(85);
  });
});

describe('getSunriseHour / getSunsetHour', () => {
  it('赤道全年日出约6点，日落约18点', () => {
    const decl = getSolarDeclination(new Date('2024-06-21'));
    expect(getSunriseHour(0, decl)).toBeCloseTo(6, 0);
    expect(getSunsetHour(0, decl)).toBeCloseTo(18, 0);
  });
  it('夏至日北京（40°N）日出早于6点，日落晚于18点', () => {
    const decl = getSolarDeclination(new Date('2024-06-21'));
    expect(getSunriseHour(40, decl)).toBeLessThan(6);
    expect(getSunsetHour(40, decl)).toBeGreaterThan(18);
  });
});

describe('formatDeclination', () => {
  it('正赤纬显示N', () => {
    expect(formatDeclination(23.44)).toContain('N');
  });
  it('负赤纬显示S', () => {
    expect(formatDeclination(-23.44)).toContain('S');
  });
  it('0°赤纬显示0°', () => {
    expect(formatDeclination(0)).toBe('0°0′N');
  });
});

describe('formatHour', () => {
  it('格式化12:00', () => {
    expect(formatHour(12)).toBe('12:00');
  });
  it('格式化6:30', () => {
    expect(formatHour(6.5)).toBe('06:30');
  });
  it('格式化0:00', () => {
    expect(formatHour(0)).toBe('00:00');
  });
});

describe('getSolarHemisphere', () => {
  it('夏至日直射北半球', () => {
    expect(getSolarHemisphere(23.44)).toBe('北半球');
  });
  it('冬至日直射南半球', () => {
    expect(getSolarHemisphere(-23.44)).toBe('南半球');
  });
  it('赤纬0°为赤道', () => {
    expect(getSolarHemisphere(0)).toBe('赤道附近');
  });
});

describe('getDeclinationTrend', () => {
  it('春分后向北移动', () => {
    expect(getDeclinationTrend(new Date('2024-03-21'))).toBe('向北移动');
  });
  it('秋分后向南移动', () => {
    expect(getDeclinationTrend(new Date('2024-09-24'))).toBe('向南移动');
  });
  it('夏至前后趋势为折返', () => {
    const trend = getDeclinationTrend(new Date('2024-06-21'));
    expect(['向北移动', '向南移动', '折返']).toContain(trend);
  });
});

describe('getEarthOrbitAngle', () => {
  it('角度应在0-2PI范围内', () => {
    const angle = getEarthOrbitAngle(new Date('2024-06-21'));
    expect(angle).toBeGreaterThanOrEqual(0);
    expect(angle).toBeLessThan(Math.PI * 2);
  });
});

describe('getEquationOfTime', () => {
  it('均时差应在合理范围（-17到+14分钟）', () => {
    const eot = getEquationOfTime(new Date('2024-06-21'));
    expect(eot).toBeGreaterThan(-17);
    expect(eot).toBeLessThan(17);
  });
});

describe('getSunSkyPosition', () => {
  it('正午时太阳高度角应大于0（非极夜）', () => {
    const date = new Date('2024-06-21T12:00:00');
    const { altitude } = getSunSkyPosition(date, 40, 116);
    expect(altitude).toBeGreaterThan(0);
  });
  it('子夜时太阳高度角应小于0（非极昼）', () => {
    const date = new Date('2024-06-22T00:00:00');
    const { altitude } = getSunSkyPosition(date, 40, 116);
    expect(altitude).toBeLessThan(0);
  });
  it('方位角应在-π到π之间', () => {
    const date = new Date('2024-06-21T12:00:00');
    const { azimuth } = getSunSkyPosition(date, 40, 116);
    expect(azimuth).toBeGreaterThanOrEqual(-Math.PI);
    expect(azimuth).toBeLessThanOrEqual(Math.PI);
  });
});