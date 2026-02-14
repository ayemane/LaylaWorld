// Spelling Bee stats tracking

import type { Difficulty } from './words';

export interface SpellingStats {
  totalGames: number;
  wins: number;
  losses: number;
  totalWords: number;
  correctWords: number;
  currentStreak: number;
  bestStreak: number;
  totalScore: number;
  highScore: number;
  wordsMastered: string[];
  gamesByDifficulty: Record<Difficulty, { played: number; won: number }>;
  achievements: SpellingAchievement[];
  lastPlayed: string | null;
}

export interface SpellingAchievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: string | null;
}

const DEFAULT_ACHIEVEMENTS: SpellingAchievement[] = [
  { id: 'first-win', name: 'First Buzz', description: 'Complete your first spelling round', unlockedAt: null },
  { id: 'streak-5', name: 'Spelling Streak', description: 'Spell 5 words correctly in a row', unlockedAt: null },
  { id: 'streak-10', name: 'Unstoppable Speller', description: 'Spell 10 words correctly in a row', unlockedAt: null },
  { id: 'perfect-easy', name: 'Easy Peasy', description: 'Beat Easy with no mistakes', unlockedAt: null },
  { id: 'perfect-medium', name: 'Spelling Star', description: 'Beat Medium with no mistakes', unlockedAt: null },
  { id: 'perfect-hard', name: 'Spelling Champion', description: 'Beat Hard with no mistakes', unlockedAt: null },
  { id: 'words-25', name: 'Word Collector', description: 'Master 25 different words', unlockedAt: null },
  { id: 'words-50', name: 'Vocabulary Builder', description: 'Master 50 different words', unlockedAt: null },
  { id: 'games-10', name: 'Busy Bee', description: 'Play 10 spelling rounds', unlockedAt: null },
  { id: 'games-50', name: 'Super Speller', description: 'Play 50 spelling rounds', unlockedAt: null },
  { id: 'score-500', name: 'High Flyer', description: 'Score 500 points in one round', unlockedAt: null },
  { id: 'score-1000', name: 'Spelling Genius', description: 'Score 1000 points in one round', unlockedAt: null },
];

const STORAGE_KEY = 'spellingbee-layla-stats';

function getDefaultStats(): SpellingStats {
  return {
    totalGames: 0,
    wins: 0,
    losses: 0,
    totalWords: 0,
    correctWords: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalScore: 0,
    highScore: 0,
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

export class SpellingStatsTracker {
  private stats: SpellingStats;

  constructor() {
    this.stats = this.load();
  }

  private load(): SpellingStats {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SpellingStats;
        const existingIds = new Set(parsed.achievements.map(a => a.id));
        DEFAULT_ACHIEVEMENTS.forEach(defaultAch => {
          if (!existingIds.has(defaultAch.id)) {
            parsed.achievements.push(defaultAch);
          }
        });
        return parsed;
      }
    } catch {
      console.warn('Failed to load spelling stats');
    }
    return getDefaultStats();
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.stats));
    } catch {
      console.warn('Failed to save spelling stats');
    }
  }

  private unlockAchievement(id: string): SpellingAchievement | null {
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
    correctWords: number,
    wrongWords: number,
    bestStreak: number,
    masteredWords: string[]
  ): SpellingAchievement[] {
    const newAchievements: SpellingAchievement[] = [];

    this.stats.totalGames++;
    this.stats.totalWords += correctWords + wrongWords;
    this.stats.correctWords += correctWords;
    this.stats.totalScore += score;
    this.stats.gamesByDifficulty[difficulty].played++;
    this.stats.lastPlayed = new Date().toISOString();

    // Add mastered words
    masteredWords.forEach(word => {
      if (!this.stats.wordsMastered.includes(word.toLowerCase())) {
        this.stats.wordsMastered.push(word.toLowerCase());
      }
    });

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

      if (this.stats.wins === 1) {
        const ach = this.unlockAchievement('first-win');
        if (ach) newAchievements.push(ach);
      }

      if (wrongWords === 0) {
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

    if (bestStreak >= 5) {
      const ach = this.unlockAchievement('streak-5');
      if (ach) newAchievements.push(ach);
    }
    if (bestStreak >= 10) {
      const ach = this.unlockAchievement('streak-10');
      if (ach) newAchievements.push(ach);
    }

    if (score >= 500) {
      const ach = this.unlockAchievement('score-500');
      if (ach) newAchievements.push(ach);
    }
    if (score >= 1000) {
      const ach = this.unlockAchievement('score-1000');
      if (ach) newAchievements.push(ach);
    }

    if (this.stats.totalGames >= 10) {
      const ach = this.unlockAchievement('games-10');
      if (ach) newAchievements.push(ach);
    }
    if (this.stats.totalGames >= 50) {
      const ach = this.unlockAchievement('games-50');
      if (ach) newAchievements.push(ach);
    }

    if (this.stats.wordsMastered.length >= 25) {
      const ach = this.unlockAchievement('words-25');
      if (ach) newAchievements.push(ach);
    }
    if (this.stats.wordsMastered.length >= 50) {
      const ach = this.unlockAchievement('words-50');
      if (ach) newAchievements.push(ach);
    }

    this.save();
    return newAchievements;
  }

  getStats(): SpellingStats {
    return { ...this.stats };
  }

  getAccuracy(): number {
    if (this.stats.totalWords === 0) return 0;
    return Math.round((this.stats.correctWords / this.stats.totalWords) * 100);
  }
}

export const spellingStatsTracker = new SpellingStatsTracker();
