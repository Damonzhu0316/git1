import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '@/store/useStore';

/**
 * TimeManager - 当 isPlaying 为 true 时，每帧自动推进日期
 * 时间流逝速度由 timeSpeed 控制（1 = 每天1秒，60 = 每分钟1天）
 */
export default function TimeManager() {
  const isPlaying = useStore((s) => s.isPlaying);
  const timeSpeed = useStore((s) => s.timeSpeed);
  const setDate = useStore((s) => s.setDate);
  const currentDate = useStore((s) => s.currentDate);
  const accumulatedRef = useRef(0);
  const dateRef = useRef(currentDate);

  dateRef.current = currentDate;

  useFrame((_, delta) => {
    if (!isPlaying) return;
    // delta 是秒，timeSpeed 倍速，基准：实际1秒 = 模拟1天
    accumulatedRef.current += delta * timeSpeed;
    if (accumulatedRef.current >= 1) {
      const days = Math.floor(accumulatedRef.current);
      accumulatedRef.current -= days;
      const d = new Date(dateRef.current);
      d.setDate(d.getDate() + days);
      setDate(d);
    }
  });

  return null;
}