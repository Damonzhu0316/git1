import { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { getEarthPosition, getPerihelionDate, getAphelionDate } from '@/utils/astronomy';
import { EARTH_ORBIT_RADIUS, ORBIT_ECCENTRICITY } from '@/utils/constants';

/**
 * OrbitSpeedIndicator
 * 沿地球椭圆轨道显示轨道速度变化。
 * - 采样 36 个位置（约每 10 天），在轨道法线方向绘制彩色线段
 * - 线段长度与轨道速度成正比
 * - 颜色渐变：红色（近日点附近，速度快）→ 蓝色（远日点附近，速度慢）
 * - 近日点和远日点处显示速度标签
 */
export default function OrbitSpeedIndicator() {
  const show = useStore((s) => s.showOrbitSpeed);
  const currentDate = useStore((s) => s.currentDate);
  const year = currentDate.getFullYear();

  const { segments, sprites } = useMemo(() => {
    const a = EARTH_ORBIT_RADIUS;
    const b = a * Math.sqrt(1 - ORBIT_ECCENTRICITY * ORBIT_ECCENTRICITY);
    const c = a * ORBIT_ECCENTRICITY; // 椭圆中心偏移，太阳在右焦点
    const numSamples = 36;

    /* ---- 采样 36 个轨道位置并计算速度 ---- */
    const samples: { pos: [number, number, number]; angle: number; r: number }[] = [];
    for (let i = 0; i < numSamples; i++) {
      const dayOfYear = 1 + (i / numSamples) * 365;
      const date = new Date(year, 0, dayOfYear);
      const pos = getEarthPosition(date);
      const [x, , z] = pos;
      const r = Math.sqrt(x * x + z * z);
      // 角度从椭圆中心计算（而非从太阳），保证法线方向正确
      const angle = Math.atan2(z, x + c);
      samples.push({ pos, angle, r });
    }

    // 轨道速度 v ∝ sqrt(2/r - 1/a)
    const speeds = samples.map((s) => Math.sqrt(Math.max(0, 2 / s.r - 1 / a)));
    const vMin = Math.min(...speeds);
    const vMax = Math.max(...speeds);

    /* ---- 构建彩色线段几何体 ---- */
    const vertices: number[] = [];
    const colors: number[] = [];
    const baseLen = 0.4;
    const maxLen = 2.0;

    for (let i = 0; i < numSamples; i++) {
      const { pos, angle } = samples[i];
      const [x, y, z] = pos;
      const vNorm = vMax > vMin ? (speeds[i] - vMin) / (vMax - vMin) : 0.5;
      const segLen = baseLen + vNorm * (maxLen - baseLen);

      // 椭圆外法线方向：N = (b·cosθ, 0, a·sinθ)
      const nx = b * Math.cos(angle);
      const nz = a * Math.sin(angle);
      const nLen = Math.sqrt(nx * nx + nz * nz);
      const dx = (nx / nLen) * segLen;
      const dz = (nz / nLen) * segLen;

      // 线段：起点在轨道上，终点沿法线向外
      vertices.push(x, y, z, x + dx, y, z + dz);

      // 颜色：红色（快）→ 蓝色（慢）
      const rCol = vNorm;
      const gCol = 0.08;
      const bCol = 1 - vNorm;
      colors.push(rCol, gCol, bCol, rCol, gCol, bCol);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });
    const segments = new THREE.LineSegments(geo, mat);

    /* ---- 近日点 / 远日点速度标签 ---- */
    const perihelionDate = getPerihelionDate(year);
    const aphelionDate = getAphelionDate(year);

    const createSprite = (
      label: string,
      color: string,
      date: Date,
      offsetY: number,
    ) => {
      const [px, py, pz] = getEarthPosition(date);
      const r = Math.sqrt(px * px + pz * pz);
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = color;
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 64, 32);
      const tex = new THREE.CanvasTexture(canvas);
      tex.minFilter = THREE.LinearFilter;
      const spriteMat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0.9,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(spriteMat);
      const scale = (r + 2.5) / r;
      sprite.position.set(px * scale, py + offsetY, pz * scale);
      sprite.scale.set(3, 1.5, 1);
      return sprite;
    };

    const sprites = [
      createSprite('近日点 快', '#ff4444', perihelionDate, -1.5),
      createSprite('远日点 慢', '#4444ff', aphelionDate, -1.5),
    ];

    return { segments, sprites };
  }, [year]);

  if (!show) return null;

  return (
    <group>
      <primitive object={segments} />
      {sprites.map((sprite, i) => (
        <primitive key={i} object={sprite} />
      ))}
    </group>
  );
}