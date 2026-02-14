// Core Hangman game logic

import { getRandomWord, getCategoryDisplayName, type Difficulty, type Category } from './words';

export type GameState = 'idle' | 'playing' | 'won' | 'lost';

export interface GameData {
  word: string;
  category: Category;
  categoryDisplay: string;
  guessedLetters: Set<string>;
  correctLetters: Set<string>;
  wrongGuesses: number;
  maxWrongGuesses: number;
  state: GameState;
  difficulty: Difficulty;
  hintLetter: string | null;
}

export function createGame(difficulty: Difficulty): GameData {
  const { word, category } = getRandomWord(difficulty);
  const maxWrongGuesses = difficulty === 'easy' ? 8 : 6;

  // For medium difficulty, reveal the first letter as a hint
  let hintLetter: string | null = null;
  const correctLetters = new Set<string>();

  if (difficulty === 'medium') {
    hintLetter = word[0];
    correctLetters.add(hintLetter);
  }

  return {
    word,
    category,
    categoryDisplay: getCategoryDisplayName(category),
    guessedLetters: new Set(),
    correctLetters,
    wrongGuesses: 0,
    maxWrongGuesses,
    state: 'playing',
    difficulty,
    hintLetter
  };
}

export interface GuessResult {
  isCorrect: boolean;
  isNewGuess: boolean;
  gameState: GameState;
  letter: string;
}

export function guessLetter(game: GameData, letter: string): GuessResult {
  const upperLetter = letter.toUpperCase();

  // Check if already guessed
  if (game.guessedLetters.has(upperLetter)) {
    return {
      isCorrect: false,
      isNewGuess: false,
      gameState: game.state,
      letter: upperLetter
    };
  }

  game.guessedLetters.add(upperLetter);

  const isCorrect = game.word.includes(upperLetter);

  if (isCorrect) {
    game.correctLetters.add(upperLetter);

    // Check for win
    const allLettersGuessed = [...game.word].every(
      char => game.correctLetters.has(char)
    );

    if (allLettersGuessed) {
      game.state = 'won';
    }
  } else {
    game.wrongGuesses++;

    // Check for loss
    if (game.wrongGuesses >= game.maxWrongGuesses) {
      game.state = 'lost';
    }
  }

  return {
    isCorrect,
    isNewGuess: true,
    gameState: game.state,
    letter: upperLetter
  };
}

export function getDisplayWord(game: GameData): string[] {
  return [...game.word].map(char =>
    game.correctLetters.has(char) ? char : '_'
  );
}

export function getRemainingGuesses(game: GameData): number {
  return game.maxWrongGuesses - game.wrongGuesses;
}

export function getGuessPercentage(game: GameData): number {
  return (getRemainingGuesses(game) / game.maxWrongGuesses) * 100;
}

export function isLetterHint(game: GameData, letter: string): boolean {
  return game.hintLetter === letter.toUpperCase();
}
