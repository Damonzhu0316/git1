import { useMemo } from 'react';
import * as THREE from 'three';

interface ClimateZone {
  name: string;
  latStart: number;
  latEnd: number;
  color: string;
  climate: string;
  features: string;
}

const CLIMATE_ZONES: ClimateZone[] = [
  {
    name: '热带雨林气候区',
    latStart: -10,
    latEnd: 10,
    color: '#1B5E20',
    climate: '热带雨林气候',
    features: '终年高温多雨',
  },
  {
    name: '热带草原/沙漠气候区',
    latStart: 10,
    latEnd: 23.5,
    color: '#F57F17',
    climate: '热带草原/沙漠气候',
    features: '干湿季分明/炎热干燥',
  },
  {
    name: '地中海气候区',
    latStart: 23.5,
    latEnd: 35,
    color: '#E65100',
    climate: '地中海气候',
    features: '夏季炎热干燥，冬季温和多雨',
  },
  {
    name: '温带季风/大陆性气候区',
    latStart: 35,
    latEnd: 55,
    color: '#1565C0',
    climate: '温带季风/大陆性气候',
    features: '四季分明，雨热同期',
  },
  {
    name: '温带海洋性气候区',
    latStart: 40,
    latEnd: 60,
    color: '#00695C',
    climate: '温带海洋性气候',
    features: '终年温和湿润',
  },
  {
    name: '亚寒带/寒带气候区',
    latStart: 55,
    latEnd: 90,
    color: '#455A64',
    climate: '亚寒带针叶林/极地气候',
    features: '寒冷漫长',
  },
];

const EARTH_RADIUS = 5;

export function ClimateZoneScene() {
  const zones = useMemo(() => {
    return CLIMATE_ZONES.map((zone) => {
      const latStartRad = THREE.MathUtils.degToRad(zone.latStart);
      const latEndRad = THREE.MathUtils.degToRad(zone.latEnd);
      const avgLat = (latStartRad + latEndRad) / 2;
      const height = Math.abs(Math.sin(latEndRad) - Math.sin(latStartRad)) * EARTH_RADIUS;
      const y = EARTH_RADIUS * Math.sin(avgLat);
      const radius = EARTH_RADIUS * Math.cos(avgLat) + 0.05;

      return { ...zone, y, height, radius };
    });
  }, []);

  return (
    <group>
      {zones.map((zone) => (
        <mesh key={zone.name} position={[0, zone.y, 0]}>
          <cylinderGeometry args={[zone.radius, zone.radius, zone.height, 64, 1, true]} />
          <meshPhongMaterial
            color={zone.color}
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* 南半球对称 */}
      {zones.map((zone) => (
        <mesh key={`${zone.name}-south`} position={[0, -zone.y, 0]}>
          <cylinderGeometry args={[zone.radius, zone.radius, zone.height, 64, 1, true]} />
          <meshPhongMaterial
            color={zone.color}
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
