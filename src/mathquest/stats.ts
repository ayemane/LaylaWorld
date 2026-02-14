// Math Quest stats tracking

import type { Difficulty } from './problems';
import type { Operation } from './problems';

export interface MathStats {
  totalGames: number;
  wins: number;
  losses: number;
  totalProblems: number;
  correctAnswers: number;
  currentStreak: number;
  bestStreak: number;
  totalScore: number;
  highScore: number;
  gamesByDifficulty: Record<Difficulty, { played: number; won: number }>;
  operationAccuracy: Record<Operation, { correct: number; total: number }>;
  achievements: MathAchievement[];
  lastPlayed: string | null;
}

export interface MathAchievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: string | null;
}

const DEFAULT_ACHIEVEMENTS: MathAchievement[] = [
  { id: 'first-win', name: 'Liftoff!', description: 'Complete your first mission', unlockedAt: null },
  { id: 'streak-5', name: 'Hot Streak', description: 'Get 5 correct in a row', unlockedAt: null },
  { id: 'streak-10', name: 'Unstoppable', description: 'Get 10 correct in a row', unlockedAt: null },
  { id: 'perfect-easy', name: 'Perfect Launch', description: 'Beat Easy with no mistakes', unlockedAt: null },
  { id: 'perfect-medium', name: 'Flawless Flight', description: 'Beat Medium with no mistakes', unlockedAt: null },
  { id: 'perfect-hard', name: 'Legendary Pilot', description: 'Beat Hard with no mistakes', unlockedAt: null },
  { id: 'score-500', name: 'Rising Star', description: 'Score 500 points in one game', unlockedAt: null },
  { id: 'score-1000', name: 'Superstar', description: 'Score 1000 points in one game', unlockedAt: null },
  { id: 'games-10', name: 'Dedicated', description: 'Play 10 missions', unlockedAt: null },
  { id: 'games-50', name: 'Math Explorer', description: 'Play 50 missions', unlockedAt: null },
  { id: 'master-add', name: 'Addition Ace', description: 'Get 50 addition problems correct', unlockedAt: null },
  { id: 'master-multiply', name: 'Multiplication Master', description: 'Get 50 multiplication problems correct', unlockedAt: null },
];

const STORAGE_KEY = 'mathquest-layla-stats';

function getDefaultStats(): MathStats {
  return {
    totalGames: 0,
    wins: 0,
    losses: 0,
    totalProblems: 0,
    correctAnswers: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalScore: 0,
    highScore: 0,
    gamesByDifficulty: {
      easy: { played: 0, won: 0 },
      medium: { played: 0, won: 0 },
      hard: { played: 0, won: 0 }
    },
    operationAccuracy: {
      add: { correct: 0, total: 0 },
      subtract: { correct: 0, total: 0 },
      multiply: { correct: 0, total: 0 },
      divide: { correct: 0, total: 0 }
    },
    achievements: [...DEFAULT_ACHIEVEMENTS],
    lastPlayed: null
  };
}

export class MathStatsTracker {
  private stats: MathStats;

  constructor() {
    this.stats = this.load();
  }

  private load(): MathStats {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as MathStats;
        // Merge with default achievements
        const existingIds = new Set(parsed.achievements.map(a => a.id));
        DEFAULT_ACHIEVEMENTS.forEach(defaultAch => {
          if (!existingIds.has(defaultAch.id)) {
            parsed.achievements.push(defaultAch);
          }
        });
        return parsed;
      }
    } catch {
      console.warn('Failed to load math stats');
    }
    return getDefaultStats();
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.stats));
    } catch {
      console.warn('Failed to save math stats');
    }
  }

  private unlockAchievement(id: string): MathAchievement | null {
    const achievement = this.stats.achievements.find(a => a.id === id);
    if (achievement && !achievement.unlockedAt) {
      achievement.unlockedAt = new Date().toISOString();
      return achievement;
    }
    return null;
  }

  recordGame(
    won: boolean,
    difficulty: Difficulty,
    score: number,
    correctAnswers: number,
    wrongAnswers: number,
    bestStreak: number
  ): MathAchievement[] {
    const newAchievements: MathAchievement[] = [];

    this.stats.totalGames++;
    this.stats.totalProblems += correctAnswers + wrongAnswers;
    this.stats.correctAnswers += correctAnswers;
    this.stats.totalScore += score;
    this.stats.gamesByDifficulty[difficulty].played++;
    this.stats.lastPlayed = new Date().toISOString();

    if (bestStreak > this.stats.bestStreak) {
      this.stats.bestStreak = bestStreak;
    }

    if (score > this.stats.highScore) {
      this.stats.highScore = score;
    }

    if (won) {
      this.stats.wins++;
      this.stats.currentStreak++;
      this.stats.gamesByDifficulty[difficulty].won++;

      // Check win achievements
      if (this.stats.wins === 1) {
        const ach = this.unlockAchievement('first-win');
        if (ach) newAchievements.push(ach);
      }

      // Perfect game achievements
      if (wrongAnswers === 0) {
        if (difficulty === 'easy') {
          const ach = this.unlockAchievement('perfect-easy');
          if (ach) newAchievements.push(ach);
        } else if (difficulty === 'medium') {
          const ach = this.unlockAchievement('perfect-medium');
          if (ach) newAchievements.push(ach);
        } else if (difficulty === 'hard') {
          const ach = this.unlockAchievement('perfect-hard');
          if (ach) newAchievements.push(ach);
        }
      }
    } else {
      this.stats.losses++;
      this.stats.currentStreak = 0;
    }

    // Streak achievements
    if (bestStreak >= 5) {
      const ach = this.unlockAchievement('streak-5');
      if (ach) newAchievements.push(ach);
    }
    if (bestStreak >= 10) {
      const ach = this.unlockAchievement('streak-10');
      if (ach) newAchievements.push(ach);
    }

    // Score achievements
    if (score >= 500) {
      const ach = this.unlockAchievement('score-500');
      if (ach) newAchievements.push(ach);
    }
    if (score >= 1000) {
      const ach = this.unlockAchievement('score-1000');
      if (ach) newAchievements.push(ach);
    }

    // Games played achievements
    if (this.stats.totalGames >= 10) {
      const ach = this.unlockAchievement('games-10');
      if (ach) newAchievements.push(ach);
    }
    if (this.stats.totalGames >= 50) {
      const ach = this.unlockAchievement('games-50');
      if (ach) newAchievements.push(ach);
    }

    this.save();
    return newAchievements;
  }

  recordOperation(operation: Operation, correct: boolean): void {
    this.stats.operationAccuracy[operation].total++;
    if (correct) {
      this.stats.operationAccuracy[operation].correct++;
    }

    // Check operation mastery achievements
    if (operation === 'add' && this.stats.operationAccuracy.add.correct >= 50) {
      this.unlockAchievement('master-add');
    }
    if (operation === 'multiply' && this.stats.operationAccuracy.multiply.correct >= 50) {
      this.unlockAchievement('master-multiply');
    }

    this.save();
  }

  getStats(): MathStats {
    return { ...this.stats };
  }

  getAccuracy(): number {
    if (this.stats.totalProblems === 0) return 0;
    return Math.round((this.stats.correctAnswers / this.stats.totalProblems) * 100);
  }
}

export const mathStatsTracker = new MathStatsTracker();
