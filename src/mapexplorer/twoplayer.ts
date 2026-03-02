// 2-Player Mode engine — Layla vs Baba, turn-based on one device

import type { Difficulty, MapRegion } from './maps/types';
import { getEasyStates, getAllStates } from './maps/us-states';
import { getWorldRegions } from './maps/world';
import { awardXP, recordTwoPlayerMatch, XP_AWARDS, type TwoPlayerMatch } from './store';

export type Player = 'layla' | 'baba';

export interface TwoPlayerTarget {
  region: MapRegion;
  laylaTime: number | null;   // ms to find, null if not yet played
  laylaCorrect: boolean;
  babaTime: number | null;
  babaCorrect: boolean;
}

export interface TwoPlayerGame {
  difficulty: Difficulty;
  targets: TwoPlayerTarget[];
  currentTargetIndex: number;
  currentPlayer: Player;
  laylaScore: number;
  babaScore: number;
  state: 'playing' | 'switching' | 'done';
  turnStartTime: number;
  totalTargets: number;
}

const TARGET_COUNT: Record<Difficulty, number> = {
  easy: 6,
  medium: 8,
  hard: 6,
};

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function createTwoPlayerGame(difficulty: Difficulty): TwoPlayerGame {
  let pool: MapRegion[];
  if (difficulty === 'easy') pool = getEasyStates();
  else if (difficulty === 'medium') pool = getAllStates();
  else pool = getWorldRegions();

  const count = TARGET_COUNT[difficulty];
  const shuffled = shuffleArray(pool).slice(0, count);

  const targets: TwoPlayerTarget[] = shuffled.map(region => ({
    region,
    laylaTime: null,
    laylaCorrect: false,
    babaTime: null,
    babaCorrect: false,
  }));

  return {
    difficulty,
    targets,
    currentTargetIndex: 0,
    currentPlayer: 'layla',
    laylaScore: 0,
    babaScore: 0,
    state: 'playing',
    turnStartTime: Date.now(),
    totalTargets: count,
  };
}

export function getCurrentTwoPlayerTarget(game: TwoPlayerGame): MapRegion {
  return game.targets[game.currentTargetIndex].region;
}

function calcScore(timeMs: number): number {
  const base = 10;
  // Speed bonus: up to 10 extra points for answering in under 5 seconds
  const seconds = timeMs / 1000;
  const speedBonus = seconds < 5 ? Math.round(10 - seconds * 2) : 0;
  return base + speedBonus;
}

export interface TwoPlayerClickResult {
  correct: boolean;
  pointsEarned: number;
  needSwitch: boolean;  // show "Pass to other player" screen
  gameOver: boolean;
}

export function handleTwoPlayerClick(game: TwoPlayerGame, regionId: string): TwoPlayerClickResult {
  const target = game.targets[game.currentTargetIndex];
  const correct = regionId === target.region.id;

  if (!correct) {
    return { correct: false, pointsEarned: 0, needSwitch: false, gameOver: false };
  }

  const elapsed = Date.now() - game.turnStartTime;
  const points = calcScore(elapsed);

  if (game.currentPlayer === 'layla') {
    target.laylaTime = elapsed;
    target.laylaCorrect = true;
    game.laylaScore += points;

    // Switch to Baba for same target
    game.currentPlayer = 'baba';
    game.state = 'switching';
    game.turnStartTime = Date.now();

    return { correct: true, pointsEarned: points, needSwitch: true, gameOver: false };
  } else {
    // Baba's turn
    target.babaTime = elapsed;
    target.babaCorrect = true;
    game.babaScore += points;

    // Move to next target or end game
    if (game.currentTargetIndex >= game.targets.length - 1) {
      game.state = 'done';
      finishGame(game);
      return { correct: true, pointsEarned: points, needSwitch: false, gameOver: true };
    }

    // Next target, Layla goes first
    game.currentTargetIndex++;
    game.currentPlayer = 'layla';
    game.state = 'switching';
    game.turnStartTime = Date.now();

    return { correct: true, pointsEarned: points, needSwitch: true, gameOver: false };
  }
}

export function skipTwoPlayerTurn(game: TwoPlayerGame): TwoPlayerClickResult {
  // For timeout or giving up — no points awarded
  if (game.currentPlayer === 'layla') {
    game.currentPlayer = 'baba';
    game.state = 'switching';
    game.turnStartTime = Date.now();
    return { correct: false, pointsEarned: 0, needSwitch: true, gameOver: false };
  } else {
    if (game.currentTargetIndex >= game.targets.length - 1) {
      game.state = 'done';
      finishGame(game);
      return { correct: false, pointsEarned: 0, needSwitch: false, gameOver: true };
    }
    game.currentTargetIndex++;
    game.currentPlayer = 'layla';
    game.state = 'switching';
    game.turnStartTime = Date.now();
    return { correct: false, pointsEarned: 0, needSwitch: true, gameOver: false };
  }
}

function finishGame(game: TwoPlayerGame): void {
  // Record match
  const match: TwoPlayerMatch = {
    date: Date.now(),
    laylaScore: game.laylaScore,
    babaScore: game.babaScore,
    difficulty: game.difficulty,
  };
  recordTwoPlayerMatch(match);

  // Award XP to Layla
  if (game.laylaScore > game.babaScore) {
    awardXP(XP_AWARDS.BEAT_BABA);
  }

  // Perfect game bonus (Layla got all correct)
  const allCorrect = game.targets.every(t => t.laylaCorrect);
  if (allCorrect) {
    awardXP(XP_AWARDS.PERFECT_GAME);
  }
}

export function getWinner(game: TwoPlayerGame): 'layla' | 'baba' | 'draw' {
  if (game.laylaScore > game.babaScore) return 'layla';
  if (game.babaScore > game.laylaScore) return 'baba';
  return 'draw';
}

export function startTurn(game: TwoPlayerGame): void {
  game.state = 'playing';
  game.turnStartTime = Date.now();
}
