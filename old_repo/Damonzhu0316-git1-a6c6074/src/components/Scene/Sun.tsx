import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SUN_RADIUS } from '@/utils/constants';
import { getEarthPosition } from '@/utils/astronomy';
import { useStore } from '@/store/useStore';

function generateSunTexture(size: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size / 2;
  const ctx = canvas.getContext('2d')!;

  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const data = imageData.data;

  // 伪随机数生成器（确定性种子，保证每次生成一致）
  const seed = 42;
  function pseudoRandom(x: number, y: number): number {
    let h = seed + x * 374761393 + y * 668265263;
    h = (h ^ (h >> 13)) * 1274126177;
    h = h ^ (h >> 16);
    return (h & 0x7fffffff) / 0x7fffffff;
  }

  // 多层噪声叠加（模拟太阳表面颗粒结构）
  function fbm(x: number, y: number, octaves: number): number {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;
    for (let i = 0; i < octaves; i++) {
      const nx = x * frequency;
      const ny = y * frequency;
      const fx = Math.floor(nx);
      const fy = Math.floor(ny);
      const dx = nx - fx;
      const dy = ny - fy;

      const v00 = pseudoRandom(fx, fy);
      const v10 = pseudoRandom(fx + 1, fy);
      const v01 = pseudoRandom(fx, fy + 1);
      const v11 = pseudoRandom(fx + 1, fy + 1);

      const sx = dx * dx * (3 - 2 * dx);
      const sy = dy * dy * (3 - 2 * dy);
      const v = (v00 * (1 - sx) + v10 * sx) * (1 - sy) + (v01 * (1 - sx) + v11 * sx) * sy;

      value += v * amplitude;
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }
    return value / maxValue;
  }

  for (let py = 0; py < canvas.height; py++) {
    // 纬度：从 -PI/2 到 PI/2（等距柱状投影）
    const lat = (1 - (py + 0.5) / canvas.height) * Math.PI - Math.PI / 2;

    for (let px = 0; px < canvas.width; px++) {
      const lon = (px / canvas.width) * Math.PI * 2 - Math.PI;

      // 噪声采样
      const noise = fbm(px * 0.03, py * 0.03, 5);

      // 极地区域略暗（临边昏暗效果）
      const edgeDark = Math.cos(lat) * 0.15 + 0.85;

      // 颜色：从深橙到亮黄白
      const r = 255 * (0.85 + noise * 0.15);
      const g = 255 * (0.50 + noise * 0.35);
      const b = 255 * (0.05 + noise * 0.15);

      // 随机太阳黑子
      const spotChance = pseudoRandom(px * 0.5, py * 0.5);
      let spotFactor = 1;
      if (spotChance < 0.03) {
        const spotNoise = fbm(px * 0.15, py * 0.15, 3);
        spotFactor = 1 - spotNoise * 0.6;
      }

      const idx = (py * canvas.width + px) * 4;
      data[idx] = Math.round(r * edgeDark * spotFactor);
      data[idx + 1] = Math.round(g * edgeDark * spotFactor);
      data[idx + 2] = Math.round(b * edgeDark * spotFactor);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export default function Sun() {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const scaleRef = useRef(1);

  const texture = useMemo(() => {
    const tex = generateSunTexture(512);
    return tex;
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const state = useStore.getState();
    const earthPos = getEarthPosition(state.currentDate);

    if (state.focusEarth) {
      groupRef.current.position.set(-earthPos[0], -earthPos[1], -earthPos[2]);
    } else {
      groupRef.current.position.set(0, 0, 0);
    }

    // Smooth scale animation for hover/click
    const targetScale = clicked ? 1.08 : hovered ? 1.04 : 1;
    scaleRef.current += (targetScale - scaleRef.current) * Math.min(1, delta * 8);
    groupRef.current.scale.setScalar(scaleRef.current);

    // Reset click after animation
    if (clicked) {
      const timer = setTimeout(() => setClicked(false), 300);
      // Cleanup is handled by React re-render
    }
  });

  return (
    <group ref={groupRef}>
      {/* 太阳本体 - 程序化纹理 */}
      <mesh
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
        onClick={() => setClicked(true)}
      >
        <sphereGeometry args={[SUN_RADIUS, 64, 64]} />
        <meshBasicMaterial map={texture} />
      </mesh>

      <pointLight intensity={80} color="#fff5e0" />

      {/* 内光晕 */}
      <mesh>
        <sphereGeometry args={[SUN_RADIUS * 1.25, 32, 32]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={hovered ? 0.45 : 0.3} depthWrite={false} />
      </mesh>

      {/* 外光晕 */}
      <mesh>
        <sphereGeometry args={[SUN_RADIUS * 1.6, 32, 32]} />
        <meshBasicMaterial color="#ff8800" transparent opacity={hovered ? 0.2 : 0.12} depthWrite={false} />
      </mesh>
    </group>
  );
}