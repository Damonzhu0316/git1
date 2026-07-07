import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { getSunSkyPosition, getSolarDeclination, getNoonSolarAltitude, getEquinoxSolsticeDates } from '@/utils/astronomy';

/* ========== 工具函数 ========== */

/** 根据高度角/方位角计算太阳方向单位向量 */
function sunDirFromAltAz(altitude: number, azimuth: number): THREE.Vector3 {
  return new THREE.Vector3(
    Math.cos(altitude) * Math.sin(azimuth),
    Math.sin(altitude),
    -Math.cos(altitude) * Math.cos(azimuth),
  ).normalize();
}

/** 创建 Sprite 文字标签 */
function makeSpriteLabel(
  text: string,
  pos: THREE.Vector3,
  color = '#ffffff',
  scaleW = 4,
  scaleH = 1,
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 32);
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.position.copy(pos);
  sprite.scale.set(scaleW, scaleH, 1);
  return sprite;
}

/* ===================================================================
 * Mode 1: 楼间距演示 (buildingShadow) — 多栋建筑小区
 * =================================================================== */

/** 单栋建筑 + 其影子 */
function BuildingUnit({
  bx, bz, bw, bh, bd, color, label,
}: {
  bx: number; bz: number; bw: number; bh: number; bd: number;
  color: string; label: string;
}) {
  const shadowGeoRef = useRef<THREE.BufferGeometry>(new THREE.BufferGeometry());
  const shadowMeshRef = useRef<THREE.Mesh>(null);
  const posAttrRef = useRef<THREE.BufferAttribute | null>(null);
  // 预分配影子顶点数组（6个三角形 × 3顶点 × 3坐标 = 54个float）
  const vertsRef = useRef<Float32Array>(new Float32Array(54));

  const topCorners = useMemo(() => [
    new THREE.Vector3(bx - bw / 2, bh, bz - bd / 2),
    new THREE.Vector3(bx + bw / 2, bh, bz - bd / 2),
    new THREE.Vector3(bx + bw / 2, bh, bz + bd / 2),
    new THREE.Vector3(bx - bw / 2, bh, bz + bd / 2),
  ], [bx, bz, bw, bh, bd]);

  const baseCorners = useMemo(() => [
    new THREE.Vector3(bx - bw / 2, 0.005, bz - bd / 2),
    new THREE.Vector3(bx + bw / 2, 0.005, bz - bd / 2),
    new THREE.Vector3(bx + bw / 2, 0.005, bz + bd / 2),
    new THREE.Vector3(bx - bw / 2, 0.005, bz + bd / 2),
  ], [bx, bz, bw, bd]);

  const nameSprite = useMemo(() => makeSpriteLabel(label, new THREE.Vector3(bx, bh + 0.8, bz), '#ffcc88', 2.5, 0.6), [bx, bz, bh, label]);

  const shadowMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#000000', transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false,
  }), []);

  const _p0 = useMemo(() => new THREE.Vector3(), []);
  const _p1 = useMemo(() => new THREE.Vector3(), []);
  const _p2 = useMemo(() => new THREE.Vector3(), []);
  const _p3 = useMemo(() => new THREE.Vector3(), []);

  // 初始化 BufferAttribute（只创建一次）
  const initRef = useRef(false);
  if (!initRef.current) {
    const attr = new THREE.BufferAttribute(vertsRef.current, 3);
    posAttrRef.current = attr;
    shadowGeoRef.current.setAttribute('position', attr);
    initRef.current = true;
  }

  useFrame(() => {
    const state = useStore.getState();
    const { altitude, azimuth } = getSunSkyPosition(state.currentDate, state.targetLatitude, state.targetLongitude);
    const sunDir = sunDirFromAltAz(altitude, azimuth);
    if (altitude <= 0.03) { if (shadowMeshRef.current) shadowMeshRef.current.visible = false; return; }
    if (shadowMeshRef.current) shadowMeshRef.current.visible = true;
    const dy = sunDir.y; if (Math.abs(dy) < 0.005) return;

    const proj = [_p0, _p1, _p2, _p3];
    topCorners.forEach((c, i) => { const t = c.y / dy; proj[i].set(c.x - sunDir.x * t, 0.01, c.z - sunDir.z * t); });

    const dots = baseCorners.map((c) => c.x * sunDir.x + c.z * sunDir.z);
    const sorted = dots.map((d, i) => ({ d, i })).sort((a, b) => b.d - a.d).map((x) => x.i);
    const far = [baseCorners[sorted[0]], baseCorners[sorted[1]]];

    // 复用预分配的 Float32Array，避免每帧创建新对象
    const fa = vertsRef.current;
    let idx = 0;
    const addTri = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => {
      fa[idx++] = a.x; fa[idx++] = a.y; fa[idx++] = a.z;
      fa[idx++] = b.x; fa[idx++] = b.y; fa[idx++] = b.z;
      fa[idx++] = c.x; fa[idx++] = c.y; fa[idx++] = c.z;
    };
    addTri(far[0], far[1], proj[0]); addTri(far[1], proj[1], proj[0]);
    addTri(far[1], proj[2], proj[1]); addTri(far[1], far[0], proj[3]);
    addTri(proj[0], proj[1], proj[2]); addTri(proj[0], proj[2], proj[3]);

    posAttrRef.current!.needsUpdate = true;
    shadowGeoRef.current.computeVertexNormals();
  });

  return (
    <group>
      <mesh position={[bx, bh / 2, bz]} castShadow>
        <boxGeometry args={[bw, bh, bd]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.1} />
      </mesh>
      <lineSegments position={[bx, bh / 2, bz]}>
        <edgesGeometry args={[new THREE.BoxGeometry(bw, bh, bd)]} />
        <lineBasicMaterial color="#334455" transparent opacity={0.5} />
      </lineSegments>
      <mesh ref={shadowMeshRef} geometry={shadowGeoRef.current} material={shadowMat} />
      <primitive object={nameSprite} />
    </group>
  );
}

function BuildingShadow() {
  const spacingSpriteRef = useRef<THREE.Sprite | null>(null);
  const spacingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const spacingTexRef = useRef<THREE.CanvasTexture | null>(null);

  const label = useMemo(() => makeSpriteLabel('楼间距演示', new THREE.Vector3(0, 5.5, 5), '#ffcc88'), []);

  useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 64;
    const tex = new THREE.CanvasTexture(canvas); tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(0, 0.3, 6.5); sprite.scale.set(3, 0.75, 1);
    spacingSpriteRef.current = sprite; spacingCanvasRef.current = canvas; spacingTexRef.current = tex;
  }, []);

  const lat = useStore((s) => s.targetLatitude);
  const currentDate = useStore((s) => s.currentDate);
  const winterSolstice = useMemo(() => getEquinoxSolsticeDates(currentDate.getFullYear()).winter, [currentDate.getFullYear()]);
  const wsDecl = getSolarDeclination(winterSolstice);
  const wsNoonAlt = getNoonSolarAltitude(lat, wsDecl);

  useMemo(() => {
    if (!spacingCanvasRef.current || !spacingTexRef.current) return;
    const ctx = spacingCanvasRef.current.getContext('2d')!;
    ctx.clearRect(0, 0, 256, 64);
    ctx.fillStyle = '#ffcc88'; ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const h = wsNoonAlt > 0 ? (4.5 / Math.tan(wsNoonAlt * Math.PI / 180)).toFixed(1) : '—';
    ctx.fillText(`冬至正午 楼间距 ≥ ${h}m`, 128, 32);
    spacingTexRef.current.needsUpdate = true;
  }, [lat, wsNoonAlt]);

  return (
    <group>
      {/* 建筑 A：矮楼 2.5m */}
      <BuildingUnit bx={-4.5} bz={3} bw={1.5} bh={2.5} bd={1.5} color="#8899aa" label="6层住宅" />
      {/* 建筑 B：中间高楼 4.5m */}
      <BuildingUnit bx={0} bz={3} bw={1.8} bh={4.5} bd={1.8} color="#7788aa" label="12层住宅" />
      {/* 建筑 C：右侧楼 3m */}
      <BuildingUnit bx={4.5} bz={3} bw={1.5} bh={3.0} bd={1.5} color="#8899aa" label="8层住宅" />
      {/* 总标题 */}
      <primitive object={label} />
      {spacingSpriteRef.current && <primitive object={spacingSpriteRef.current} />}
    </group>
  );
}

/* ===================================================================
 * Mode 2: 太阳能板倾角 (solarPanel)
 * =================================================================== */

function SolarPanel() {
  const rayRef = useRef<THREE.Line>(null);
  const rayGeoRef = useRef<THREE.BufferGeometry>(new THREE.BufferGeometry());
  const angleSpriteRef = useRef<THREE.Sprite | null>(null);
  const angleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const angleTextureRef = useRef<THREE.CanvasTexture | null>(null);

  // 面板位置
  const panelPos = useMemo(() => new THREE.Vector3(0, 0.8, -3), []);
  const panelW = 2.0;
  const panelH = 1.2;

  const label = useMemo(
    () => makeSpriteLabel('太阳能板倾角', new THREE.Vector3(0, 2.5, -3), '#88ccff'),
    [],
  );

  const rayMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: '#ffdd44',
        transparent: true,
        opacity: 0.7,
        depthTest: true,
      }),
    [],
  );

  // 复用的临时向量
  const _sunPos = useMemo(() => new THREE.Vector3(), []);
  const _pts = useMemo(() => [new THREE.Vector3(), new THREE.Vector3()], []);

  // 初始化角度标签（只创建一次）
  useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(0, 1.3, -3);
    sprite.scale.set(3, 0.75, 1);
    angleSpriteRef.current = sprite;
    angleCanvasRef.current = canvas;
    angleTextureRef.current = tex;
  }, []);

  // 获取当前纬度用于面板倾角
  const lat = useStore((s) => s.targetLatitude);

  useFrame(() => {
    const state = useStore.getState();
    const { altitude, azimuth } = getSunSkyPosition(
      state.currentDate,
      state.targetLatitude,
      state.targetLongitude,
    );

    // 更新角度标签文字（复用 canvas，只更新内容）
    if (angleCanvasRef.current && angleTextureRef.current) {
      const canvas = angleCanvasRef.current;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const optimalAngle = Math.abs(state.targetLatitude);
      ctx.fillText(`最佳倾角 ≈ ${optimalAngle.toFixed(0)}°`, 128, 32);
      angleTextureRef.current.needsUpdate = true;
    }

    // 更新太阳射线（复用向量）
    const sunDir = sunDirFromAltAz(altitude, azimuth);
    const sunDist = 12;
    _sunPos.set(sunDist * sunDir.x, sunDist * sunDir.y, sunDist * sunDir.z);

    _pts[0].copy(_sunPos);
    _pts[1].copy(panelPos);
    rayGeoRef.current.setFromPoints(_pts);
    if (rayRef.current) rayRef.current.geometry = rayGeoRef.current;
  });

  return (
    <group>
      {/* 面板底座/支架 */}
      <mesh position={[panelPos.x, 0.15, panelPos.z]}>
        <cylinderGeometry args={[0.08, 0.12, 0.3, 8]} />
        <meshStandardMaterial color="#556677" roughness={0.5} />
      </mesh>

      {/* 太阳能板（绕 X 轴向南倾斜，倾斜角 = 纬度） */}
      <group
        position={[panelPos.x, panelPos.y, panelPos.z]}
        rotation-x={lat >= 0 ? -Math.abs(lat) * (Math.PI / 180) : Math.abs(lat) * (Math.PI / 180)}
      >
        {/* 面板主体 */}
        <mesh>
          <planeGeometry args={[panelW, panelH]} />
          <meshStandardMaterial
            color="#2244aa"
            roughness={0.3}
            metalness={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* 面板边框 */}
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(panelW, panelH)]} />
          <lineBasicMaterial color="#4488ff" transparent opacity={0.6} />
        </lineSegments>
        {/* 网格线模拟太阳能电池片 */}
        <group>
          {[-0.5, 0, 0.5].map((ox) => (
            <line key={`v${ox}`}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[
                    new Float32Array([ox, -panelH / 2, 0.001, ox, panelH / 2, 0.001]),
                    3,
                  ]}
                  count={2}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#3366cc" transparent opacity={0.3} />
            </line>
          ))}
          {[-0.3, 0, 0.3].map((oy) => (
            <line key={`h${oy}`}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[
                    new Float32Array([-panelW / 2, oy, 0.001, panelW / 2, oy, 0.001]),
                    3,
                  ]}
                  count={2}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#3366cc" transparent opacity={0.3} />
            </line>
          ))}
        </group>
      </group>

      {/* 太阳射线 */}
      <primitive
        object={useMemo(() => new THREE.Line(new THREE.BufferGeometry(), rayMat), [rayMat])}
        ref={rayRef}
      />

      {/* 标签 */}
      <primitive object={label} />
      {angleSpriteRef.current && <primitive object={angleSpriteRef.current} />}
    </group>
  );
}

/* ===================================================================
 * Mode 3: 日晷原理 (sundial)
 * =================================================================== */

function Sundial() {
  const shadowLineRef = useRef<THREE.Line>(null);
  const shadowGeoRef = useRef<THREE.BufferGeometry>(new THREE.BufferGeometry());
  const gnomonGroupRef = useRef<THREE.Group>(null);

  const sundialPos = useMemo(() => new THREE.Vector3(0, 0.05, -1.5), []);
  const baseRadius = 1.2;

  const label = useMemo(
    () => makeSpriteLabel('日晷原理', new THREE.Vector3(0, 1.8, -1.5), '#ffcc88'),
    [],
  );

  const baseGeo = useMemo(
    () => new THREE.CylinderGeometry(baseRadius, baseRadius, 0.08, 64),
    [],
  );
  const baseMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ddd5c0',
        roughness: 0.6,
        metalness: 0.05,
      }),
    [],
  );

  const hourLines = useMemo(() => {
    const lines: THREE.Line[] = [];
    const mat = new THREE.LineBasicMaterial({
      color: '#998877',
      transparent: true,
      opacity: 0.5,
      depthTest: true,
    });
    for (let h = 6; h <= 18; h++) {
      const angle = ((h - 12) / 12) * Math.PI;
      const innerR = 0.15;
      const outerR = baseRadius - 0.1;
      const pts = [
        new THREE.Vector3(innerR * Math.sin(angle), 0.045, innerR * Math.cos(angle)),
        new THREE.Vector3(outerR * Math.sin(angle), 0.045, outerR * Math.cos(angle)),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      lines.push(new THREE.Line(geo, mat));
    }
    return lines;
  }, []);

  const hourLabels = useMemo(() => {
    return [6, 8, 10, 12, 14, 16, 18].map((h) => {
      const angle = ((h - 12) / 12) * Math.PI;
      const r = baseRadius - 0.25;
      const pos = new THREE.Vector3(r * Math.sin(angle), 0.1, r * Math.cos(angle));
      return makeSpriteLabel(`${h}`, pos, '#998877', 0.8, 0.5);
    });
  }, []);

  const gnomonGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const gnomonH = 0.7;
    const gnomonBase = 0.3;
    shape.moveTo(0, 0);
    shape.lineTo(0, gnomonH);
    shape.lineTo(gnomonBase, 0);
    shape.closePath();
    const extrudeSettings = { steps: 1, depth: 0.04, bevelEnabled: false };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  const gnomonMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#8B7355',
        roughness: 0.4,
        metalness: 0.3,
      }),
    [],
  );

  const shadowMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: '#333333',
        transparent: true,
        opacity: 0.55,
        depthTest: true,
      }),
    [],
  );

  // 复用的临时向量
  const _tipWorld = useMemo(() => new THREE.Vector3(), []);
  const _shadowTip = useMemo(() => new THREE.Vector3(), []);
  const _baseCenter = useMemo(() => new THREE.Vector3(), []);
  const _shadowPts = useMemo(() => [new THREE.Vector3(), new THREE.Vector3()], []);

  useFrame(() => {
    const state = useStore.getState();
    const lat = state.targetLatitude;

    // 更新晷针倾斜
    if (gnomonGroupRef.current) {
      gnomonGroupRef.current.rotation.set(0, 0, 0);
      const tiltAngle = (lat * Math.PI) / 180;
      gnomonGroupRef.current.rotation.x = -(Math.PI / 2 - tiltAngle);
      gnomonGroupRef.current.rotation.y = Math.PI;
    }

    // 更新影子
    const { altitude, azimuth } = getSunSkyPosition(
      state.currentDate,
      state.targetLatitude,
      state.targetLongitude,
    );

    if (altitude <= 0.02) {
      if (shadowLineRef.current) shadowLineRef.current.visible = false;
      return;
    }
    if (shadowLineRef.current) shadowLineRef.current.visible = true;

    const sunDir = sunDirFromAltAz(altitude, azimuth);
    const dy = sunDir.y;
    if (Math.abs(dy) < 0.005) return;

    // 晷针顶点（尖端）
    const gnomonTipY = 0.7;
    _tipWorld.set(sundialPos.x, sundialPos.y + gnomonTipY, sundialPos.z);

    const baseY = sundialPos.y + 0.045;
    const t = (_tipWorld.y - baseY) / dy;
    _shadowTip.set(
      _tipWorld.x - sunDir.x * t,
      baseY,
      _tipWorld.z - sunDir.z * t,
    );

    _baseCenter.set(sundialPos.x, baseY, sundialPos.z);

    // 复用 BufferGeometry，只更新点数据
    _shadowPts[0].copy(_baseCenter);
    _shadowPts[1].copy(_shadowTip);
    shadowGeoRef.current.setFromPoints(_shadowPts);
    if (shadowLineRef.current) {
      shadowLineRef.current.geometry = shadowGeoRef.current;
    }
  });

  return (
    <group>
      <mesh
        geometry={baseGeo}
        material={baseMat}
        position={[sundialPos.x, sundialPos.y, sundialPos.z]}
      />
      <lineSegments position={[sundialPos.x, sundialPos.y + 0.041, sundialPos.z]}>
        <edgesGeometry args={[new THREE.CylinderGeometry(baseRadius, baseRadius, 0.08, 64)]} />
        <lineBasicMaterial color="#aa9966" transparent opacity={0.4} />
      </lineSegments>

      <group position={[sundialPos.x, sundialPos.y, sundialPos.z]}>
        {hourLines.map((line, i) => (
          <primitive key={i} object={line} />
        ))}
      </group>

      <group>{hourLabels.map((s, i) => <primitive key={i} object={s} />)}</group>

      <group
        ref={gnomonGroupRef}
        position={[sundialPos.x, sundialPos.y + 0.04, sundialPos.z]}
      >
        <mesh geometry={gnomonGeo} material={gnomonMat} />
      </group>

      <primitive
        object={useMemo(
          () => new THREE.Line(new THREE.BufferGeometry(), shadowMat),
          [shadowMat],
        )}
        ref={shadowLineRef}
      />

      <primitive object={label} />
    </group>
  );
}

/* ===================================================================
 * Mode 4: 标杆日影 (shadowPole) — 始终显示，独立于应用模式
 * =================================================================== */

function ShadowPole() {
  const poleGroupRef = useRef<THREE.Group>(null);
  const shadowLineRef = useRef<THREE.Line>(null);
  const shadowGeoRef = useRef<THREE.BufferGeometry>(new THREE.BufferGeometry());
  const shadowPlaneRef = useRef<THREE.Mesh>(null);
  const shadowPlaneGeoRef = useRef<THREE.BufferGeometry>(new THREE.BufferGeometry());
  const lengthSpriteRef = useRef<THREE.Sprite | null>(null);
  const lengthCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lengthTexRef = useRef<THREE.CanvasTexture | null>(null);

  const polePos = useMemo(() => new THREE.Vector3(3, 0, 2), []);
  const poleHeight = 3;
  const poleRadius = 0.08;

  // 底座
  const baseGeo = useMemo(() => new THREE.CylinderGeometry(0.2, 0.25, 0.15, 16), []);
  const baseMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#888877', roughness: 0.5, metalness: 0.2 }), []);

  const label = useMemo(() => makeSpriteLabel('标杆日影', new THREE.Vector3(3, poleHeight + 1.0, 2), '#44ff88'), []);

  // 初始化影长标签
  useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(3, 0.3, 2);
    sprite.scale.set(3, 0.75, 1);
    lengthSpriteRef.current = sprite;
    lengthCanvasRef.current = canvas;
    lengthTexRef.current = tex;
  }, []);

  // 复用的临时向量
  const _tip = useMemo(() => new THREE.Vector3(), []);
  const _shadowEnd = useMemo(() => new THREE.Vector3(), []);
  const _shadowPts = useMemo(() => [new THREE.Vector3(), new THREE.Vector3()], []);
  const _sunDir = useMemo(() => new THREE.Vector3(), []);
  const _projA = useMemo(() => new THREE.Vector3(), []);
  const _projB = useMemo(() => new THREE.Vector3(), []);
  const _projC = useMemo(() => new THREE.Vector3(), []);
  const _projD = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const state = useStore.getState();
    const { altitude, azimuth } = getSunSkyPosition(state.currentDate, state.targetLatitude, state.targetLongitude);
    const sunDir = sunDirFromAltAz(altitude, azimuth);

    const tipY = polePos.y + poleHeight;

    if (altitude <= 0.01) {
      if (shadowLineRef.current) shadowLineRef.current.visible = false;
      if (shadowPlaneRef.current) shadowPlaneRef.current.visible = false;
      if (lengthSpriteRef.current) lengthSpriteRef.current.visible = false;
      return;
    }

    const dy = sunDir.y;
    if (Math.abs(dy) < 0.003) return;

    // 杆顶投影到地面
    _tip.set(polePos.x, tipY, polePos.z);
    const t = (_tip.y - 0.01) / dy;
    _shadowEnd.set(_tip.x - sunDir.x * t, 0.01, _tip.z - sunDir.z * t);

    // 影长
    const shadowLen = _shadowEnd.distanceTo(new THREE.Vector3(polePos.x, 0.01, polePos.z));

    // 更新影长标签
    if (lengthCanvasRef.current && lengthTexRef.current) {
      const canvas = lengthCanvasRef.current;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#44ff88';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`影长 ${shadowLen.toFixed(2)}m`, 128, 32);
      lengthTexRef.current.needsUpdate = true;
    }

    if (shadowLineRef.current) {
      shadowLineRef.current.visible = true;
      _shadowPts[0].set(polePos.x, 0.015, polePos.z);
      _shadowPts[1].copy(_shadowEnd);
      shadowGeoRef.current.setFromPoints(_shadowPts);
      shadowLineRef.current.geometry = shadowGeoRef.current;
    }

    // 影长标签位置（影子中点）
    if (lengthSpriteRef.current) {
      lengthSpriteRef.current.visible = true;
      lengthSpriteRef.current.position.set(
        (polePos.x + _shadowEnd.x) / 2,
        0.25,
        (polePos.z + _shadowEnd.z) / 2,
      );
    }

    // 阴影面（杆底到影子末端的三角面）
    if (shadowPlaneRef.current) {
      shadowPlaneRef.current.visible = true;
      const base = new THREE.Vector3(polePos.x, 0.01, polePos.z);
      const dir = _shadowEnd.clone().sub(base).normalize();
      const perp = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
      const halfW = 0.04;
      _projA.copy(base).addScaledVector(perp, halfW);
      _projB.copy(base).addScaledVector(perp, -halfW);
      _projC.copy(_shadowEnd).addScaledVector(perp, -halfW);
      _projD.copy(_shadowEnd).addScaledVector(perp, halfW);
      const verts = new Float32Array([
        _projA.x, _projA.y, _projA.z,
        _projB.x, _projB.y, _projB.z,
        _projC.x, _projC.y, _projC.z,
        _projA.x, _projA.y, _projA.z,
        _projC.x, _projC.y, _projC.z,
        _projD.x, _projD.y, _projD.z,
      ]);
      shadowPlaneGeoRef.current.setAttribute('position', new THREE.BufferAttribute(verts, 3));
      shadowPlaneGeoRef.current.computeVertexNormals();
      shadowPlaneRef.current.geometry = shadowPlaneGeoRef.current;
    }
  });

  return (
    <group>
      {/* 底座 */}
      <mesh geometry={baseGeo} material={baseMat} position={[polePos.x, 0.075, polePos.z]} />
      {/* 标杆 */}
      <mesh position={[polePos.x, poleHeight / 2, polePos.z]} castShadow>
        <cylinderGeometry args={[poleRadius, poleRadius * 1.2, poleHeight, 16]} />
        <meshStandardMaterial color="#cc9966" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* 杆顶小球 */}
      <mesh position={[polePos.x, poleHeight, polePos.z]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#ff6644" />
      </mesh>
      {/* 影子线 */}
      <primitive
        object={useMemo(() => {
          const mat = new THREE.LineBasicMaterial({ color: '#44ff88', transparent: true, opacity: 0.7, depthTest: true });
          return new THREE.Line(new THREE.BufferGeometry(), mat);
        }, [])}
        ref={shadowLineRef}
      />
      {/* 影子面 */}
      <mesh
        ref={shadowPlaneRef}
        material={useMemo(() => new THREE.MeshBasicMaterial({ color: '#44ff88', transparent: true, opacity: 0.15, side: THREE.DoubleSide, depthWrite: false }), [])}
      />
      {/* 标签 */}
      <primitive object={label} />
      {lengthSpriteRef.current && <primitive object={lengthSpriteRef.current} />}
    </group>
  );
}

/* ===================================================================
 * 主组件
 * =================================================================== */

export default function SolarAltitudeApp() {
  const mode = useStore((s) => s.solarAppMode);

  return (
    <group>
      {/* 标杆日影始终显示 */}
      <ShadowPole />
      {mode === 'buildingShadow' && <BuildingShadow />}
      {mode === 'solarPanel' && <SolarPanel />}
      {mode === 'sundial' && <Sundial />}
    </group>
  );
}