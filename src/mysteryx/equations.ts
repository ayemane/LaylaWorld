// Mystery X — equation generation and balance-scale moves.
//
// Every equation is held as  (a·x)/d + b = c  with integers throughout.
// Generation works BACKWARDS from a chosen x, so the solution is always a
// whole number and no step ever produces a fraction. That matters: a 3rd
// grader meeting algebra should not also be meeting 7/3.

export type Difficulty = 'easy' | 'medium' | 'hard';
export type MoveKind = 'add' | 'sub' | 'mul' | 'div';

export interface Equation {
  a: number; // coefficient on x   (a·x)
  d: number; // divisor under x    (a·x)/d
  b: number; // constant on the left
  c: number; // the whole right side
}

export interface Move {
  kind: MoveKind;
  n: number;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** The value of x that solves this equation. */
export function solutionOf(eq: Equation): number {
  return ((eq.c - eq.b) * eq.d) / eq.a;
}

/** x is alone: the equation now literally reads  x = c. */
export function isSolved(eq: Equation): boolean {
  return eq.a === 1 && eq.d === 1 && eq.b === 0;
}

/**
 * The productive next move.
 *
 * Order is forced — clear the constant first, then undo the coefficient.
 * Other orders are legal algebra but drag fractions in, which is exactly
 * what we are protecting her from at this age.
 */
export function nextBestMove(eq: Equation): Move | null {
  if (isSolved(eq)) return null;
  if (eq.b > 0) return { kind: 'sub', n: eq.b };
  if (eq.b < 0) return { kind: 'add', n: -eq.b };
  if (eq.a > 1) return { kind: 'div', n: eq.a };
  if (eq.d > 1) return { kind: 'mul', n: eq.d };
  return null;
}

/** Apply a move to BOTH sides. Always balance-preserving, never mutating. */
export function applyMove(eq: Equation, move: Move): Equation {
  const { kind, n } = move;
  switch (kind) {
    case 'add':
      return { ...eq, b: eq.b + n, c: eq.c + n };
    case 'sub':
      return { ...eq, b: eq.b - n, c: eq.c - n };
    case 'mul':
      return { a: eq.a * n, d: eq.d, b: eq.b * n, c: eq.c * n };
    case 'div':
      return { a: eq.a, d: eq.d * n, b: eq.b / n, c: eq.c / n };
  }
}

/** Simplify (a·x)/d by the gcd, so 3x/3 renders as x rather than 3x/3. */
function gcd(p: number, q: number): number {
  p = Math.abs(p);
  q = Math.abs(q);
  while (q) [p, q] = [q, p % q];
  return p || 1;
}

export function normalize(eq: Equation): Equation {
  const g = gcd(eq.a, eq.d);
  return { ...eq, a: eq.a / g, d: eq.d / g };
}

/** Render one side of the scale, e.g. "3x + 10" or "x/2 − 4". */
export function renderLeft(eq: Equation): string {
  const { a, d, b } = eq;
  let term: string;
  if (a === 1) term = 'x';
  else term = `${a}x`;
  if (d > 1) term = `${term}/${d}`;
  if (b === 0) return term;
  return b > 0 ? `${term} + ${b}` : `${term} − ${Math.abs(b)}`;
}

export function renderEquation(eq: Equation): string {
  return `${renderLeft(eq)} = ${eq.c}`;
}

export function renderMove(move: Move): string {
  const sym = { add: '+', sub: '−', mul: '×', div: '÷' }[move.kind];
  return `${sym} ${move.n}`;
}

export function describeMove(move: Move): string {
  const verb = { add: 'Add', sub: 'Subtract', mul: 'Multiply by', div: 'Divide by' }[move.kind];
  return `${verb} ${move.n} on both sides`;
}

// ── generation ──────────────────────────────────────────────────────

/** One step: x + b = c, or a·x = c. */
function generateOneStep(): Equation {
  const x = randomInt(2, 12);
  if (Math.random() < 0.5) {
    const b = Math.random() < 0.75 ? randomInt(2, 15) : -randomInt(2, 9);
    return { a: 1, d: 1, b, c: x + b };
  }
  const a = randomInt(2, 6);
  return { a, d: 1, b: 0, c: a * x };
}

/** Two steps: a·x + b = c — the shape Aki has been drilling. */
function generateTwoStep(hard: boolean): Equation {
  const x = randomInt(2, hard ? 12 : 9);
  const a = randomInt(2, hard ? 9 : 5);
  // A negative b forces her to ADD rather than subtract, which is the step
  // most kids get wrong. Weight it in only on hard.
  const negative = hard ? Math.random() < 0.35 : Math.random() < 0.15;
  const b = negative ? -randomInt(2, 12) : randomInt(2, hard ? 20 : 12);
  return { a, d: 1, b, c: a * x + b };
}

/** Two steps with a divisor: x/d + b = c. */
function generateDivisionForm(): Equation {
  const d = randomInt(2, 5);
  const k = randomInt(2, 9); // x = d·k, so the division stays whole
  const b = Math.random() < 0.25 ? -randomInt(2, 8) : randomInt(2, 14);
  return { a: 1, d, b, c: k + b };
}

export function generateEquation(difficulty: Difficulty): Equation {
  switch (difficulty) {
    case 'easy':
      return generateOneStep();
    case 'medium':
      return generateTwoStep(false);
    case 'hard':
      return Math.random() < 0.3 ? generateDivisionForm() : generateTwoStep(true);
  }
}

// ── move choices ────────────────────────────────────────────────────

function sameMove(p: Move, q: Move): boolean {
  return p.kind === q.kind && p.n === q.n;
}

/**
 * Four buttons: the productive move plus three that are also perfectly legal.
 *
 * This is the whole point of the game. Every option keeps the scale balanced —
 * that is what "do the same thing to both sides" means — so the skill being
 * taught is not "which move is allowed" but "which move gets x alone". The
 * wrong answers are therefore not errors of arithmetic, they are moves that
 * leave x no closer to being by itself.
 */
export function moveChoices(eq: Equation): Move[] {
  const best = nextBestMove(eq);
  if (!best) return [];

  const candidates: Move[] = [];
  const add = (m: Move) => {
    if (m.n > 0 && !sameMove(m, best) && !candidates.some(c => sameMove(c, m))) {
      candidates.push(m);
    }
  };

  // The reverse direction is ALWAYS offered, never shuffled out. Without it
  // every option can end up being "subtract something", and the puzzle
  // collapses into matching the constant instead of deciding which way to
  // undo it — which is the actual idea being taught.
  const opposite: Record<MoveKind, MoveKind> = { add: 'sub', sub: 'add', mul: 'div', div: 'mul' };
  const reverse: Move = { kind: opposite[best.kind], n: best.n };

  // Right idea, wrong number.
  add({ kind: best.kind, n: best.n + randomInt(1, 3) });
  add({ kind: best.kind, n: Math.max(1, best.n - randomInt(1, 3)) });

  // Reaching for the coefficient while a constant is still in the way:
  // legal, but it is how you end up with thirds.
  if (eq.b !== 0 && eq.a > 1) add({ kind: 'div', n: eq.a });
  if (eq.b !== 0 && eq.d > 1) add({ kind: 'mul', n: eq.d });
  add({ kind: 'sub', n: Math.abs(eq.c) });

  // Shuffle the distractors and take three.
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  const choices = [best, reverse, ...candidates.slice(0, 2)];

  for (let i = choices.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return choices;
}
