import { create } from 'zustand';
import type { AppState, CameraPreset, SolarAppMode, ViewMode, SceneConfig, ToastItem, QualityLevel } from '@/types';
import { savePreferences, loadPreferences } from '@/utils/preferences';

const DEFAULT_DATE = new Date('2024-06-21T12:00:00');
const prefs = loadPreferences();

type StateData = Omit<AppState, keyof Pick<AppState, 'setDate' | 'setActiveView' | 'setTimeSpeed' | 'togglePlay' | 'setCameraPreset' | 'setActiveKnowledge' | 'toggleSetting' | 'setActiveQuestion' | 'setExamDrawerOpen' | 'setKnowledgePanelOpen' | 'setMobileRightPanelOpen' | 'setMobileKnowledgeOpen' | 'applySceneConfig' | 'setTargetLatitude' | 'setTargetLongitude' | 'setSolarAppMode' | 'setFlightOrigin' | 'setFlightDestination' | 'resetScene' | 'addToast' | 'removeToast' | 'setQuality' | 'setTextureProgress'>>;

const initialState: StateData = {
  toasts: [],
  quality: prefs.timeSpeed > 1 ? 'medium' : 'high' as QualityLevel,
  textureProgress: 0,
  currentDate: prefs.lastDate ? new Date(prefs.lastDate) : DEFAULT_DATE,
  timeSpeed: prefs.timeSpeed,
  isPlaying: false,
  cameraPreset: 'free' as CameraPreset,
  activeKnowledge: null,
  showEquatorPlane: false,
  showEclipticPlane: false,
  showTerminator: true,
  showGridLines: false,
  showSunRay: false,
  showEarthAxis: false,
  showOrbitMarkers: false,
  showEquatorPlaneAtEarth: false,
  showDayNightArc: false,
  showSolarAltitude: false,
  showLocalTime: false,
  showCoriolis: false,
  showOrbitSpeed: false,
  showFiveZones: false,
  showSeasonDemo: false,
  showEclipse: false,
  showMoonPhases: false,
  showFlightTime: false,
  flightOrigin: '北京',
  flightDestination: '',
  solarAppMode: 'none' as SolarAppMode,
  activeQuestion: null,
  isExamDrawerOpen: false,
  isKnowledgePanelOpen: prefs.knowledgePanelOpen,
  isMobileRightPanelOpen: false,
  isMobileKnowledgeOpen: false,
  highlightLatitude: null,
  highlightLongitude: null,
  focusEarth: false,
  activeView: prefs.lastView || 'heliocentric' as ViewMode,
  targetLatitude: prefs.lastLatitude,
  targetLongitude: prefs.lastLongitude,
};

export const useStore = create<AppState>((set, get) => ({
  ...initialState,

  setDate: (date) => set({ currentDate: date }),
  setActiveView: (view) => set({ activeView: view }),
  setTimeSpeed: (speed) => set({ timeSpeed: speed }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setCameraPreset: (preset) => set({ cameraPreset: preset }),
  setActiveKnowledge: (id) => set({ activeKnowledge: id }),
  setActiveQuestion: (q) => set({ activeQuestion: q }),
  setExamDrawerOpen: (open) => set({ isExamDrawerOpen: open }),
  setKnowledgePanelOpen: (open) => set({ isKnowledgePanelOpen: open }),
  setMobileRightPanelOpen: (open) => set({ isMobileRightPanelOpen: open }),
  setMobileKnowledgeOpen: (open) => set({ isMobileKnowledgeOpen: open }),
  setSolarAppMode: (mode) => set({ solarAppMode: mode }),
  setTargetLatitude: (lat) => set({ targetLatitude: lat }),
  setTargetLongitude: (lon) => set({ targetLongitude: lon }),
  setFlightOrigin: (origin) => set({ flightOrigin: origin }),
  setFlightDestination: (dest) => set({ flightDestination: dest }),

  toggleSetting: (key) =>
    set((s) => {
      const current = (s as unknown as Record<string, unknown>)[key];
      return { [key]: !current } as Partial<AppState>;
    }),

  resetScene: () =>
    set({
      ...initialState,
      activeView: get().activeView,
    }),

  applySceneConfig: (config) =>
    set((s) => {
      const updates: Partial<AppState> = {};
      if (config.focusEarth !== undefined) updates.showSunRay = config.focusEarth;
      if (config.highlightLatitude !== undefined) updates.targetLatitude = config.highlightLatitude;
      if (config.highlightLongitude !== undefined) updates.targetLongitude = config.highlightLongitude;
      if (config.showTerminator !== undefined) updates.showTerminator = config.showTerminator;
      if (config.showEquatorPlane !== undefined) updates.showEquatorPlane = config.showEquatorPlane;
      if (config.showEclipticPlane !== undefined) updates.showEclipticPlane = config.showEclipticPlane;
      if (config.showSunRay !== undefined) updates.showSunRay = config.showSunRay;
      if (config.showGridLines !== undefined) updates.showGridLines = config.showGridLines;
      if (config.showLocalTime !== undefined) updates.showLocalTime = config.showLocalTime;
      if (config.cameraPreset) updates.cameraPreset = config.cameraPreset;
      return updates;
    }),

  addToast: (toast) =>
    set((s) => ({
      toasts: [...s.toasts, { ...toast, id: `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` }],
    })),

  removeToast: (id) =>
    set((s) => ({
      toasts: s.toasts.filter((t) => t.id !== id),
    })),

  setQuality: (quality) => set({ quality }),

  setTextureProgress: (progress) => set({ textureProgress: progress }),
}));

// Auto-save preferences with debounce
let saveTimer: ReturnType<typeof setTimeout> | null = null;
useStore.subscribe((state) => {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    savePreferences({
      lastView: state.activeView,
      lastDate: state.currentDate.toISOString(),
      lastLatitude: state.targetLatitude,
      lastLongitude: state.targetLongitude,
      knowledgePanelOpen: state.isKnowledgePanelOpen,
      timeSpeed: state.timeSpeed,
    });
  }, 500);
});