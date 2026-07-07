import { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { EARTH_RADIUS } from '@/utils/constants';

/**
 * LocalTimeHighlight - 地方时经线高亮组件
 * 在地心视角中显示：
 * 1. 观测点所在经线（绿色高亮弧线）
 * 2. 本初子午线（红色虚线参考）
 * 3. 地方时数值标签
 */
function makeMeridianLine(lon: number, color: string, opacity: number, dashed: boolean): THREE.Line {
  const lonRad = (lon * Math.PI) / 180;
  const pts: THREE.Vector3[] = [];
  const steps = 64;
  const R = EARTH_RADIUS * 1.025;
  for (let i = 0; i <= steps; i++) {
    const phi = (i / steps) * Math.PI;
    pts.push(new THREE.Vector3(
      R * Math.sin(phi) * Math.cos(lonRad),
      R * Math.cos(phi),
      R * Math.sin(phi) * Math.sin(lonRad),
    ));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = dashed
    ? new THREE.LineDashedMaterial({ color, transparent: true, opacity, dashSize: 0.3, gapSize: 0.2, depthTest: true })
    : new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthTest: true });
  return new THREE.Line(geo, mat);
}

function makeLabel(text: string, color: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 32);
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(2, 0.5, 1);
  return sprite;
}

export default function LocalTimeHighlight() {
  const show = useStore((s) => s.showLocalTime);
  const lon = useStore((s) => s.targetLongitude);
  const currentDate = useStore((s) => s.currentDate);

  // 观测点经线
  const obsLine = useMemo(() => makeMeridianLine(lon, '#44ff88', 0.8, false), [lon]);
  // 本初子午线（虚线参考）
  const primeLine = useMemo(() => makeMeridianLine(0, '#ff4444', 0.45, true), []);

  // 赤道标签
  const obsLabel = useMemo(() => {
    const hour = currentDate.getHours();
    const min = currentDate.getMinutes();
    const localTimeOffset = (lon - 120) / 15;
    const localHour = ((hour + localTimeOffset) % 24 + 24) % 24;
    const h = Math.floor(localHour);
    const m = Math.floor(min + (localTimeOffset % 1) * 60);
    const label = makeLabel(
      `${String(h).padStart(2, '0')}:${String(m % 60).padStart(2, '0')} (${lon >= 0 ? 'E' : 'W'}${Math.abs(lon)}°)`,
      '#44ff88',
    );
    const lonRad = (lon * Math.PI) / 180;
    label.position.set(
      EARTH_RADIUS * 1.25 * Math.cos(lonRad),
      0,
      EARTH_RADIUS * 1.25 * Math.sin(lonRad),
    );
    return label;
  }, [lon, currentDate]);

  const primeLabel = useMemo(() => {
    const label = makeLabel('0° 本初子午线', '#ff4444');
    label.position.set(EARTH_RADIUS * 1.25, 0, 0);
    return label;
  }, []);

  if (!show) return null;

  return (
    <group>
      <primitive object={obsLine} />
      <primitive object={primeLine} />
      <primitive object={obsLabel} />
      <primitive object={primeLabel} />
    </group>
  );
}