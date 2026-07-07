export interface KnowledgePoint {
  id: string;
  name: string;
  icon: string;
  description: string;
  views?: ViewMode[];
  children?: KnowledgePoint[];
  actions?: KnowledgeAction[];
}

export interface KnowledgeAction {
  id: string;
  label: string;
  type: 'toggle' | 'preset' | 'date' | 'focusEarth' | 'setSpeed' | 'setLatLon';
  key: string;
  value?: boolean | string;
}

export type QuestionType = 'choice' | 'fill-blank' | 'short-answer' | 'diagram';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  category: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  source?: string;
  title: string;
  options?: string[];
  answer: number | string;
  explanation?: string;
  sceneConfig?: SceneConfig;
  diagramUrl?: string;
  keyPoints?: string[];
}

export interface AnswerRecord {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timestamp: number;
  timeSpent?: number;
}

export interface ExamStats {
  totalAnswered: number;
  correctCount: number;
  wrongQuestionIds: string[];
  categoryStats: Record<string, { total: number; correct: number }>;
  recentRecords: AnswerRecord[];
}

export interface SceneConfig {
  date?: string;
  cameraPreset?: CameraPreset;
  highlightLatitude?: number;
  highlightLongitude?: number;
  showTerminator?: boolean;
  showEquatorPlane?: boolean;
  showEclipticPlane?: boolean;
  showSunRay?: boolean;
  showGridLines?: boolean;
  showLocalTime?: boolean;
  focusEarth?: boolean;
}

export type CameraPreset = 'free' | 'top' | 'side' | 'northPole' | 'equator' | 'surface';
export type ViewMode = 'heliocentric' | 'geocentric' | 'surface';
export type SolarAppMode = 'none' | 'buildingShadow' | 'solarPanel' | 'sundial';
export type QualityLevel = 'high' | 'medium' | 'low';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export interface AppState {
  toasts: ToastItem[];
  quality: QualityLevel;
  textureProgress: number;
  currentDate: Date;
  timeSpeed: number;
  isPlaying: boolean;
  cameraPreset: CameraPreset;
  activeKnowledge: string | null;
  showEquatorPlane: boolean;
  showEclipticPlane: boolean;
  showTerminator: boolean;
  showGridLines: boolean;
  showSunRay: boolean;
  showEarthAxis: boolean;
  showOrbitMarkers: boolean;
  showEquatorPlaneAtEarth: boolean;
  showDayNightArc: boolean;
  showSolarAltitude: boolean;
  showLocalTime: boolean;
  showCoriolis: boolean;
  showOrbitSpeed: boolean;
  showFiveZones: boolean;
  showSeasonDemo: boolean;
  showEclipse: boolean;
  showMoonPhases: boolean;
  showFlightTime: boolean;
  flightOrigin: string;
  flightDestination: string;
  solarAppMode: SolarAppMode;
  activeQuestion: Question | null;
  isExamDrawerOpen: boolean;
  isKnowledgePanelOpen: boolean;
  isMobileRightPanelOpen: boolean;
  isMobileKnowledgeOpen: boolean;
  highlightLatitude: number | null;
  highlightLongitude: number | null;
  focusEarth: boolean;
  activeView: ViewMode;
  targetLatitude: number;
  targetLongitude: number;

  setDate: (date: Date) => void;
  setActiveView: (view: ViewMode) => void;
  setTimeSpeed: (speed: number) => void;
  togglePlay: () => void;
  setCameraPreset: (preset: CameraPreset) => void;
  setActiveKnowledge: (id: string | null) => void;
  toggleSetting: (key: string) => void;
  setActiveQuestion: (question: Question | null) => void;
  setExamDrawerOpen: (open: boolean) => void;
  setKnowledgePanelOpen: (open: boolean) => void;
  setMobileRightPanelOpen: (open: boolean) => void;
  setMobileKnowledgeOpen: (open: boolean) => void;
  applySceneConfig: (config: SceneConfig) => void;
  setTargetLatitude: (lat: number) => void;
  setTargetLongitude: (lon: number) => void;
  setSolarAppMode: (mode: SolarAppMode) => void;
  setFlightOrigin: (origin: string) => void;
  setFlightDestination: (dest: string) => void;
  resetScene: () => void;
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  setQuality: (quality: QualityLevel) => void;
  setTextureProgress: (progress: number) => void;
}