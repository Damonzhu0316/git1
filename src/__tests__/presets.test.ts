import { describe, it, expect } from 'vitest';
import { getSolarTerms, formatDateDisplay, formatLatLabel, formatLonLabel, LAT_PRESETS, LON_PRESETS } from '../data/presets';

describe('formatDateDisplay', () => {
  it('格式化日期', () => {
    const dt = new Date('2024-06-21T14:30:00');
    const { y, m, d, h, min } = formatDateDisplay(dt);
    expect(y).toBe(2024);
    expect(m).toBe('06');
    expect(d).toBe('21');
    expect(h).toBe('14');
    expect(min).toBe('30');
  });
});

describe('formatLatLabel', () => {
  it('北纬40°', () => {
    expect(formatLatLabel(40)).toBe('40°N');
  });
  it('南纬23.5°', () => {
    expect(formatLatLabel(-23.5)).toBe('23.5°S');
  });
  it('赤道0°', () => {
    expect(formatLatLabel(0)).toBe('0°N');
  });
});

describe('formatLonLabel', () => {
  it('东经116°', () => {
    expect(formatLonLabel(116)).toBe('116°E');
  });
  it('西经74°', () => {
    expect(formatLonLabel(-74)).toBe('74°W');
  });
});

describe('getSolarTerms', () => {
  it('应有4个二分二至', () => {
    const terms = getSolarTerms(2024);
    expect(terms).toHaveLength(4);
  });
  it('春分标签正确且日期格式为YYYY-MM-DD', () => {
    const terms = getSolarTerms(2024);
    expect(terms[0].label).toBe('春分');
    expect(terms[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it('二分二至日期在合理范围内', () => {
    const terms = getSolarTerms(2024);
    const dates = terms.map(t => new Date(t.date));
    // 春分: 3月19-22日
    expect(dates[0].getMonth()).toBe(2); // March
    expect(dates[0].getDate()).toBeGreaterThanOrEqual(19);
    expect(dates[0].getDate()).toBeLessThanOrEqual(22);
    // 夏至: 6月20-22日
    expect(dates[1].getMonth()).toBe(5); // June
    expect(dates[1].getDate()).toBeGreaterThanOrEqual(20);
    expect(dates[1].getDate()).toBeLessThanOrEqual(22);
    // 秋分: 9月22-24日
    expect(dates[2].getMonth()).toBe(8); // September
    // 冬至: 12月21-23日
    expect(dates[3].getMonth()).toBe(11); // December
  });
});

describe('LAT_PRESETS', () => {
  it('应有6个预设纬度', () => {
    expect(LAT_PRESETS).toHaveLength(6);
  });
  it('包含北京40°N', () => {
    expect(LAT_PRESETS.find((p) => p.lat === 40)).toBeDefined();
  });
});

describe('LON_PRESETS', () => {
  it('应有4个预设经度', () => {
    expect(LON_PRESETS).toHaveLength(4);
  });
});