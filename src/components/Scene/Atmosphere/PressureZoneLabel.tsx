import { useMemo } from 'react';
import * as THREE from 'three';
import type { PressureZoneConfig } from '@/types/atmosphere';

interface PressureZoneLabelProps {
  config: PressureZoneConfig;
  earthRadius: number;
  seasonalShift?: number;
}

export function PressureZoneLabel({
  config,
  earthRadius,
  seasonalShift = 0,
}: PressureZoneLabelProps) {
  const { texture, position } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.roundRect(0, 0, 512, 128, 16);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.name, 256, 64);

    const tex = new THREE.CanvasTexture(canvas);

    const latRad = THREE.MathUtils.degToRad(config.latCenter + seasonalShift);
    const y = (earthRadius + 1.5) * Math.sin(latRad);
    const r = (earthRadius + 1.5) * Math.cos(latRad);
    const pos = new THREE.Vector3(r, y, 0);

    return { texture: tex, position: pos };
  }, [config, earthRadius, seasonalShift]);

  return (
    <sprite position={position} scale={[4, 1, 1]}>
      <spriteMaterial map={texture} transparent depthTest={false} />
    </sprite>
  );
}
