import { Study, TeamMember, CommunityItem, LabSettings } from './types';
import { getSeedStudies, getSeedTeam, getSeedCommunity, getDefaultLabSettings } from './seed';

const KEYS = {
  studies: 'apertum_studies',
  team: 'apertum_team',
  community: 'apertum_community',
  settings: 'apertum_settings',
  initialized: 'apertum_initialized',
};

function safeGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function initializeStore() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(KEYS.initialized)) return;
  safeSet(KEYS.studies, getSeedStudies());
  safeSet(KEYS.team, getSeedTeam());
  safeSet(KEYS.community, getSeedCommunity());
  safeSet(KEYS.settings, getDefaultLabSettings());
  localStorage.setItem(KEYS.initialized, 'true');
}

// Studies
export function getStudies(): Study[] {
  const studies = safeGet<Study[]>(KEYS.studies) ?? [];
  return studies.map((s) => ({
    ...s,
  }));
}

export function getStudy(id: string): Study | undefined {
  return getStudies().find((s) => s.id === id);
}

export function saveStudy(study: Study) {
  const studies = getStudies();
  const idx = studies.findIndex((s) => s.id === study.id);
  if (idx >= 0) {
    studies[idx] = study;
  } else {
    studies.push(study);
  }
  safeSet(KEYS.studies, studies);
}

export function deleteStudy(id: string) {
  safeSet(KEYS.studies, getStudies().filter((s) => s.id !== id));
}

// Team
export function getTeam(): TeamMember[] {
  return safeGet<TeamMember[]>(KEYS.team) ?? [];
}

export function saveTeam(team: TeamMember[]) {
  safeSet(KEYS.team, team);
}

// Community
export function getCommunity(): CommunityItem[] {
  return safeGet<CommunityItem[]>(KEYS.community) ?? [];
}

// Settings
export function getSettings(): LabSettings {
  return safeGet<LabSettings>(KEYS.settings) ?? getDefaultLabSettings();
}

export function saveSettings(settings: LabSettings) {
  safeSet(KEYS.settings, settings);
}

// Reset
export function resetAllData() {
  if (typeof window === 'undefined') return;
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  initializeStore();
}
