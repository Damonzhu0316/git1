import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { getDayOfYear } from '@/utils/astronomy';
import { EARTH_RADIUS } from '@/utils/constants';

/** 月相周期（天） */
const LUNAR_MONTH = 27.3;

/** 月相图 Sprite 尺寸 */
const SPRITE_WIDTH = 5;
const SPRITE_HEIGHT = 5;

/** 月相图偏移：放在地球上方偏右 */
const SPRITE_OFFSET: [number, number, number] = [0, EARTH_RADIUS * 2.5, 0];

/** 8 个月相定义 */
const PHASES = [
  { name: '新月', dayFraction: 0 / 8 },
  { name: '蛾眉月', dayFraction: 1 / 8 },
  { name: '上弦月', dayFraction: 2 / 8 },
  { name: '盈凸月', dayFraction: 3 / 8 },
  { name: '满月', dayFraction: 4 / 8 },
  { name: '亏凸月', dayFraction: 5 / 8 },
  { name: '下弦月', dayFraction: 6 / 8 },
  { name: '残月', dayFraction: 7 / 8 },
] as const;

/** 手动绘制圆角矩形（兼容不支持 roundRect 的浏览器） */
function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/**
 * 在 canvas 上绘制一个月相小图标
 */
function drawPhaseIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  dayFraction: number,
  isHighlighted: boolean,
) {
  // 背景圆
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = isHighlighted ? '#5577cc' : '#1a1a3a';
  ctx.fill();
  ctx.strokeStyle = isHighlighted ? '#8899dd' : '#334455';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 月相形状：白月+暗影
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  // 满月部分（始终可见的白底）
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#ddddee';
  ctx.fill();

  // 根据月相绘制暗影
  const t = dayFraction;
  let shadowSign: number;

  if (t <= 0.25) {
    shadowSign = 1 - t * 4;
  } else if (t <= 0.5) {
    shadowSign = -(t - 0.25) * 4;
  } else if (t <= 0.75) {
    shadowSign = -(1 - (t - 0.5) * 4);
  } else {
    shadowSign = (t - 0.75) * 4;
  }

  const shadowWidth = radius * 2 * Math.abs(shadowSign);
  const shadowX = shadowSign > 0
    ? cx + radius - shadowWidth / 2
    : cx - radius + shadowWidth / 2;

  ctx.beginPath();
  ctx.ellipse(shadowX, cy, shadowWidth / 2, radius, 0, -Math.PI / 2, Math.PI / 2);
  ctx.fillStyle = '#0a0e27';
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(shadowX, cy, shadowWidth / 2, radius, 0, Math.PI / 2, -Math.PI / 2);
  ctx.fillStyle = '#0a0e27';
  ctx.fill();

  ctx.restore();

  // 边框
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = isHighlighted ? '#aaccff' : '#445566';
  ctx.lineWidth = 2;
  ctx.stroke();
}

/**
 * 在复用的 canvas 上绘制完整月相图
 */
function drawMoonPhaseTexture(ctx: CanvasRenderingContext2D, size: number, currentPhase: number) {
  // 清空
  ctx.clearRect(0, 0, size, size);

  // 半透明深色背景
  ctx.fillStyle = 'rgba(10, 14, 39, 0.85)';
  drawRoundRect(ctx, 0, 0, size, size, 40);
  ctx.fill();
  ctx.strokeStyle = '#334466';
  ctx.lineWidth = 3;
  drawRoundRect(ctx, 0, 0, size, size, 40);
  ctx.stroke();

  // 标题
  ctx.fillStyle = '#aaccff';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('月相图', size / 2, 16);

  // 参数
  const centerX = size / 2;
  const centerY = size / 2 + 10;
  const orbitRadius = 155;
  const iconRadius = 28;

  // 绘制连接线
  PHASES.forEach((_phase, i) => {
    const angle = (i / PHASES.length) * Math.PI * 2 - Math.PI / 2;
    const ix = centerX + orbitRadius * Math.cos(angle);
    const iy = centerY + orbitRadius * Math.sin(angle);
    ctx.strokeStyle = 'rgba(68, 85, 102, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(ix, iy);
    ctx.stroke();
  });

  // 绘制中心地球图标
  ctx.beginPath();
  ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
  ctx.fillStyle = '#4488ff';
  ctx.fill();
  ctx.strokeStyle = '#aaccff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('地球', centerX, centerY);

  // 绘制 8 个月相图标
  const currentPhaseIndex = Math.floor(currentPhase * PHASES.length) % PHASES.length;

  PHASES.forEach((phase, i) => {
    const angle = (i / PHASES.length) * Math.PI * 2 - Math.PI / 2;
    const ix = centerX + orbitRadius * Math.cos(angle);
    const iy = centerY + orbitRadius * Math.sin(angle);

    const isHighlighted = i === currentPhaseIndex;
    drawPhaseIcon(ctx, ix, iy, iconRadius, phase.dayFraction, isHighlighted);

    // 标签
    const labelRadius = orbitRadius + 48;
    const lx = centerX + labelRadius * Math.cos(angle);
    const ly = centerY + labelRadius * Math.sin(angle);
    ctx.fillStyle = isHighlighted ? '#ffdd44' : '#8899bb';
    ctx.font = isHighlighted ? 'bold 16px sans-serif' : '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(phase.name, lx, ly);
  });

  // 当前月相指示
  const infoAngle = (currentPhaseIndex / PHASES.length) * Math.PI * 2 - Math.PI / 2;
  const infoX = centerX + (orbitRadius - 55) * Math.cos(infoAngle);
  const infoY = centerY + (orbitRadius - 55) * Math.sin(infoAngle);
  ctx.fillStyle = '#ffdd44';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('当前', infoX, infoY);
}

/**
 * MoonPhaseDemo
 * 在地心视图中展示月相变化。
 * - 复用 Canvas + CanvasTexture，仅在月相变化时重绘
 * - 使用 throttle 避免每帧创建新对象
 */
export default function MoonPhaseDemo() {
  const show = useStore((s) => s.showMoonPhases);
  const spriteRef = useRef<THREE.Sprite | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const prevPhaseRef = useRef(-1);

  // 创建复用的 Canvas 和 Texture（只创建一次）
  const { canvas, texture } = useMemo(() => {
    const size = 512;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const t = new THREE.CanvasTexture(c);
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    return { canvas: c, texture: t };
  }, []);

  // 初始化绘制
  useEffect(() => {
    const ctx = canvas.getContext('2d')!;
    drawMoonPhaseTexture(ctx, 512, 0);
    texture.needsUpdate = true;
  }, [canvas, texture]);

  useFrame(() => {
    if (!show) return;
    if (!groupRef.current) return;

    const date = useStore.getState().currentDate;
    const dayOfYear = getDayOfYear(date);
    const lunarDay = (dayOfYear % LUNAR_MONTH) / LUNAR_MONTH;
    const currentPhase = Math.round(lunarDay * 100) / 100; // 精度到 1%

    // 仅在月相变化超过 1% 时才重绘
    if (currentPhase !== prevPhaseRef.current) {
      prevPhaseRef.current = currentPhase;
      const ctx = canvas.getContext('2d')!;
      drawMoonPhaseTexture(ctx, 512, lunarDay);
      texture.needsUpdate = true;
    }

    groupRef.current.position.set(...SPRITE_OFFSET);
  });

  if (!show) return null;

  return (
    <group ref={groupRef}>
      <sprite
        ref={spriteRef}
        scale={[SPRITE_WIDTH, SPRITE_HEIGHT, 1]}
      >
        <spriteMaterial
          map={texture}
          transparent
          depthTest={false}
          depthWrite={false}
        />
      </sprite>
    </group>
  );
}