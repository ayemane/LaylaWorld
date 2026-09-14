// Mystery X stats — same shape as the other games' trackers.

import type { Difficulty } from './equations';

export interface MysteryXStats {
  totalGames: number;
  wins: number;
  losses: number;
  puzzlesSolved: number;
  perfectPuzzles: number;
  wrongMoves: number;
  currentStreak: number;
  bestStreak: number;
  totalScore: number;
  highScore: number;
  gamesByDifficulty: Record<Difficulty, { played: number; won: number }>;
  achievements: MysteryXAchievement[];
  lastPlayed: string | null;
}

export interface MysteryXAchievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: string | null;
}

const DEFAULT_ACHIEVEMENTS: MysteryXAchievement[] = [
  { id: 'first-x', name: 'Found X!', description: 'Free the mystery number for the first time', unlockedAt: null },
  { id: 'first-win', name: 'Case Closed', description: 'Finish your first case', unlockedAt: null },
  { id: 'streak-5', name: 'Hot on the Trail', description: 'Solve 5 in a row', unlockedAt: null },
  { id: 'streak-10', name: 'Master Detective', description: 'Solve 10 in a row', unlockedAt: null },
  { id: 'flawless', name: 'Not One Slip', description: 'Finish a case with no wrong moves', unlockedAt: null },
  { id: 'two-step', name: 'Two-Stepper', description: 'Win a Detective case', unlockedAt: null },
  { id: 'mastermind', name: 'Mastermind', description: 'Win a Mastermind case', unlockedAt: null },
  { id: 'solved-25', name: 'Twenty-Five Mysteries', description: 'Free x 25 times', unlockedAt: null },
  { id: 'solved-100', name: 'X-Pert', description: 'Free x 100 times', unlockedAt: null },
  { id: 'score-500', name: 'Rising Detective', description: 'Score 500 in one case', unlockedAt: null },
];

const STORAGE_KEY = 'mysteryx-layla-stats';

function getDefaultStats(): MysteryXStats {
  return {
    totalGames: 0, wins: 0, losses: 0,
    puzzlesSolved: 0, perfectPuzzles: 0, wrongMoves: 0,
    currentStreak: 0, bestStreak: 0, totalScore: 0, highScore: 0,
    gamesByDifficulty: {
      easy: { played: 0, won: 0 },
      medium: { played: 0, won: 0 },
      hard: { played: 0, won: 0 }
    },
    achievements: [...DEFAULT_ACHIEVEMENTS],
    lastPlayed: null
  };
}

export class MysteryXStatsTracker {
  private stats: MysteryXStats;

  constructor() {
    this.stats = this.load();
  }

  private load(): MysteryXStats {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as MysteryXStats;
        const existing = new Set(parsed.achievements.map(a => a.id));
        DEFAULT_ACHIEVEMENTS.forEach(a => { if (!existing.has(a.id)) parsed.achievements.push(a); });
        return parsed;
      }
    } catch {
      console.warn('Failed to load Mystery X stats');
    }
    return getDefaultStats();
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.stats));
    } catch {
      console.warn('Failed to save Mystery X stats');
    }
  }

  private unlock(id: string): MysteryXAchievement | null {
    const a = this.stats.achievements.find(x => x.id === id);
    if (a && !a.unlockedAt) {
      a.unlockedAt = new Date().toISOString();
      return a;
    }
    return null;
  }

  recordGame(
    won: boolean,
    difficulty: Difficulty,
    score: number,
    puzzlesSolved: number,
    perfectPuzzles: number,
    wrongMoves: number,
    bestStreak: number
  ): MysteryXAchievement[] {
    const unlocked: MysteryXAchievement[] = [];
    const push = (id: string) => { const a = this.unlock(id); if (a) unlocked.push(a); };

    this.stats.totalGames++;
    this.stats.puzzlesSolved += puzzlesSolved;
    this.stats.perfectPuzzles += perfectPuzzles;
    this.stats.wrongMoves += wrongMoves;
    this.stats.totalScore += score;
    this.stats.gamesByDifficulty[difficulty].played++;
    this.stats.lastPlayed = new Date().toISOString();

    if (bestStreak > this.stats.bestStreak) this.stats.bestStreak = bestStreak;
    if (score > this.stats.highScore) this.stats.highScore = score;

    if (puzzlesSolved > 0) push('first-x');

    if (won) {
      this.stats.wins++;
      this.stats.currentStreak++;
      this.stats.gamesByDifficulty[difficulty].won++;
      push('first-win');
      if (wrongMoves === 0) push('flawless');
      if (difficulty === 'medium') push('two-step');
      if (difficulty === 'hard') push('mastermind');
    } else {
      this.stats.losses++;
      this.stats.currentStreak = 0;
    }

    if (bestStreak >= 5) push('streak-5');
    if (bestStreak >= 10) push('streak-10');
    if (score >= 500) push('score-500');
    if (this.stats.puzzlesSolved >= 25) push('solved-25');
    if (this.stats.puzzlesSolved >= 100) push('solved-100');

    this.save();
    return unlocked;
  }

  getStats(): MysteryXStats { return { ...this.stats }; }

  /** Share of moves that were productive — the number worth watching. */
  getMoveAccuracy(): number {
    const productive = this.stats.puzzlesSolved * 2; // ~2 productive moves per puzzle
    const total = productive + this.stats.wrongMoves;
    if (total === 0) return 0;
    return Math.round((productive / total) * 100);
  }
}

export const mysteryXStats = new MysteryXStatsTracker();
