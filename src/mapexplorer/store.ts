// Map Explorer persistence layer
// Separate localStorage keys from existing stats (mapexplorer-layla-stats)

import type { Difficulty } from './maps/types';

// --- Interfaces ---

export type GatingMode = 'gated' | 'always_available' | 'soft_gate';

export interface ParentSettings {
  gatingMode: GatingMode;
}

export interface LearnProgress {
  learnedRegions: string[];    // region IDs that have been learned
  currentBatchIndex: number;   // which batch we're on
}

export type XPLevel = 'Cadet' | 'Scout' | 'Ranger' | 'Navigator' | 'Captain' | 'Master';

export interface StampData {
  regionId: string;
  earnedAt: number;
}

export interface XPData {
  totalXP: number;
  level: XPLevel;
  stamps: Record<Difficulty, StampData[]>;
}

export interface TwoPlayerMatch {
  date: number;
  laylaScore: number;
  babaScore: number;
  difficulty: Difficulty;
}

export interface TwoPlayerRecord {
  laylaWins: number;
  babaWins: number;
  draws: number;
  history: TwoPlayerMatch[];
}

// --- XP Constants ---

export const XP_AWARDS = {
  LEARN_CARD: 5,
  QUIZ_CORRECT: 10,
  BATCH_COMPLETE: 25,
  CHALLENGE_CORRECT: 10,
  CHALLENGE_WIN: 50,
  BEAT_BABA: 30,
  PERFECT_GAME: 100,
} as const;

export const XP_LEVELS: { name: XPLevel; threshold: number }[] = [
  { name: 'Cadet', threshold: 0 },
  { name: 'Scout', threshold: 100 },
  { name: 'Ranger', threshold: 300 },
  { name: 'Navigator', threshold: 600 },
  { name: 'Captain', threshold: 1000 },
  { name: 'Master', threshold: 2000 },
];

// --- Storage Keys ---

const KEYS = {
  PARENT_SETTINGS: 'mapexplorer-parent-settings',
  LEARN_PROGRESS: 'mapexplorer-learn-progress',
  XP_DATA: 'mapexplorer-xp-data',
  TWO_PLAYER: 'mapexplorer-2p-record',
  SOFT_GATE_UNLOCKED: 'mapexplorer-soft-unlocked',
} as const;

// --- Helpers ---

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save(key: string, data: unknown): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// --- Parent Settings ---

const DEFAULT_PARENT_SETTINGS: ParentSettings = { gatingMode: 'gated' };

export function getParentSettings(): ParentSettings {
  return load(KEYS.PARENT_SETTINGS, DEFAULT_PARENT_SETTINGS);
}

export function saveParentSettings(settings: ParentSettings): void {
  save(KEYS.PARENT_SETTINGS, settings);
}

// --- Learn Progress ---

type LearnStore = Record<Difficulty, LearnProgress>;

const DEFAULT_LEARN: LearnProgress = { learnedRegions: [], currentBatchIndex: 0 };

export function getLearnProgress(difficulty: Difficulty): LearnProgress {
  const store = load<LearnStore>(KEYS.LEARN_PROGRESS, {} as LearnStore);
  return store[difficulty] || { ...DEFAULT_LEARN };
}

export function saveLearnProgress(difficulty: Difficulty, progress: LearnProgress): void {
  const store = load<LearnStore>(KEYS.LEARN_PROGRESS, {} as LearnStore);
  store[difficulty] = progress;
  save(KEYS.LEARN_PROGRESS, store);
}

export function isLearnComplete(difficulty: Difficulty, totalRegions: number): boolean {
  const progress = getLearnProgress(difficulty);
  return progress.learnedRegions.length >= totalRegions;
}

// --- Soft Gate Unlocks ---

type SoftUnlocks = Record<Difficulty, boolean>;

export function isSoftGateUnlocked(difficulty: Difficulty): boolean {
  const unlocks = load<SoftUnlocks>(KEYS.SOFT_GATE_UNLOCKED, {} as SoftUnlocks);
  return unlocks[difficulty] === true;
}

export function setSoftGateUnlocked(difficulty: Difficulty): void {
  const unlocks = load<SoftUnlocks>(KEYS.SOFT_GATE_UNLOCKED, {} as SoftUnlocks);
  unlocks[difficulty] = true;
  save(KEYS.SOFT_GATE_UNLOCKED, unlocks);
}

// --- XP ---

const DEFAULT_XP: XPData = {
  totalXP: 0,
  level: 'Cadet',
  stamps: { easy: [], medium: [], hard: [] },
};

export function getXPData(): XPData {
  return load(KEYS.XP_DATA, { ...DEFAULT_XP, stamps: { easy: [], medium: [], hard: [] } });
}

function computeLevel(xp: number): XPLevel {
  let level: XPLevel = 'Cadet';
  for (const l of XP_LEVELS) {
    if (xp >= l.threshold) level = l.name;
  }
  return level;
}

export function getXPForNextLevel(xp: number): { current: XPLevel; next: XPLevel | null; xpNeeded: number; xpIntoLevel: number } {
  let currentIdx = 0;
  for (let i = 0; i < XP_LEVELS.length; i++) {
    if (xp >= XP_LEVELS[i].threshold) currentIdx = i;
  }
  const current = XP_LEVELS[currentIdx];
  const next = XP_LEVELS[currentIdx + 1] || null;
  return {
    current: current.name,
    next: next ? next.name : null,
    xpNeeded: next ? next.threshold - current.threshold : 0,
    xpIntoLevel: xp - current.threshold,
  };
}

export function awardXP(amount: number): { newTotal: number; leveledUp: boolean; newLevel: XPLevel } {
  const data = getXPData();
  const oldLevel = data.level;
  data.totalXP += amount;
  data.level = computeLevel(data.totalXP);
  save(KEYS.XP_DATA, data);
  return { newTotal: data.totalXP, leveledUp: data.level !== oldLevel, newLevel: data.level };
}

export function addStamp(difficulty: Difficulty, regionId: string): void {
  const data = getXPData();
  if (!data.stamps[difficulty]) data.stamps[difficulty] = [];
  if (data.stamps[difficulty].some(s => s.regionId === regionId)) return;
  data.stamps[difficulty].push({ regionId, earnedAt: Date.now() });
  save(KEYS.XP_DATA, data);
}

export function hasStamp(difficulty: Difficulty, regionId: string): boolean {
  const data = getXPData();
  return (data.stamps[difficulty] || []).some(s => s.regionId === regionId);
}

// --- Two Player ---

const DEFAULT_2P: TwoPlayerRecord = { laylaWins: 0, babaWins: 0, draws: 0, history: [] };

export function getTwoPlayerRecord(): TwoPlayerRecord {
  return load(KEYS.TWO_PLAYER, { ...DEFAULT_2P, history: [] });
}

export function recordTwoPlayerMatch(match: TwoPlayerMatch): void {
  const record = getTwoPlayerRecord();
  if (match.laylaScore > match.babaScore) record.laylaWins++;
  else if (match.babaScore > match.laylaScore) record.babaWins++;
  else record.draws++;
  record.history.push(match);
  if (record.history.length > 50) record.history = record.history.slice(-50);
  save(KEYS.TWO_PLAYER, record);
}

// --- Gating Logic ---

export function isChallengeUnlocked(difficulty: Difficulty, totalRegions: number): boolean {
  const settings = getParentSettings();
  if (settings.gatingMode === 'always_available') return true;
  if (settings.gatingMode === 'soft_gate') return isSoftGateUnlocked(difficulty);
  // gated: must complete all learn batches
  return isLearnComplete(difficulty, totalRegions);
}

// --- Reset ---

export function resetLearnProgress(): void {
  localStorage.removeItem(KEYS.LEARN_PROGRESS);
  localStorage.removeItem(KEYS.SOFT_GATE_UNLOCKED);
}

export function resetTwoPlayerRecord(): void {
  localStorage.removeItem(KEYS.TWO_PLAYER);
}

export function resetAll(): void {
  localStorage.removeItem(KEYS.PARENT_SETTINGS);
  localStorage.removeItem(KEYS.LEARN_PROGRESS);
  localStorage.removeItem(KEYS.XP_DATA);
  localStorage.removeItem(KEYS.TWO_PLAYER);
  localStorage.removeItem(KEYS.SOFT_GATE_UNLOCKED);
}
