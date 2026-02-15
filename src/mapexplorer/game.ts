// Map Explorer game logic

import type { Difficulty, MapRegion } from './maps/types';
import { getEasyStates, getAllStates } from './maps/us-states';
import { getWorldRegions } from './maps/world';

export type GameState = 'idle' | 'playing' | 'won' | 'lost';

export interface GameData {
  difficulty: Difficulty;
  targets: MapRegion[];
  currentTargetIndex: number;
  score: number;
  streak: number;
  bestStreak: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalQuestions: number;
  state: GameState;
  timeLeft: number;
  lives: number;
  hintsRemaining: number;
  foundRegions: Set<string>;
  questionStartTime: number;
}

const TOTAL_QUESTIONS: Record<Difficulty, number> = {
  easy: 8,
  medium: 12,
  hard: 10
};

const STARTING_LIVES: Record<Difficulty, number> = {
  easy: 5,
  medium: 4,
  hard: 3
};

const TIME_PER_QUESTION: Record<Difficulty, number> = {
  easy: 30,
  medium: 20,
  hard: 25
};

const HINTS: Record<Difficulty, number> = {
  easy: 2,
  medium: 1,
  hard: 0
};

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function pickTargets(difficulty: Difficulty): MapRegion[] {
  let pool: MapRegion[];
  if (difficulty === 'easy') {
    pool = getEasyStates();
  } else if (difficulty === 'medium') {
    pool = getAllStates();
  } else {
    pool = getWorldRegions();
  }
  const shuffled = shuffleArray(pool);
  return shuffled.slice(0, TOTAL_QUESTIONS[difficulty]);
}

export function getMapType(difficulty: Difficulty): 'us' | 'world' {
  return difficulty === 'hard' ? 'world' : 'us';
}

export function createGame(difficulty: Difficulty): GameData {
  const targets = pickTargets(difficulty);
  return {
    difficulty,
    targets,
    currentTargetIndex: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    totalQuestions: targets.length,
    state: 'playing',
    timeLeft: TIME_PER_QUESTION[difficulty],
    lives: STARTING_LIVES[difficulty],
    hintsRemaining: HINTS[difficulty],
    foundRegions: new Set(),
    questionStartTime: Date.now()
  };
}

export function getCurrentTarget(game: GameData): MapRegion {
  return game.targets[game.currentTargetIndex];
}

export interface ClickResult {
  correct: boolean;
  pointsEarned: number;
  newState: GameState;
  streakBonus: boolean;
  speedBonus: boolean;
  funFact: string | null;
}

export function handleRegionClick(game: GameData, regionId: string): ClickResult {
  const target = getCurrentTarget(game);
  const correct = regionId === target.id;
  let pointsEarned = 0;
  let streakBonus = false;
  let speedBonus = false;
  let funFact: string | null = null;

  if (correct) {
    game.correctAnswers++;
    game.streak++;
    game.foundRegions.add(regionId);

    if (game.streak > game.bestStreak) {
      game.bestStreak = game.streak;
    }

    // Base points
    pointsEarned = 10;

    // Streak bonus (3+ streak = +2x streak)
    if (game.streak >= 3) {
      pointsEarned += game.streak * 2;
      streakBonus = true;
    }

    // Speed bonus (+5 if < 5s)
    const elapsed = (Date.now() - game.questionStartTime) / 1000;
    if (elapsed < 5) {
      pointsEarned += 5;
      speedBonus = true;
    }

    game.score += pointsEarned;
    funFact = target.funFact;

    // Check for win
    if (game.currentTargetIndex >= game.totalQuestions - 1) {
      game.state = 'won';
    } else {
      // Advance to next question
      game.currentTargetIndex++;
      game.timeLeft = TIME_PER_QUESTION[game.difficulty];
      game.questionStartTime = Date.now();
    }
  } else {
    game.wrongAnswers++;
    game.streak = 0;
    game.lives--;

    if (game.lives <= 0) {
      game.state = 'lost';
    }
    // Same question repeats on wrong answer
  }

  return {
    correct,
    pointsEarned,
    newState: game.state,
    streakBonus,
    speedBonus,
    funFact
  };
}

export function handleTimeout(game: GameData): ClickResult {
  game.wrongAnswers++;
  game.streak = 0;
  game.lives--;

  if (game.lives <= 0) {
    game.state = 'lost';
  } else {
    // Move to next question on timeout
    if (game.currentTargetIndex < game.totalQuestions - 1) {
      game.currentTargetIndex++;
      game.timeLeft = TIME_PER_QUESTION[game.difficulty];
      game.questionStartTime = Date.now();
    } else {
      game.state = 'lost';
    }
  }

  return {
    correct: false,
    pointsEarned: 0,
    newState: game.state,
    streakBonus: false,
    speedBonus: false,
    funFact: null
  };
}

export function useHint(game: GameData): string | null {
  if (game.hintsRemaining <= 0) return null;
  game.hintsRemaining--;
  return getCurrentTarget(game).id;
}

export function getEncouragingMessage(correct: boolean, streak: number): string {
  if (!correct) {
    const messages = ["Keep looking!", "Try again!", "You've got this!", "Almost!"];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  if (streak >= 5) {
    return ["AMAZING!", "UNSTOPPABLE!", "GEOGRAPHY GENIUS!", "ON FIRE!"][Math.floor(Math.random() * 4)];
  }

  if (streak >= 3) {
    return ["Great streak!", "Keep exploring!", "Awesome!", "Fantastic!"][Math.floor(Math.random() * 4)];
  }

  return ["Correct!", "Nice find!", "Good job!", "Yes!", "You found it!"][Math.floor(Math.random() * 5)];
}

export function getProgress(game: GameData): number {
  return Math.min(100, (game.correctAnswers / game.totalQuestions) * 100);
}
