import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EARTH_RADIUS, EARTH_TILT } from '@/utils/constants';
import { getEarthPosition, getSolarDeclination, getDayLength, getSunriseHour, getSunsetHour, getDayOfYear } from '@/utils/astronomy';
import { useStore } from '@/store/useStore';

const TILT_RAD = EARTH_TILT * (Math.PI / 180);

/** 获取地球自转的逆四元数 */
function getEarthInvQuat(date: Date): THREE.Quaternion {
  const doy = getDayOfYear(date);
  const tod = (date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600) / 24;
  const euler = new THREE.Euler(TILT_RAD, (doy + tod) * Math.PI * 2, 0, 'YXZ');
  return new THREE.Quaternion().setFromEuler(euler).invert();
}

/* ========== 昼弧/夜弧标注 ========== */
function DayNightArc({ lat }: { lat: number }) {
  const ref = useRef<THREE.Group>(null);
  const dayRef = useRef<THREE.Line>(null);
  const nightRef = useRef<THREE.Line>(null);

  const dayArc = useMemo(() => {
    const r = EARTH_RADIUS * 1.02 * Math.cos((lat * Math.PI) / 180);
    const y = EARTH_RADIUS * 1.02 * Math.sin((lat * Math.PI) / 180);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const theta = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.Line(geo, new THREE.LineBasicMaterial({ color: '#ffaa33', transparent: true, opacity: 0.8, depthTest: true }));
  }, [lat]);

  const nightArc = useMemo(() => {
    const r = EARTH_RADIUS * 1.02 * Math.cos((lat * Math.PI) / 180);
    const y = EARTH_RADIUS * 1.02 * Math.sin((lat * Math.PI) / 180);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const theta = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.Line(geo, new THREE.LineBasicMaterial({ color: '#4466cc', transparent: true, opacity: 0.6, depthTest: true }));
  }, [lat]);

  useFrame(() => {
    if (!ref.current) return;
    const state = useStore.getState();
    const date = state.currentDate;
    const [ex, ey, ez] = getEarthPosition(date);
    const worldSunDir = new THREE.Vector3(-ex, -ey, -ez).normalize();
    const invQuat = getEarthInvQuat(date);
    const localSunDir = worldSunDir.clone().applyQuaternion(invQuat);

    const decl = getSolarDeclination(date);
    const dayLen = getDayLength(lat, decl);

    ref.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), localSunDir);

    const dayLenFraction = dayLen / 24;
    if (dayRef.current && nightRef.current) {
      if (dayLenFraction >= 0.99) {
        dayRef.current.visible = true;
        nightRef.current.visible = false;
      } else if (dayLenFraction <= 0.01) {
        dayRef.current.visible = false;
        nightRef.current.visible = true;
      } else {
        dayRef.current.visible = true;
        nightRef.current.visible = true;
      }
    }
  });

  return (
    <group ref={ref}>
      <primitive ref={dayRef} object={dayArc} />
      <primitive ref={nightRef} object={nightArc} />
    </group>
  );
}

export default function GeoOverlays() {
  const showDayNightArc = useStore((s) => s.showDayNightArc);
  const showSolarAltitude = useStore((s) => s.showSolarAltitude);

  if (!showDayNightArc && !showSolarAltitude) return null;

  return (
    <group>
      {showDayNightArc && (
        <>
          {[0, 23.5, -23.5, 40, 66.5].map((lat) => (
            <DayNightArc key={lat} lat={lat} />
          ))}
        </>
      )}
      {showSolarAltitude && <SolarAltitudeArc />}
    </group>
  );
}

/* ========== 正午太阳高度角标注 ========== */
function SolarAltitudeArc() {
  const ref = useRef<THREE.Group>(null);
  const labelRef = useRef<THREE.Sprite>(null);

  const arcGeo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const R = EARTH_RADIUS * 1.3;
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 0.5;
      pts.push(new THREE.Vector3(0, R * Math.sin(angle), R * Math.cos(angle)));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.Line(geo, new THREE.LineDashedMaterial({
      color: '#ffdd44',
      transparent: true,
      opacity: 0.7,
      dashSize: 0.3,
      gapSize: 0.2,
      depthTest: true,
    }));
  }, []);

  const labelTex = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffdd44';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('90°', 128, 40);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const state = useStore.getState();
    const date = state.currentDate;
    const [ex, ey, ez] = getEarthPosition(date);
    const worldSunDir = new THREE.Vector3(-ex, -ey, -ez).normalize();
    const invQuat = getEarthInvQuat(date);
    const localSunDir = worldSunDir.clone().applyQuaternion(invQuat);

    // 获取直射点纬度处的地球表面点
    const decl = getSolarDeclination(date);
    const declRad = (decl * Math.PI) / 180;
    const surfacePoint = new THREE.Vector3(
      EARTH_RADIUS * Math.cos(declRad),
      EARTH_RADIUS * Math.sin(declRad),
      0,
    );

    // 将本地太阳方向设为Y轴方向
    ref.current.position.copy(surfacePoint);
    ref.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), localSunDir);

    if (labelRef.current) {
      labelRef.current.position.set(0, EARTH_RADIUS * 1.3, 0);
    }
  });

  return (
    <group ref={ref}>
      <primitive object={arcGeo} />
      <sprite ref={labelRef} scale={[1.5, 0.4, 1]}>
        <spriteMaterial map={labelTex} transparent depthTest={false} />
      </sprite>
    </group>
  );
}