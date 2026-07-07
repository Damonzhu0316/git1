import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { getSolarDeclination, getSunSkyPosition, getSunriseHour, getSunsetHour } from '@/utils/astronomy';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingFallback from './LoadingFallback';
import SolarAltitudeApp from './SolarAltitudeApp';
import TimeManager from './TimeManager';

/* ========== 太阳位置计算（保留本地副本用于 Scene 内部，页面层从 astronomy 导入） ========== */
function altAzToWorld(altitude: number, azimuth: number, dist: number): THREE.Vector3 {
  return new THREE.Vector3(
    dist * Math.cos(altitude) * Math.sin(azimuth),
    dist * Math.sin(altitude),
    -dist * Math.cos(altitude) * Math.cos(azimuth),
  );
}

const SKY_R = 20;

/* ========== 动态天空穹顶 ========== */
function SkyDome() {
  const ref = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uSunAltitude: { value: 0.5 },
  }), []);

  useFrame(() => {
    const state = useStore.getState();
    const { altitude } = getSunSkyPosition(state.currentDate, state.targetLatitude, state.targetLongitude);
    uniforms.uSunAltitude.value = altitude;
  });

  const vert = `
    varying float vHeight;
    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vHeight = position.y;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const frag = `
    uniform float uSunAltitude;
    varying float vHeight;
    void main() {
      float h = clamp(vHeight / ${SKY_R.toFixed(1)}, 0.0, 1.0);
      // 天顶深蓝 → 地平线浅蓝白
      vec3 zenith = vec3(0.02, 0.06, 0.25);
      vec3 horizon = vec3(0.25, 0.35, 0.55);
      // 太阳高度影响地平线亮度
      float sunEffect = smoothstep(-0.3, 0.5, uSunAltitude);
      horizon = mix(horizon, vec3(0.5, 0.55, 0.7), sunEffect * 0.5);
      vec3 color = mix(horizon, zenith, pow(h, 0.6));
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  return (
    <mesh>
      <sphereGeometry args={[SKY_R, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <shaderMaterial ref={ref} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
}

/* ========== 地面 ========== */
function GroundPlane() {
  const vert = `
    varying vec3 vWorldPos;
    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPos.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  const frag = `
    varying vec3 vWorldPos;
    void main() {
      float dist = length(vWorldPos.xz);
      float alpha = smoothstep(0.0, 18.0, dist);
      vec3 nearColor = vec3(0.06, 0.10, 0.05);
      vec3 farColor = vec3(0.04, 0.06, 0.14);
      vec3 color = mix(nearColor, farColor, alpha);
      gl_FragColor = vec4(color, 1.0);
    }
  `;
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={-0.5}>
      <planeGeometry args={[50, 50]} />
      <shaderMaterial vertexShader={vert} fragmentShader={frag} depthWrite={true} />
    </mesh>
  );
}

/* ========== 地平圈 ========== */
function HorizonRing() {
  const ring = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const R = 12;
    for (let i = 0; i <= 256; i++) {
      const ang = (i / 256) * Math.PI * 2;
      pts.push(new THREE.Vector3(R * Math.cos(ang), 0, R * Math.sin(ang)));
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.Line(g, new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.3, depthTest: true }));
  }, []);
  return <primitive object={ring} />;
}

/* ========== 子午线（N-天顶-S大圆） ========== */
function MeridianLine() {
  const line = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const ang = (i / 128) * Math.PI;
      const R = 12;
      pts.push(new THREE.Vector3(0, R * Math.sin(ang), -R * Math.cos(ang)));
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.Line(g, new THREE.LineBasicMaterial({ color: '#4488aa', transparent: true, opacity: 0.2, depthTest: true }));
  }, []);
  return <primitive object={line} />;
}

/* ========== 方位标记 ========== */
function DirectionLabels() {
  const labels = useMemo(() => {
    const makeLabel = (text: string, pos: THREE.Vector3, color: string): THREE.Sprite => {
      const canvas = document.createElement('canvas');
      canvas.width = 64; canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = color;
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 32, 32);
      const tex = new THREE.CanvasTexture(canvas);
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.7, depthTest: false });
      const sprite = new THREE.Sprite(mat);
      sprite.position.copy(pos);
      sprite.scale.set(1.8, 1.8, 1);
      return sprite;
    };
    const R = 13;
    return [
      makeLabel('N', new THREE.Vector3(0, 0.2, -R), '#ff6666'),
      makeLabel('S', new THREE.Vector3(0, 0.2, R), '#ffffff'),
      makeLabel('E', new THREE.Vector3(R, 0.2, 0), '#ffaa44'),
      makeLabel('W', new THREE.Vector3(-R, 0.2, 0), '#4488ff'),
    ];
  }, []);
  return <group>{labels.map((s, i) => <primitive key={i} object={s} />)}</group>;
}

/* ========== 星星 ========== */
function SurfaceStars() {
  const [positions, colors] = useMemo(() => {
    const count = 1000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random());
      const r = 22;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = Math.abs(r * Math.cos(phi));
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      const b = 0.4 + Math.random() * 0.6;
      col[i * 3] = b;
      col[i * 3 + 1] = b;
      col[i * 3 + 2] = b + Math.random() * 0.3;
    }
    return [pos, col];
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={1000} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} count={1000} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.12} vertexColors transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ========== 太阳在天空中的位置 ========== */
function SunInSky() {
  const ref = useRef<THREE.Group>(null);
  const sunRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!ref.current) return;
    const state = useStore.getState();
    const { altitude, azimuth } = getSunSkyPosition(state.currentDate, state.targetLatitude, state.targetLongitude);
    const pos = altAzToWorld(altitude, azimuth, 12);
    ref.current.position.copy(pos);

    if (sunRef.current) {
      const mat = sunRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = altitude > 0 ? 1 : Math.max(0, 0.1 + altitude * 2);
    }
  });

  return (
    <group ref={ref}>
      <mesh ref={sunRef}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshBasicMaterial color="#ffdd44" transparent opacity={1} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshBasicMaterial color="#ffcc00" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.3} depthWrite={false} />
      </mesh>
      <pointLight intensity={35} color="#fff5e0" distance={20} />
    </group>
  );
}

/* ========== 太阳轨迹线 ========== */
function SunPathLine() {
  const ref = useRef<THREE.Line>(null);
  const geoRef = useRef<THREE.BufferGeometry>(new THREE.BufferGeometry());

  useFrame(() => {
    const state = useStore.getState();
    const lat = state.targetLatitude;
    const lon = state.targetLongitude;
    const date = state.currentDate;

    const pts: THREE.Vector3[] = [];
    for (let h = 0; h <= 24; h += 0.25) {
      const d = new Date(date);
      d.setHours(Math.floor(h), (h % 1) * 60, 0, 0);
      const { altitude, azimuth } = getSunSkyPosition(d, lat, lon);
      pts.push(altAzToWorld(altitude, azimuth, 12));
    }
    geoRef.current.setFromPoints(pts);
    if (ref.current) ref.current.geometry = geoRef.current;
  });

  return (
    <primitive
      object={useMemo(() => {
        const mat = new THREE.LineBasicMaterial({ color: '#ff8844', transparent: true, opacity: 0.6, depthTest: true, linewidth: 1 });
        return new THREE.Line(new THREE.BufferGeometry(), mat);
      }, [])}
      ref={ref}
    />
  );
}

/* ========== 日出/日落标记点 ========== */
function SunRiseSetMarkers() {
  const riseRef = useRef<THREE.Mesh>(null);
  const setRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const state = useStore.getState();
    const lat = state.targetLatitude;
    const lon = state.targetLongitude;
    const date = state.currentDate;
    const decl = getSolarDeclination(date);

    const sunriseHour = getSunriseHour(lat, decl);
    const sunsetHour = getSunsetHour(lat, decl);

    if (sunriseHour > 0 && sunriseHour < 24) {
      const riseDate = new Date(date);
      const h = Math.floor(sunriseHour);
      const m = Math.round((sunriseHour - h) * 60);
      riseDate.setHours(h, m, 0, 0);
      const { azimuth } = getSunSkyPosition(riseDate, lat, lon);
      const pos = altAzToWorld(0, azimuth, 12);
      if (riseRef.current) riseRef.current.position.copy(pos);
    }

    if (sunsetHour > 0 && sunsetHour < 24) {
      const setDate = new Date(date);
      const h = Math.floor(sunsetHour);
      const m = Math.round((sunsetHour - h) * 60);
      setDate.setHours(h, m, 0, 0);
      const { azimuth } = getSunSkyPosition(setDate, lat, lon);
      const pos = altAzToWorld(0, azimuth, 12);
      if (setRef.current) setRef.current.position.copy(pos);
    }
  });

  return (
    <group>
      <mesh ref={riseRef}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#ff8844" />
      </mesh>
      <mesh ref={setRef}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#8844ff" />
      </mesh>
    </group>
  );
}

/* ========== 正午太阳标记 ========== */
function NoonMarker() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const state = useStore.getState();
    const noonDate = new Date(state.currentDate);
    noonDate.setHours(12, 0, 0, 0);
    const { altitude, azimuth } = getSunSkyPosition(noonDate, state.targetLatitude, state.targetLongitude);
    const pos = altAzToWorld(altitude, azimuth, 12);
    if (ref.current) ref.current.position.copy(pos);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.25, 16, 16]} />
      <meshBasicMaterial color="#ffdd00" />
    </mesh>
  );
}

/* ========== 太阳高度角指示线（虚线从太阳到地面投影） ========== */
function SunAltitudeIndicator() {
  const ref = useRef<THREE.Line>(null);
  const geoRef = useRef<THREE.BufferGeometry>(new THREE.BufferGeometry());

  useFrame(() => {
    const state = useStore.getState();
    const { altitude, azimuth } = getSunSkyPosition(state.currentDate, state.targetLatitude, state.targetLongitude);
    const sunPos = altAzToWorld(altitude, azimuth, 12);
    const groundPos = new THREE.Vector3(sunPos.x, 0, sunPos.z);
    const pts = [sunPos, groundPos];

    // 虚线效果：分段
    const dashedPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      if (Math.floor(i) % 2 === 0) {
        const dt = Math.min(1 / 20, 1 / 20);
        const start = new THREE.Vector3().lerpVectors(sunPos, groundPos, t);
        const end = new THREE.Vector3().lerpVectors(sunPos, groundPos, Math.min(t + dt, 1));
        dashedPts.push(start, end);
      }
    }
    geoRef.current.setFromPoints(dashedPts);
    if (ref.current) ref.current.geometry = geoRef.current;
  });

  return (
    <primitive
      object={useMemo(() => {
        const mat = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.25, depthTest: true });
        return new THREE.Line(new THREE.BufferGeometry(), mat);
      }, [])}
      ref={ref}
    />
  );
}

/* ========== 地面投影点 ========== */
function GroundProjection() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const state = useStore.getState();
    const { altitude, azimuth } = getSunSkyPosition(state.currentDate, state.targetLatitude, state.targetLongitude);
    const sunPos = altAzToWorld(altitude, azimuth, 12);
    if (ref.current) ref.current.position.set(sunPos.x, 0.02, sunPos.z);
  });

  return (
    <mesh ref={ref} rotation-x={-Math.PI / 2}>
      <ringGeometry args={[0.15, 0.3, 32]} />
      <meshBasicMaterial color="#ffcc00" transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

/* ========== 天顶标记 ========== */
function ZenithMarker() {
  const dot = useMemo(() => {
    const g = new THREE.RingGeometry(0.1, 0.25, 32);
    const m = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false });
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(0, 12, 0);
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
  }, []);
  return <primitive object={dot} />;
}

/* ========== 相机控制器 ========== */
function SurfaceCamera() {
  const controlsRef = useRef<any>(null);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      target={[0, 2, -5]}
      minPolarAngle={0.2}
      maxPolarAngle={Math.PI * 0.85}
      minDistance={1}
      maxDistance={15}
      maxAzimuthAngle={Infinity}
      minAzimuthAngle={-Infinity}
    />
  );
}

/* ========== 场景内容 ========== */
function SurfaceContent() {
  return (
    <>
      <SkyDome />
      <SurfaceStars />
      <GroundPlane />
      <HorizonRing />
      <MeridianLine />
      <DirectionLabels />
      <ZenithMarker />
      <SunInSky />
      <SunPathLine />
      <SunRiseSetMarkers />
      <NoonMarker />
      <SunAltitudeIndicator />
      <GroundProjection />
      <SolarAltitudeApp />
        <TimeManager />
        <ambientLight intensity={0.5} />
      <SurfaceCamera />
    </>
  );
}

/* ========== 导出 ========== */
export default function SurfaceScene() {
  return (
    <Canvas
      camera={{ position: [0, 1.7, 0], fov: 65 }}
      gl={{ antialias: true, alpha: false }}
      style={{ width: '100%', height: '100%', background: '#0a0e27' }}
    >
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <SurfaceContent />
        </Suspense>
      </ErrorBoundary>
    </Canvas>
  );
}