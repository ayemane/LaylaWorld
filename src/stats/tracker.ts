// Stats tracking with localStorage persistence

import type { Difficulty } from '../game/words';

export interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  currentStreak: number;
  bestStreak: number;
  wordsMastered: string[];
  gamesByDifficulty: Record<Difficulty, { played: number; won: number }>;
  achievements: Achievement[];
  lastPlayed: string | null;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: string | null;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-win', name: 'First Victory', description: 'Win your first game', unlockedAt: null },
  { id: 'streak-3', name: 'On Fire', description: 'Win 3 games in a row', unlockedAt: null },
  { id: 'streak-5', name: 'Unstoppable', description: 'Win 5 games in a row', unlockedAt: null },
  { id: 'streak-10', name: 'Champion', description: 'Win 10 games in a row', unlockedAt: null },
  { id: 'ten-games', name: 'Getting Started', description: 'Play 10 games', unlockedAt: null },
  { id: 'fifty-games', name: 'Dedicated Player', description: 'Play 50 games', unlockedAt: null },
  { id: 'master-easy', name: 'Easy Master', description: 'Win 10 easy games', unlockedAt: null },
  { id: 'master-medium', name: 'Medium Master', description: 'Win 10 medium games', unlockedAt: null },
  { id: 'master-hard', name: 'Hard Master', description: 'Win 10 hard games', unlockedAt: null },
  { id: 'word-collector', name: 'Word Collector', description: 'Master 25 different words', unlockedAt: null },
  { id: 'vocabulary-king', name: 'Vocabulary Expert', description: 'Master 50 different words', unlockedAt: null },
  { id: 'perfect-game', name: 'Perfect Game', description: 'Win without any wrong guesses', unlockedAt: null },
];

const STORAGE_KEY = 'hangman-layla-stats';

function getDefaultStats(): GameStats {
  return {
    totalGames: 0,
    wins: 0,
    losses: 0,
    currentStreak: 0,
    bestStreak: 0,
    wordsMastered: [],
    gamesByDifficulty: {
      easy: { played: 0, won: 0 },
      medium: { played: 0, won: 0 },
      hard: { played: 0, won: 0 }
    },
    achievements: [...DEFAULT_ACHIEVEMENTS],
    lastPlayed: null
  };
}

export class StatsTracker {
  private stats: GameStats;

  constructor() {
    this.stats = this.load();
  }

  private load(): GameStats {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as GameStats;
        // Merge with default achievements to handle new achievements added later
        const existingIds = new Set(parsed.achievements.map(a => a.id));
        DEFAULT_ACHIEVEMENTS.forEach(defaultAch => {
          if (!existingIds.has(defaultAch.id)) {
            parsed.achievements.push(defaultAch);
          }
        });
        return parsed;
      }
    } catch {
      console.warn('Failed to load stats from localStorage');
    }
    return getDefaultStats();
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.stats));
    } catch {
      console.warn('Failed to save stats to localStorage');
    }
  }

  private unlockAchievement(id: string): Achievement | null {
    const achievement = this.stats.achievements.find(a => a.id === id);
    if (achievement && !achievement.unlockedAt) {
      achievement.unlockedAt = new Date().toISOString();
      return achievement;
    }
    return null;
  }

  recordGame(
    won: boolean,
    word: string,
    difficulty: Difficulty,
    wrongGuesses: number
  ): Achievement[] {
    const newAchievements: Achievement[] = [];

    this.stats.totalGames++;
    this.stats.gamesByDifficulty[difficulty].played++;
    this.stats.lastPlayed = new Date().toISOString();

    if (won) {
      this.stats.wins++;
      this.stats.currentStreak++;
      this.stats.gamesByDifficulty[difficulty].won++;

      if (this.stats.currentStreak > this.stats.bestStreak) {
        this.stats.bestStreak = this.stats.currentStreak;
      }

      // Add word to mastered list if not already there
      const upperWord = word.toUpperCase();
      if (!this.stats.wordsMastered.includes(upperWord)) {
        this.stats.wordsMastered.push(upperWord);
      }

      // Check achievements
      if (this.stats.wins === 1) {
        const ach = this.unlockAchievement('first-win');
        if (ach) newAchievements.push(ach);
      }

      if (this.stats.currentStreak >= 3) {
        const ach = this.unlockAchievement('streak-3');
        if (ach) newAchievements.push(ach);
      }

      if (this.stats.currentStreak >= 5) {
        const ach = this.unlockAchievement('streak-5');
        if (ach) newAchievements.push(ach);
      }

      if (this.stats.currentStreak >= 10) {
        const ach = this.unlockAchievement('streak-10');
        if (ach) newAchievements.push(ach);
      }

      if (wrongGuesses === 0) {
        const ach = this.unlockAchievement('perfect-game');
        if (ach) newAchievements.push(ach);
      }

      if (this.stats.gamesByDifficulty.easy.won >= 10) {
        const ach = this.unlockAchievement('master-easy');
        if (ach) newAchievements.push(ach);
      }

      if (this.stats.gamesByDifficulty.medium.won >= 10) {
        const ach = this.unlockAchievement('master-medium');
        if (ach) newAchievements.push(ach);
      }

      if (this.stats.gamesByDifficulty.hard.won >= 10) {
        const ach = this.unlockAchievement('master-hard');
        if (ach) newAchievements.push(ach);
      }
    } else {
      this.stats.losses++;
      this.stats.currentStreak = 0;
    }

    // Check total games achievements
    if (this.stats.totalGames >= 10) {
      const ach = this.unlockAchievement('ten-games');
      if (ach) newAchievements.push(ach);
    }

    if (this.stats.totalGames >= 50) {
      const ach = this.unlockAchievement('fifty-games');
      if (ach) newAchievements.push(ach);
    }

    // Check word collection achievements
    if (this.stats.wordsMastered.length >= 25) {
      const ach = this.unlockAchievement('word-collector');
      if (ach) newAchievements.push(ach);
    }

    if (this.stats.wordsMastered.length >= 50) {
      const ach = this.unlockAchievement('vocabulary-king');
      if (ach) newAchievements.push(ach);
    }

    this.save();
    return newAchievements;
  }

  getStats(): GameStats {
    return { ...this.stats };
  }

  getWinRate(): number {
    if (this.stats.totalGames === 0) return 0;
    return Math.round((this.stats.wins / this.stats.totalGames) * 100);
  }

  reset(): void {
    this.stats = getDefaultStats();
    this.save();
  }
}

// Singleton instance
export const statsTracker = new StatsTracker();
