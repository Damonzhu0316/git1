import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { EARTH_RADIUS, EARTH_TILT } from '@/utils/constants';
import { getEarthPosition } from '@/utils/astronomy';
import { useStore } from '@/store/useStore';

const TEXTURE_URL = '/textures/earth_atmos_2048.jpg';
const DAY_MS = 86400000;

function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 90) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function EarthMesh() {
  const texture = useTexture(TEXTURE_URL);
  texture.colorSpace = THREE.SRGBColorSpace;
  const [hovered, setHovered] = useState(false);

  return (
    <mesh
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      <meshPhongMaterial
        map={texture}
        specular={hovered ? 0x333333 : 0x111111}
        shininess={hovered ? 15 : 5}
      />
    </mesh>
  );
}

function HighlightMarker() {
  const highlightLatitude = useStore((s) => s.highlightLatitude);
  const highlightLongitude = useStore((s) => s.highlightLongitude);
  const targetLatitude = useStore((s) => s.targetLatitude);
  const targetLongitude = useStore((s) => s.targetLongitude);
  const cameraPreset = useStore((s) => s.cameraPreset);

  const lat = cameraPreset === 'surface' ? targetLatitude : highlightLatitude;
  const lon = cameraPreset === 'surface' ? targetLongitude : highlightLongitude;

  if (lat === null || lon === null) return null;
  const pos = latLonToVec3(lat, lon, EARTH_RADIUS * 1.03);
  return (
    <mesh position={pos}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshBasicMaterial color="#ff4444" />
    </mesh>
  );
}

export default function Earth() {
  const groupRef = useRef<THREE.Group>(null);
  const earthGroupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current || !earthGroupRef.current) return;
    const state = useStore.getState();

    if (state.isPlaying) {
      const advanceMs = state.timeSpeed * delta * DAY_MS;
      useStore.getState().setDate(new Date(state.currentDate.getTime() + advanceMs));
    }

    const currentDate = useStore.getState().currentDate;
    const earthPos = getEarthPosition(currentDate);

    if (state.focusEarth) {
      groupRef.current.position.set(0, 0, 0);
    } else {
      groupRef.current.position.set(earthPos[0], earthPos[1], earthPos[2]);
    }

    const dayOfYear = getDayOfYear(currentDate);
    const timeOfDay =
      (currentDate.getHours() + currentDate.getMinutes() / 60 + currentDate.getSeconds() / 3600) / 24;
    const rotationY = (dayOfYear + timeOfDay) * Math.PI * 2;
    earthGroupRef.current.rotation.y = rotationY;
  });

  return (
    <group ref={groupRef}>
      <group ref={earthGroupRef} rotation-x={EARTH_TILT * (Math.PI / 180)}>
        <EarthMesh />
        <HighlightMarker />
      </group>
    </group>
  );
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}