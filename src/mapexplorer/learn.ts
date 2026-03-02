// Learn Mode game engine — flashcard-then-quiz in batches of 5

import type { Difficulty, MapRegion } from './maps/types';
import { getEasyStates, getAllStates } from './maps/us-states';
import { getWorldRegions } from './maps/world';
import {
  getLearnProgress, saveLearnProgress, awardXP, addStamp,
  XP_AWARDS, setSoftGateUnlocked,
} from './store';

export const BATCH_SIZE = 5;
const MAX_WRONG_BEFORE_HINT = 3;

export type LearnPhase = 'card' | 'quiz';

export interface LearnCard {
  region: MapRegion;
  phase: LearnPhase;
  quizAttempts: number;
  highlighted: boolean;  // after 3 wrong attempts, highlight correct answer
}

export interface LearnBatch {
  difficulty: Difficulty;
  cards: LearnCard[];
  currentCardIndex: number;
  batchNumber: number;
  totalBatches: number;
  complete: boolean;
}

function getPool(difficulty: Difficulty): MapRegion[] {
  if (difficulty === 'easy') return getEasyStates();
  if (difficulty === 'medium') return getAllStates();
  return getWorldRegions();
}

export function getTotalRegions(difficulty: Difficulty): number {
  return getPool(difficulty).length;
}

export function getTotalBatches(difficulty: Difficulty): number {
  return Math.ceil(getPool(difficulty).length / BATCH_SIZE);
}

export function createLearnBatch(difficulty: Difficulty): LearnBatch | null {
  const pool = getPool(difficulty);
  const progress = getLearnProgress(difficulty);
  const batchIndex = progress.currentBatchIndex;
  const start = batchIndex * BATCH_SIZE;

  if (start >= pool.length) return null; // all batches done

  const batchRegions = pool.slice(start, start + BATCH_SIZE);
  const cards: LearnCard[] = batchRegions.map(region => ({
    region,
    phase: 'card' as LearnPhase,
    quizAttempts: 0,
    highlighted: false,
  }));

  return {
    difficulty,
    cards,
    currentCardIndex: 0,
    batchNumber: batchIndex + 1,
    totalBatches: Math.ceil(pool.length / BATCH_SIZE),
    complete: false,
  };
}

export function getCurrentCard(batch: LearnBatch): LearnCard {
  return batch.cards[batch.currentCardIndex];
}

export function advanceToQuiz(batch: LearnBatch): void {
  const card = getCurrentCard(batch);
  card.phase = 'quiz';
}

export interface QuizResult {
  correct: boolean;
  highlighted: boolean;
  batchComplete: boolean;
  xpEarned: number;
}

export function handleQuizClick(batch: LearnBatch, regionId: string): QuizResult {
  const card = getCurrentCard(batch);
  const correct = regionId === card.region.id;
  let xpEarned = 0;

  if (correct) {
    xpEarned = XP_AWARDS.QUIZ_CORRECT;
    awardXP(xpEarned);
    addStamp(batch.difficulty, card.region.id);

    // Save this region as learned
    const progress = getLearnProgress(batch.difficulty);
    if (!progress.learnedRegions.includes(card.region.id)) {
      progress.learnedRegions.push(card.region.id);
      saveLearnProgress(batch.difficulty, progress);
    }

    // Move to next card or complete batch
    if (batch.currentCardIndex >= batch.cards.length - 1) {
      batch.complete = true;
      // Award batch completion XP
      const batchXP = XP_AWARDS.BATCH_COMPLETE;
      awardXP(batchXP);
      xpEarned += batchXP;

      // Advance batch index
      const prog = getLearnProgress(batch.difficulty);
      prog.currentBatchIndex = batch.batchNumber; // batchNumber is 1-indexed, so this moves to next
      saveLearnProgress(batch.difficulty, prog);

      // Check if all batches done for soft gate
      const pool = getPool(batch.difficulty);
      if (prog.learnedRegions.length >= pool.length) {
        setSoftGateUnlocked(batch.difficulty);
      }
    } else {
      batch.currentCardIndex++;
    }

    return { correct: true, highlighted: false, batchComplete: batch.complete, xpEarned };
  }

  // Wrong answer
  card.quizAttempts++;
  if (card.quizAttempts >= MAX_WRONG_BEFORE_HINT) {
    card.highlighted = true;
  }

  return { correct: false, highlighted: card.highlighted, batchComplete: false, xpEarned: 0 };
}

export function getLearnXPForCard(): number {
  return XP_AWARDS.LEARN_CARD;
}
