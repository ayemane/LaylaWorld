// Mystery X game logic — one puzzle is one equation solved to x = n.

import {
  generateEquation, applyMove, normalize, isSolved, solutionOf,
  nextBestMove, moveChoices, renderEquation,
  type Equation, type Move, type Difficulty
} from './equations';

export type GameState = 'playing' | 'won' | 'lost';

export interface Step {
  move: Move;
  result: string; // the equation as it read after the move
}

export interface GameData {
  difficulty: Difficulty;
  equation: Equation;
  original: Equation;
  choices: Move[];
  steps: Step[];
  solved: number;
  target: number;
  wrongMoves: number;
  lives: number;
  score: number;
  streak: number;
  bestStreak: number;
  perfectPuzzles: number; // solved with no wrong move
  /** Per-puzzle, not per-game: reset by nextPuzzle(). Lives here rather than in
   *  module scope so two games can never share it. */
  puzzleHadMistake: boolean;
  state: GameState;
}

const PUZZLES_TO_WIN: Record<Difficulty, number> = { easy: 8, medium: 8, hard: 10 };
const STARTING_LIVES: Record<Difficulty, number> = { easy: 5, medium: 4, hard: 3 };

export function createGame(difficulty: Difficulty): GameData {
  const equation = generateEquation(difficulty);
  return {
    difficulty,
    equation,
    original: equation,
    choices: moveChoices(equation),
    steps: [],
    solved: 0,
    target: PUZZLES_TO_WIN[difficulty],
    wrongMoves: 0,
    lives: STARTING_LIVES[difficulty],
    score: 0,
    streak: 0,
    bestStreak: 0,
    perfectPuzzles: 0,
    puzzleHadMistake: false,
    state: 'playing'
  };
}

export interface MoveResult {
  productive: boolean;
  /** What the board WOULD have said. Shown, then thrown away, on a wrong pick. */
  preview: string;
  /** True when the wrong move drags in fractions — the real reason it is a bad idea. */
  makesFractions: boolean;
  puzzleSolved: boolean;
  answer: number | null;
  pointsEarned: number;
  newState: GameState;
}

export function chooseMove(game: GameData, move: Move): MoveResult {
  const best = nextBestMove(game.equation);
  const productive = !!best && best.kind === move.kind && best.n === move.n;
  const would = normalize(applyMove(game.equation, move));
  const makesFractions = ![would.a, would.d, would.b, would.c].every(Number.isInteger);

  if (!productive) {
    // The move was legal — the scale is still balanced — it just did not help.
    // Nothing is committed, so she cannot be stranded in a mess she can't undo.
    game.wrongMoves++;
    game.streak = 0;
    game.lives--;
    game.puzzleHadMistake = true;
    if (game.lives <= 0) game.state = 'lost';
    return {
      productive: false,
      preview: renderEquation(would),
      makesFractions,
      puzzleSolved: false,
      answer: null,
      pointsEarned: 0,
      newState: game.state
    };
  }

  game.equation = would;
  game.steps.push({ move, result: renderEquation(would) });

  if (!isSolved(game.equation)) {
    game.choices = moveChoices(game.equation);
    return {
      productive: true, preview: renderEquation(would), makesFractions: false,
      puzzleSolved: false, answer: null, pointsEarned: 5, newState: game.state
    };
  }

  // x is alone — puzzle done.
  const answer = game.equation.c;
  game.solved++;
  game.streak++;
  if (game.streak > game.bestStreak) game.bestStreak = game.streak;

  let points = 20;
  if (!game.puzzleHadMistake) {
    points += 10;
    game.perfectPuzzles++;
  }
  if (game.streak >= 3) points += game.streak * 3;
  game.score += points;

  if (game.solved >= game.target) {
    game.state = 'won';
  } else {
    nextPuzzle(game);
  }

  return {
    productive: true,
    preview: renderEquation(would),
    makesFractions: false,
    puzzleSolved: true,
    answer,
    pointsEarned: points,
    newState: game.state
  };
}

export function nextPuzzle(game: GameData): void {
  const equation = generateEquation(game.difficulty);
  game.equation = equation;
  game.original = equation;
  game.choices = moveChoices(equation);
  game.steps = [];
  game.puzzleHadMistake = false;
}

/** The answer she was working toward, for the reveal when lives run out. */
export function currentAnswer(game: GameData): number {
  return solutionOf(game.original);
}

export function getEncouragement(productive: boolean, streak: number): string {
  if (!productive) {
    return pick([
      'Still balanced — but x is no closer.',
      'That is allowed! It just does not free x.',
      'Legal move, wrong direction.',
      'Both sides stayed equal — but look where x is.'
    ]);
  }
  if (streak >= 5) return pick(['UNSTOPPABLE! ⚡', 'ALGEBRA WIZARD! 🧙', 'ON FIRE! 🔥']);
  if (streak >= 3) return pick(['Great streak!', 'You have got the pattern!', 'Keep going!']);
  return pick(['Nice move!', 'Yes!', 'That is it!', 'Good thinking!']);
}

function pick(items: string[]): string {
  return items[Math.floor(Math.random() * items.length)];
}
