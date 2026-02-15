// Map Explorer stats tracking

import type { Difficulty } from './maps/types';

export interface MapStats {
  totalGames: number;
  wins: number;
  losses: number;
  totalQuestions: number;
  correctAnswers: number;
  currentStreak: number;
  bestStreak: number;
  totalScore: number;
  highScore: number;
  gamesByDifficulty: Record<Difficulty, { played: number; won: number }>;
  statesFound: Set<string> | string[];  // serialized as array
  achievements: MapAchievement[];
  lastPlayed: string | null;
}

export interface MapAchievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: string | null;
}

const DEFAULT_ACHIEVEMENTS: MapAchievement[] = [
  { id: 'first-expedition', name: 'First Expedition', description: 'Complete your first game', unlockedAt: null },
  { id: 'streak-5', name: 'Explorer Streak', description: 'Get 5 correct in a row', unlockedAt: null },
  { id: 'streak-10', name: 'Master Navigator', description: 'Get 10 correct in a row', unlockedAt: null },
  { id: 'perfect-easy', name: 'Perfect Scout', description: 'Beat Easy with no mistakes', unlockedAt: null },
  { id: 'perfect-medium', name: 'Perfect Ranger', description: 'Beat Medium with no mistakes', unlockedAt: null },
  { id: 'perfect-hard', name: 'Perfect Explorer', description: 'Beat Hard with no mistakes', unlockedAt: null },
  { id: 'score-500', name: 'Rising Explorer', description: 'Score 500 points in one game', unlockedAt: null },
  { id: 'score-1000', name: 'Superstar Explorer', description: 'Score 1000 points in one game', unlockedAt: null },
  { id: 'games-10', name: 'Dedicated Explorer', description: 'Play 10 games', unlockedAt: null },
  { id: 'games-50', name: 'World Traveler', description: 'Play 50 games', unlockedAt: null },
  { id: 'states-25', name: 'Half the Map', description: 'Find 25 different US states', unlockedAt: null },
  { id: 'states-50', name: 'All 50 States', description: 'Find all 50 US states', unlockedAt: null },
];

const STORAGE_KEY = 'mapexplorer-layla-stats';

interface StoredStats extends Omit<MapStats, 'statesFound'> {
  statesFound: string[];
}

function getDefaultStats(): MapStats {
  return {
    totalGames: 0,
    wins: 0,
    losses: 0,
    totalQuestions: 0,
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
    statesFound: new Set(),
    achievements: [...DEFAULT_ACHIEVEMENTS.map(a => ({ ...a }))],
    lastPlayed: null
  };
}

export class MapStatsTracker {
  private stats: MapStats;

  constructor() {
    this.stats = this.load();
  }

  private load(): MapStats {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StoredStats;
        // Convert statesFound array back to Set
        const stats: MapStats = {
          ...parsed,
          statesFound: new Set(parsed.statesFound || [])
        };
        // Merge with default achievements
        const existingIds = new Set(stats.achievements.map(a => a.id));
        DEFAULT_ACHIEVEMENTS.forEach(defaultAch => {
          if (!existingIds.has(defaultAch.id)) {
            stats.achievements.push({ ...defaultAch });
          }
        });
        return stats;
      }
    } catch {
      console.warn('Failed to load map explorer stats');
    }
    return getDefaultStats();
  }

  private save(): void {
    try {
      const toStore: StoredStats = {
        ...this.stats,
        statesFound: Array.from(this.stats.statesFound as Set<string>)
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch {
      console.warn('Failed to save map explorer stats');
    }
  }

  private unlockAchievement(id: string): MapAchievement | null {
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
    bestStreak: number,
    foundRegions: Set<string>
  ): MapAchievement[] {
    const newAchievements: MapAchievement[] = [];

    this.stats.totalGames++;
    this.stats.totalQuestions += correctAnswers + wrongAnswers;
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

    // Track unique states found (only for US maps)
    const statesSet = this.stats.statesFound as Set<string>;
    foundRegions.forEach(id => statesSet.add(id));

    if (won) {
      this.stats.wins++;
      this.stats.currentStreak++;
      this.stats.gamesByDifficulty[difficulty].won++;

      if (this.stats.wins === 1) {
        const ach = this.unlockAchievement('first-expedition');
        if (ach) newAchievements.push(ach);
      }

      if (wrongAnswers === 0) {
        const key = `perfect-${difficulty}` as const;
        const ach = this.unlockAchievement(key);
        if (ach) newAchievements.push(ach);
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

    // States found achievements
    if (statesSet.size >= 25) {
      const ach = this.unlockAchievement('states-25');
      if (ach) newAchievements.push(ach);
    }
    if (statesSet.size >= 50) {
      const ach = this.unlockAchievement('states-50');
      if (ach) newAchievements.push(ach);
    }

    this.save();
    return newAchievements;
  }

  getStats(): MapStats {
    return {
      ...this.stats,
      statesFound: new Set(this.stats.statesFound as Set<string>)
    };
  }

  getStatesFoundCount(): number {
    return (this.stats.statesFound as Set<string>).size;
  }

  getAccuracy(): number {
    if (this.stats.totalQuestions === 0) return 0;
    return Math.round((this.stats.correctAnswers / this.stats.totalQuestions) * 100);
  }
}

export const mapStatsTracker = new MapStatsTracker();
