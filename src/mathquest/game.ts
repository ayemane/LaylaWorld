// Math Quest game logic

import { generateProblem, type Problem, type Difficulty } from './problems';

export type GameState = 'idle' | 'playing' | 'won' | 'lost';

export interface GameData {
  difficulty: Difficulty;
  currentProblem: Problem;
  score: number;
  streak: number;
  bestStreak: number;
  questionsAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalQuestions: number;
  rocketHeight: number; // 0-100 progress
  state: GameState;
  timeLeft: number;
  lives: number;
}

const QUESTIONS_TO_WIN: Record<Difficulty, number> = {
  easy: 10,
  medium: 12,
  hard: 15
};

const STARTING_LIVES: Record<Difficulty, number> = {
  easy: 5,
  medium: 4,
  hard: 3
};

const TIME_PER_QUESTION: Record<Difficulty, number> = {
  easy: 30,
  medium: 20,
  hard: 15
};

export function createGame(difficulty: Difficulty): GameData {
  return {
    difficulty,
    currentProblem: generateProblem(difficulty),
    score: 0,
    streak: 0,
    bestStreak: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    totalQuestions: QUESTIONS_TO_WIN[difficulty],
    rocketHeight: 0,
    state: 'playing',
    timeLeft: TIME_PER_QUESTION[difficulty],
    lives: STARTING_LIVES[difficulty]
  };
}

export interface AnswerResult {
  correct: boolean;
  correctAnswer: number;
  pointsEarned: number;
  newState: GameState;
  streakBonus: boolean;
}

export function submitAnswer(game: GameData, answer: number): AnswerResult {
  const correct = answer === game.currentProblem.answer;
  const correctAnswer = game.currentProblem.answer;
  let pointsEarned = 0;
  let streakBonus = false;

  game.questionsAnswered++;

  if (correct) {
    game.correctAnswers++;
    game.streak++;

    if (game.streak > game.bestStreak) {
      game.bestStreak = game.streak;
    }

    // Base points + streak bonus
    pointsEarned = 10;
    if (game.streak >= 3) {
      pointsEarned += game.streak * 2;
      streakBonus = true;
    }

    game.score += pointsEarned;

    // Update rocket progress
    game.rocketHeight = Math.min(100, (game.correctAnswers / game.totalQuestions) * 100);

    // Check for win
    if (game.correctAnswers >= game.totalQuestions) {
      game.state = 'won';
    } else {
      // Next problem
      game.currentProblem = generateProblem(game.difficulty);
      game.timeLeft = TIME_PER_QUESTION[game.difficulty];
    }
  } else {
    game.wrongAnswers++;
    game.streak = 0;
    game.lives--;

    // Rocket drops a bit on wrong answer
    game.rocketHeight = Math.max(0, game.rocketHeight - 5);

    // Check for loss
    if (game.lives <= 0) {
      game.state = 'lost';
    } else {
      // Next problem
      game.currentProblem = generateProblem(game.difficulty);
      game.timeLeft = TIME_PER_QUESTION[game.difficulty];
    }
  }

  return {
    correct,
    correctAnswer,
    pointsEarned,
    newState: game.state,
    streakBonus
  };
}

export function handleTimeout(game: GameData): AnswerResult {
  return submitAnswer(game, -9999); // Wrong answer
}

export function getEncouragingMessage(correct: boolean, streak: number): string {
  if (!correct) {
    const messages = [
      "Keep trying!",
      "You've got this!",
      "Almost!",
      "Don't give up!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  if (streak >= 5) {
    const messages = [
      "AMAZING! 🔥",
      "UNSTOPPABLE! 🚀",
      "GENIUS! 🧠",
      "ON FIRE! ⚡"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  if (streak >= 3) {
    const messages = [
      "Great streak!",
      "Keep it up!",
      "Awesome!",
      "Fantastic!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  const messages = [
    "Correct!",
    "Nice!",
    "Good job!",
    "Yes!",
    "Right!"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getRocketStage(height: number): string {
  if (height >= 100) return '🌟';
  if (height >= 75) return '🚀';
  if (height >= 50) return '🔥';
  if (height >= 25) return '💨';
  return '🛸';
}
