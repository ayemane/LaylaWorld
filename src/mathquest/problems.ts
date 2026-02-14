// Math problem generation by difficulty

export type Operation = 'add' | 'subtract' | 'multiply' | 'divide';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Problem {
  question: string;
  answer: number;
  operation: Operation;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateAddition(difficulty: Difficulty): Problem {
  let a: number, b: number;

  switch (difficulty) {
    case 'easy':
      a = randomInt(1, 10);
      b = randomInt(1, 10);
      break;
    case 'medium':
      a = randomInt(10, 50);
      b = randomInt(10, 50);
      break;
    case 'hard':
      a = randomInt(50, 200);
      b = randomInt(50, 200);
      break;
  }

  return {
    question: `${a} + ${b}`,
    answer: a + b,
    operation: 'add'
  };
}

function generateSubtraction(difficulty: Difficulty): Problem {
  let a: number, b: number;

  switch (difficulty) {
    case 'easy':
      a = randomInt(5, 15);
      b = randomInt(1, a); // Ensure positive result
      break;
    case 'medium':
      a = randomInt(20, 100);
      b = randomInt(10, a);
      break;
    case 'hard':
      a = randomInt(100, 300);
      b = randomInt(50, a);
      break;
  }

  return {
    question: `${a} − ${b}`,
    answer: a - b,
    operation: 'subtract'
  };
}

function generateMultiplication(difficulty: Difficulty): Problem {
  let a: number, b: number;

  switch (difficulty) {
    case 'easy':
      a = randomInt(1, 5);
      b = randomInt(1, 5);
      break;
    case 'medium':
      a = randomInt(2, 10);
      b = randomInt(2, 10);
      break;
    case 'hard':
      a = randomInt(5, 12);
      b = randomInt(5, 12);
      break;
  }

  return {
    question: `${a} × ${b}`,
    answer: a * b,
    operation: 'multiply'
  };
}

function generateDivision(difficulty: Difficulty): Problem {
  let a: number, b: number, answer: number;

  switch (difficulty) {
    case 'easy':
      b = randomInt(1, 5);
      answer = randomInt(1, 5);
      a = b * answer;
      break;
    case 'medium':
      b = randomInt(2, 10);
      answer = randomInt(2, 10);
      a = b * answer;
      break;
    case 'hard':
      b = randomInt(3, 12);
      answer = randomInt(3, 12);
      a = b * answer;
      break;
  }

  return {
    question: `${a} ÷ ${b}`,
    answer: answer,
    operation: 'divide'
  };
}

export function generateProblem(difficulty: Difficulty): Problem {
  const operations: Operation[] =
    difficulty === 'easy'
      ? ['add', 'subtract']
      : difficulty === 'medium'
        ? ['add', 'subtract', 'multiply']
        : ['add', 'subtract', 'multiply', 'divide'];

  const operation = operations[randomInt(0, operations.length - 1)];

  switch (operation) {
    case 'add':
      return generateAddition(difficulty);
    case 'subtract':
      return generateSubtraction(difficulty);
    case 'multiply':
      return generateMultiplication(difficulty);
    case 'divide':
      return generateDivision(difficulty);
  }
}

export function getOperationEmoji(operation: Operation): string {
  switch (operation) {
    case 'add': return '➕';
    case 'subtract': return '➖';
    case 'multiply': return '✖️';
    case 'divide': return '➗';
  }
}
