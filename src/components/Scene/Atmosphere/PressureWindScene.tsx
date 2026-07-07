import { useStore } from '@/store/useStore';
import {
  PRESSURE_ZONES,
  WIND_BELTS,
  CIRCULATION_CELLS,
  getSeasonalShift,
} from '@/data/atmosphere/pressureWindData';
import { PressureZoneRing } from './PressureZoneRing';
import { PressureZoneLabel } from './PressureZoneLabel';
import { WindBeltParticles } from './WindBeltParticles';
import { CirculationCell } from './CirculationCell';
import { SeasonalShiftGroup } from './SeasonalShiftGroup';

const EARTH_RADIUS = 5;

export function PressureWindScene() {
  const month = useStore((s) => s.month);
  const showPressureZones = useStore((s) => s.showPressureZones);
  const showWindBelts = useStore((s) => s.showWindBelts);
  const showCirculationCells = useStore((s) => s.showCirculationCells);

  const seasonalShift = getSeasonalShift(month);

  return (
    <group>
      <SeasonalShiftGroup earthRadius={EARTH_RADIUS}>
        {PRESSURE_ZONES.map((zone) => (
          <group key={zone.id}>
            <PressureZoneRing
              config={zone}
              earthRadius={EARTH_RADIUS}
              seasonalShift={seasonalShift}
              visible={showPressureZones}
            />
            <PressureZoneLabel
              config={zone}
              earthRadius={EARTH_RADIUS}
              seasonalShift={seasonalShift}
            />
          </group>
        ))}

        {WIND_BELTS.map((belt) => (
          <WindBeltParticles
            key={belt.id}
            config={belt}
            earthRadius={EARTH_RADIUS}
            seasonalShift={seasonalShift}
            visible={showWindBelts}
          />
        ))}

        {CIRCULATION_CELLS.map((cell) => (
          <CirculationCell
            key={cell.id}
            config={cell}
            earthRadius={EARTH_RADIUS}
            seasonalShift={seasonalShift}
            visible={showCirculationCells}
          />
        ))}
      </SeasonalShiftGroup>
    </group>
  );
}
