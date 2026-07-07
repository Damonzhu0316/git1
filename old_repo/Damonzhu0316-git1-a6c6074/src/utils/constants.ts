export const EARTH_TILT = 23.44; // 黄赤交角（度）
export const EARTH_RADIUS = 2;
export const SUN_RADIUS = 2.5;
export const MOON_RADIUS = 0.5;
export const EARTH_ORBIT_RADIUS = 12;
export const MOON_ORBIT_RADIUS = 3.5;
export const ORBIT_ECCENTRICITY = 0.35; // 轨道偏心率（教学夸张值，真实值≈0.0167）
export const DAYS_PER_YEAR = 365.25;
export const TIME_SPEED_MIN = 0;
export const TIME_SPEED_MAX = 100;

export const SEASON_DAYS = {
  springEquinox: 80,   // 春分（3月21日左右，第80天）
  summerSolstice: 172, // 夏至（6月21日左右，第172天）
  autumnEquinox: 266,  // 秋分（9月23日左右，第266天）
  winterSolstice: 355, // 冬至（12月22日左右，第355天）
};

export const CAMERA_PRESETS = {
  free: { position: [0, 8, 18], target: [0, 0, 0] },
  top: { position: [0, 20, 0.1], target: [0, 0, 0] },
  side: { position: [0, 0, 20], target: [0, 0, 0] },
  northPole: { position: [0, 5, 0.1], target: [0, 0, 0] },
  equator: { position: [18, 0, 0], target: [0, 0, 0] },
} as const;