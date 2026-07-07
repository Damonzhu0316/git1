import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { getEarthPosition, getDayOfYear } from '@/utils/astronomy';
import { MOON_ORBIT_RADIUS, EARTH_RADIUS, MOON_RADIUS } from '@/utils/constants';

/** 食的判断阈值：日-月-地连线夹角小于此值视为重合 */
const ECLIPSE_ANGLE_THRESHOLD = 0.08; // 弧度 ≈ 4.6°

/** 阴影锥体的长度系数 */
const CONE_LENGTH_FACTOR = 1.8;

/** 阴影锥体的半径系数 */
const CONE_RADIUS_FACTOR = 0.6;

/**
 * 计算月球在日心坐标系下的3D位置
 */
function getMoonHelioPosition(date: Date): THREE.Vector3 {
  const [ex, ey, ez] = getEarthPosition(date);
  const angle = (getDayOfYear(date) / 27.3) * Math.PI * 2;
  return new THREE.Vector3(
    ex + MOON_ORBIT_RADIUS * Math.cos(angle),
    ey + MOON_ORBIT_RADIUS * 0.2 * Math.sin(angle * 0.5),
    ez + MOON_ORBIT_RADIUS * Math.sin(angle),
  );
}

/**
 * 判断当前是否发生日食或月食
 */
function detectEclipse(
  sunPos: THREE.Vector3,
  earthPos: THREE.Vector3,
  moonPos: THREE.Vector3,
): { type: 'solar' | 'lunar' | null } {
  const sunToEarth = new THREE.Vector3().subVectors(earthPos, sunPos);
  const sunToMoon = new THREE.Vector3().subVectors(moonPos, sunPos);

  const sunToEarthDir = sunToEarth.clone().normalize();
  const sunToMoonDir = sunToMoon.clone().normalize();

  const cross = new THREE.Vector3().crossVectors(sunToEarthDir, sunToMoonDir);
  const angle = cross.length();

  if (angle > ECLIPSE_ANGLE_THRESHOLD) return { type: null };

  if (sunToMoon.length() < sunToEarth.length()) {
    return { type: 'solar' };
  } else {
    return { type: 'lunar' };
  }
}

/**
 * 更新锥体位置和朝向（复用已有对象，不创建新的）
 */
function updateCone(
  cone: THREE.Mesh,
  src: THREE.Vector3,
  dst: THREE.Vector3,
  _direction: THREE.Vector3,
  _midPoint: THREE.Vector3,
  _quat: THREE.Vector3, // 临时复用
) {
  _direction.subVectors(dst, src);
  const length = _direction.length() * CONE_LENGTH_FACTOR;
  _midPoint.addVectors(src, _direction.clone().normalize().multiplyScalar(length / 2));
  cone.position.copy(_midPoint);

  const defaultDir = new THREE.Vector3(0, 1, 0);
  const quat = new THREE.Quaternion().setFromUnitVectors(defaultDir, _direction.normalize());
  cone.setRotationFromQuaternion(quat);
}

/**
 * 更新标签 Sprite 位置
 */
function updateLabel(
  sprite: THREE.Sprite,
  position: THREE.Vector3,
) {
  sprite.position.copy(position);
}

/**
 * EclipseDemo
 * 在日心视图中展示日食 / 月食可视化。
 * - 复用锥体和标签对象，避免每帧创建新对象
 * - 使用 visibility 控制显示/隐藏
 */
export default function EclipseDemo() {
  const show = useStore((s) => s.showEclipse);
  const prevTypeRef = useRef<'solar' | 'lunar' | null>(null);

  const sunPos = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  // 复用临时向量
  const _direction = useMemo(() => new THREE.Vector3(), []);
  const _midPoint = useMemo(() => new THREE.Vector3(), []);
  const _earthPos = useMemo(() => new THREE.Vector3(), []);
  const _moonPos = useMemo(() => new THREE.Vector3(), []);

  // 创建复用的锥体（日食和月食各一个，通过 visibility 切换）
  const { solarCone, lunarCone, solarLabel, lunarLabel } = useMemo(() => {
    const baseRadius = MOON_RADIUS * CONE_RADIUS_FACTOR;
    const coneGeo = new THREE.ConeGeometry(baseRadius, 1, 16, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x444444,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const solarCone = new THREE.Mesh(coneGeo, coneMat);
    solarCone.visible = false;

    const lunarCone = new THREE.Mesh(coneGeo.clone(), coneMat.clone());
    lunarCone.visible = false;

    // 创建标签
    const createLabel = (text: string, color: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = color;
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 64, 32);
      const tex = new THREE.CanvasTexture(canvas);
      tex.minFilter = THREE.LinearFilter;
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0.9,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(2.5, 1.25, 1);
      sprite.visible = false;
      return sprite;
    };

    const solarLabel = createLabel('日食', '#ff6644');
    const lunarLabel = createLabel('月食', '#8844ff');

    return { solarCone, lunarCone, solarLabel, lunarLabel };
  }, []);

  useFrame(() => {
    if (!show) return;

    const date = useStore.getState().currentDate;
    _earthPos.set(...getEarthPosition(date));
    _moonPos.copy(getMoonHelioPosition(date));

    const { type } = detectEclipse(sunPos, _earthPos, _moonPos);

    // 仅在食类型变化时才更新对象
    if (type !== prevTypeRef.current) {
      prevTypeRef.current = type;

      // 隐藏所有
      solarCone.visible = false;
      lunarCone.visible = false;
      solarLabel.visible = false;
      lunarLabel.visible = false;

      if (type === 'solar') {
        updateCone(solarCone, _moonPos, _earthPos, _direction, _midPoint, _direction);
        solarCone.visible = true;
        const labelPos = _moonPos.clone().add(
          new THREE.Vector3(0, MOON_ORBIT_RADIUS * 0.8, 0),
        );
        updateLabel(solarLabel, labelPos);
        solarLabel.visible = true;
      } else if (type === 'lunar') {
        updateCone(lunarCone, _earthPos, _moonPos, _direction, _midPoint, _direction);
        lunarCone.visible = true;
        const labelPos = _earthPos.clone().add(
          new THREE.Vector3(0, EARTH_RADIUS * 2.5, 0),
        );
        updateLabel(lunarLabel, labelPos);
        lunarLabel.visible = true;
      }
    }
  });

  if (!show) return null;

  return (
    <group>
      <primitive object={solarCone} />
      <primitive object={lunarCone} />
      <primitive object={solarLabel} />
      <primitive object={lunarLabel} />
    </group>
  );
}