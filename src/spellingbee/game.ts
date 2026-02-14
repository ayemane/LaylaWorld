// Spelling Bee game logic

import { getWordsForRound, type SpellingWord, type Difficulty } from './words';

export type GameState = 'idle' | 'playing' | 'won' | 'lost';

export interface GameData {
  difficulty: Difficulty;
  words: SpellingWord[];
  currentIndex: number;
  currentWord: SpellingWord;
  score: number;
  streak: number;
  bestStreak: number;
  correctCount: number;
  wrongCount: number;
  totalWords: number;
  lives: number;
  state: GameState;
  hintsUsed: number;
}

const WORDS_PER_ROUND: Record<Difficulty, number> = {
  easy: 8,
  medium: 10,
  hard: 12
};

const STARTING_LIVES: Record<Difficulty, number> = {
  easy: 4,
  medium: 3,
  hard: 3
};

export function createGame(difficulty: Difficulty): GameData {
  const wordCount = WORDS_PER_ROUND[difficulty];
  const words = getWordsForRound(difficulty, wordCount);

  return {
    difficulty,
    words,
    currentIndex: 0,
    currentWord: words[0],
    score: 0,
    streak: 0,
    bestStreak: 0,
    correctCount: 0,
    wrongCount: 0,
    totalWords: wordCount,
    lives: STARTING_LIVES[difficulty],
    state: 'playing',
    hintsUsed: 0
  };
}

export interface SpellingResult {
  correct: boolean;
  correctSpelling: string;
  pointsEarned: number;
  newState: GameState;
  streakBonus: boolean;
}

export function checkSpelling(game: GameData, attempt: string): SpellingResult {
  const correct = attempt.toLowerCase().trim() === game.currentWord.word.toLowerCase();
  const correctSpelling = game.currentWord.word;
  let pointsEarned = 0;
  let streakBonus = false;

  if (correct) {
    game.correctCount++;
    game.streak++;

    if (game.streak > game.bestStreak) {
      game.bestStreak = game.streak;
    }

    // Points based on word length + streak bonus
    pointsEarned = game.currentWord.word.length * 10;
    if (game.streak >= 3) {
      pointsEarned += game.streak * 5;
      streakBonus = true;
    }

    // Bonus for not using hints
    if (game.hintsUsed === 0) {
      pointsEarned += 10;
    }

    game.score += pointsEarned;

    // Move to next word or win
    if (game.currentIndex >= game.totalWords - 1) {
      game.state = 'won';
    } else {
      game.currentIndex++;
      game.currentWord = game.words[game.currentIndex];
      game.hintsUsed = 0;
    }
  } else {
    game.wrongCount++;
    game.streak = 0;
    game.lives--;

    if (game.lives <= 0) {
      game.state = 'lost';
    }
    // Don't advance - let them try again or skip
  }

  return {
    correct,
    correctSpelling,
    pointsEarned,
    newState: game.state,
    streakBonus
  };
}

export function skipWord(game: GameData): void {
  game.wrongCount++;
  game.streak = 0;
  game.lives--;

  if (game.lives <= 0) {
    game.state = 'lost';
  } else if (game.currentIndex >= game.totalWords - 1) {
    game.state = 'lost'; // Can't skip last word
  } else {
    game.currentIndex++;
    game.currentWord = game.words[game.currentIndex];
    game.hintsUsed = 0;
  }
}

export function useHint(game: GameData): void {
  game.hintsUsed++;
}

export function getProgress(game: GameData): number {
  return (game.currentIndex / game.totalWords) * 100;
}

export function getEncouragingMessage(correct: boolean, streak: number): string {
  if (!correct) {
    const messages = [
      "Try again!",
      "Almost there!",
      "You can do it!",
      "Sound it out!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  if (streak >= 5) {
    const messages = [
      "AMAZING SPELLER!",
      "YOU'RE ON FIRE!",
      "INCREDIBLE!",
      "SPELLING SUPERSTAR!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  if (streak >= 3) {
    const messages = [
      "Great streak!",
      "Keep buzzing!",
      "Fantastic!",
      "Wonderful!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  const messages = [
    "Correct!",
    "Great job!",
    "Well done!",
    "Perfect!",
    "You got it!"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}
