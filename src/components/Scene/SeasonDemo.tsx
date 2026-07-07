import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { getEarthPosition } from '@/utils/astronomy';
import { SEASON_DAYS } from '@/utils/constants';

/**
 * 四季标签配置：春分 / 夏至 / 秋分 / 冬至
 */
const SEASON_CONFIG = [
  { label: '春', day: SEASON_DAYS.springEquinox, color: '#44ff88' },
  { label: '夏', day: SEASON_DAYS.summerSolstice, color: '#ff6644' },
  { label: '秋', day: SEASON_DAYS.autumnEquinox, color: '#ffaa00' },
  { label: '冬', day: SEASON_DAYS.winterSolstice, color: '#44aaff' },
] as const;

/** 完整循环一周的时长（秒） */
const CYCLE_DURATION = 12;

/**
 * SeasonDemo
 * 在日心视图中展示四季交替动画。
 * - 自动推进日期，循环遍历完整一年
 * - 在春分/夏至/秋分/冬至四个关键位置显示中文季节标签
 * - 使用节流避免每帧更新 store 导致无限重渲染（仅在日期真正变化时更新）
 */
export default function SeasonDemo() {
  const show = useStore((s) => s.showSeasonDemo);
  const currentDate = useStore((s) => s.currentDate);
  const year = currentDate.getFullYear();
  const elapsedRef = useRef(0);
  const prevDateStrRef = useRef('');

  /* ---- 四季标签 Sprite ---- */
  const sprites = useMemo(() => {
    return SEASON_CONFIG.map(({ label, day, color }) => {
      const date = new Date(year, 0, 1);
      date.setDate(date.getDate() + day - 1);
      const [x, y, z] = getEarthPosition(date);

      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = color;
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 64, 32);
      const tex = new THREE.CanvasTexture(canvas);
      tex.minFilter = THREE.LinearFilter;
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0.9,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.position.set(x, y + 1.5, z);
      sprite.scale.set(2, 1, 1);
      return sprite;
    });
  }, [year]);

  /* ---- 每帧推进日期（节流：仅在日期字符串变化时更新 store） ---- */
  useFrame((_, delta) => {
    if (!show) return;
    elapsedRef.current += delta;
    // 在 CYCLE_DURATION 秒内走完 365 天
    const dayOfYear = ((elapsedRef.current / CYCLE_DURATION) * 365) % 365;
    const currentDay = Math.floor(dayOfYear);

    // 仅在日期真正变化时才更新 store（避免每帧触发所有订阅者重渲染）
    const dateStr = `${currentDay}`;
    if (dateStr !== prevDateStrRef.current) {
      prevDateStrRef.current = dateStr;
      const state = useStore.getState();
      const date = new Date(state.currentDate.getFullYear(), 0, 1);
      date.setDate(date.getDate() + currentDay);
      const fractionalDay = dayOfYear - currentDay;
      date.setHours(
        Math.floor(fractionalDay * 24),
        Math.floor((fractionalDay * 24 * 60) % 60),
        Math.floor((fractionalDay * 24 * 3600) % 60),
      );
      useStore.getState().setDate(date);
    }
  });

  if (!show) return null;

  return (
    <group>
      {sprites.map((sprite, i) => (
        <primitive key={i} object={sprite} />
      ))}
    </group>
  );
}