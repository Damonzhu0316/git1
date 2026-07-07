import type { StateCreator } from 'zustand';
import type { AtmosphereState, AtmosphereSceneMode, Hemisphere } from '@/types/atmosphere';

export interface AtmosphereSlice extends AtmosphereState {
  setSceneMode: (mode: AtmosphereSceneMode) => void;
  setHemisphere: (h: Hemisphere) => void;
  setMonth: (m: number) => void;
  togglePlayback: () => void;
  setAnimationSpeed: (s: number) => void;
  togglePressureZones: () => void;
  toggleWindBelts: () => void;
  toggleCirculationCells: () => void;
  setSelectedFront: (f: AtmosphereState['selectedFront']) => void;
  setSelectedCyclone: (c: AtmosphereState['selectedCyclone']) => void;
  toggleQuiz: () => void;
  setCurrentQuizIndex: (i: number) => void;
  answerQuestion: (questionId: string, answer: string) => void;
  resetQuiz: () => void;
}

export const createAtmosphereSlice: StateCreator<AtmosphereSlice> = (set) => ({
  sceneMode: 'pressure-wind',
  hemisphere: 'north',
  month: 6,
  isPlaying: false,
  animationSpeed: 1,
  showPressureZones: true,
  showWindBelts: true,
  showCirculationCells: true,
  showFront: true,
  showCyclone: true,
  selectedFront: null,
  selectedCyclone: null,
  showQuiz: false,
  currentQuizIndex: 0,
  quizScore: 0,
  quizAnswers: {},

  setSceneMode: (mode) => set({ sceneMode: mode }),
  setHemisphere: (h) => set({ hemisphere: h }),
  setMonth: (m) => set({ month: Math.max(1, Math.min(12, m)) }),
  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setAnimationSpeed: (s) => set({ animationSpeed: s }),
  togglePressureZones: () => set((state) => ({ showPressureZones: !state.showPressureZones })),
  toggleWindBelts: () => set((state) => ({ showWindBelts: !state.showWindBelts })),
  toggleCirculationCells: () => set((state) => ({ showCirculationCells: !state.showCirculationCells })),
  setSelectedFront: (f) => set({ selectedFront: f }),
  setSelectedCyclone: (c) => set({ selectedCyclone: c }),
  toggleQuiz: () => set((state) => ({ showQuiz: !state.showQuiz })),
  setCurrentQuizIndex: (i) => set({ currentQuizIndex: i }),
  answerQuestion: (questionId, answer) =>
    set((state) => ({
      quizAnswers: { ...state.quizAnswers, [questionId]: answer },
    })),
  resetQuiz: () => set({ currentQuizIndex: 0, quizScore: 0, quizAnswers: {} }),
});
