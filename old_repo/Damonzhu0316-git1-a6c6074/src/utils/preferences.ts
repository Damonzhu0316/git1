import type { ViewMode } from '@/types';

export interface UserPreferences {
  lastView: ViewMode | null;
  lastDate: string | null;
  lastLatitude: number;
  lastLongitude: number;
  knowledgePanelOpen: boolean;
  timeSpeed: number;
}

const STORAGE_KEY = 'geosim1_preferences';

const DEFAULT_PREFS: UserPreferences = {
  lastView: null,
  lastDate: null,
  lastLatitude: 40,
  lastLongitude: 116,
  knowledgePanelOpen: true,
  timeSpeed: 1,
};

export function savePreferences(prefs: Partial<UserPreferences>): void {
  try {
    const existing = loadPreferences();
    const merged = { ...existing, ...prefs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // localStorage not available
  }
}

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function clearPreferences(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage not available
  }
}