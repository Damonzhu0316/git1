import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EARTH_RADIUS } from '@/utils/constants';
import { useStore } from '@/store/useStore';
import { formatHour } from '@/utils/astronomy';

const TIMEZONE_LABELS = [
  { lon: 0, label: '伦敦' },
  { lon: 120, label: '北京' },
  { lon: -75, label: '纽约' },
  { lon: 140, label: '东京' },
  { lon: 30, label: '开罗' },
  { lon: -120, label: '洛杉矶' },
  { lon: 60, label: '迪拜' },
  { lon: 150, label: '悉尼' },
  { lon: 90, label: '达卡' },
  { lon: -60, label: '巴西利亚' },
  { lon: -150, label: '檀香山' },
  { lon: 180, label: '日期变更线' },
];

function TimezoneMarker({ lon, label }: { lon: number; label: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const spriteRef = useRef<THREE.Sprite>(null);
  const lastHourRef = useRef(-1);

  const labelTex = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#00d4ff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, 128, 28);
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    ctx.fillText('--:--', 128, 52);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [label]);

  useFrame(() => {
    if (!groupRef.current) return;
    const state = useStore.getState();
    const date = state.currentDate;

    const localHourOffset = lon / 15;
    const utcHour = date.getUTCHours() + date.getUTCMinutes() / 60;
    const localHour = (utcHour + localHourOffset + 24) % 24;
    const hourInt = Math.floor(localHour);

    // 只在整点变化时更新纹理（或首次渲染）
    if (spriteRef.current && hourInt !== lastHourRef.current) {
      lastHourRef.current = hourInt;
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#00d4ff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, 128, 28);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(formatHour(localHour), 128, 52);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = spriteRef.current.material as THREE.SpriteMaterial;
      mat.map?.dispose();
      mat.map = tex;
      mat.needsUpdate = true;
    }

    const lonRad = (lon * Math.PI) / 180;
    groupRef.current.position.set(
      EARTH_RADIUS * 1.12 * Math.cos(lonRad),
      0,
      EARTH_RADIUS * 1.12 * Math.sin(lonRad),
    );
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#00d4ff" />
      </mesh>
      <sprite ref={spriteRef} scale={[1.5, 0.4, 1]}>
        <spriteMaterial map={labelTex} transparent depthTest={false} depthWrite={false} />
      </sprite>
    </group>
  );
}

export default function TimezoneOverlay() {
  const show = useStore((s) => s.showLocalTime);
  if (!show) return null;

  return (
    <group>
      {TIMEZONE_LABELS.map((t) => (
        <TimezoneMarker key={t.lon} lon={t.lon} label={t.label} />
      ))}
    </group>
  );
}