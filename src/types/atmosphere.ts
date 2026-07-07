export type AtmosphereSceneMode =
  | 'pressure-wind'
  | 'circulation'
  | 'seasonal-shift'
  | 'land-sea'
  | 'monsoon'
  | 'cold-front'
  | 'warm-front'
  | 'stationary-front'
  | 'cyclone'
  | 'anticyclone'
  | 'typhoon'
  | 'climate-zone';

export type Hemisphere = 'north' | 'south';

export interface PressureZoneConfig {
  id: string;
  name: string;
  latCenter: number;
  latSpan: number;
  type: 'low' | 'high';
  color: string;
  description: string;
}

export interface WindBeltConfig {
  id: string;
  name: string;
  latStart: number;
  latEnd: number;
  direction: 'east' | 'west' | 'northeast' | 'southeast' | 'northwest' | 'southwest';
  color: string;
}

export interface CirculationCellConfig {
  id: string;
  name: string;
  latStart: number;
  latEnd: number;
  type: 'hadley' | 'ferrel' | 'polar';
  ascentLat: number;
  descentLat: number;
}

export interface FrontConfig {
  type: 'cold' | 'warm' | 'stationary';
  advanceSpeed: number;
  slopeAngle: number;
  precipitationWidth: number;
}

export interface CycloneConfig {
  type: 'cyclone' | 'anticyclone';
  hemisphere: Hemisphere;
  centerPressure: number;
  pressureGradient: number;
}

export interface AtmosphereState {
  sceneMode: AtmosphereSceneMode;
  hemisphere: Hemisphere;
  month: number;
  isPlaying: boolean;
  animationSpeed: number;
  showPressureZones: boolean;
  showWindBelts: boolean;
  showCirculationCells: boolean;
  showFront: boolean;
  showCyclone: boolean;
  selectedFront: 'cold' | 'warm' | 'stationary' | null;
  selectedCyclone: 'cyclone' | 'anticyclone' | null;
  showQuiz: boolean;
  currentQuizIndex: number;
  quizScore: number;
  quizAnswers: Record<string, string>;
}
