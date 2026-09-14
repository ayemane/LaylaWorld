// Mystery X — main entry point.

import '../styles/mysteryx.css';
import {
  createGame, chooseMove, currentAnswer, nextPuzzle, getEncouragement, type GameData
} from './game';
import { renderLeft, renderMove, describeMove, type Difficulty, type Move } from './equations';
import { mysteryXStats } from './stats';
import { soundManager } from '../game/sounds';

const LIVES_BY_DIFFICULTY: Record<Difficulty, number> = { easy: 5, medium: 4, hard: 3 };

class MysteryXApp {
  private game: GameData | null = null;
  private difficulty: Difficulty = 'easy';
  private locked = false; // ignore taps during the solved animation

  private startScreen = document.getElementById('start-screen')!;
  private gameScreen = document.getElementById('game-screen')!;
  private resultScreen = document.getElementById('result-screen')!;

  constructor() {
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const d = (e.currentTarget as HTMLElement).dataset.difficulty as Difficulty;
        this.startGame(d);
      });
    });

    document.getElementById('play-again-btn')!
      .addEventListener('click', () => this.startGame(this.difficulty));
    document.getElementById('change-level-btn')!
      .addEventListener('click', () => this.showScreen('start'));
  }

  private showScreen(screen: 'start' | 'game' | 'result'): void {
    for (const el of [this.startScreen, this.gameScreen, this.resultScreen]) {
      el.classList.remove('active');
    }
    ({ start: this.startScreen, game: this.gameScreen, result: this.resultScreen })[screen]
      .classList.add('active');
  }

  private startGame(difficulty: Difficulty): void {
    this.difficulty = difficulty;
    this.game = createGame(difficulty);
    this.locked = false;
    this.setMessage('Which move gets x by itself?');
    this.render();
    this.showScreen('game');
    soundManager.play('click');
  }

  private render(): void {
    const g = this.game;
    if (!g) return;

    document.getElementById('score-display')!.textContent = `Score: ${g.score}`;

    const streakEl = document.getElementById('streak-display')!;
    streakEl.textContent = g.streak >= 3 ? `🔥 ${g.streak}` : `${g.streak}`;
    streakEl.classList.toggle('active', g.streak >= 3);

    const max = LIVES_BY_DIFFICULTY[g.difficulty];
    document.getElementById('lives-display')!.textContent =
      '💡'.repeat(g.lives) + '·'.repeat(Math.max(0, max - g.lives));

    document.getElementById('progress-text')!.textContent = `${g.solved}/${g.target}`;
    document.getElementById('progress-fill')!.style.width =
      `${(g.solved / g.target) * 100}%`;

    document.getElementById('scale-left')!.textContent = renderLeft(g.equation);
    document.getElementById('scale-right')!.textContent = `${g.equation.c}`;

    this.renderSteps();
    this.renderMoves();
  }

  private renderSteps(): void {
    const g = this.game!;
    const list = document.getElementById('steps-list')!;
    if (g.steps.length === 0) {
      list.innerHTML = '<li class="steps-empty">Your working will show up here.</li>';
      return;
    }
    list.innerHTML = g.steps
      .map(s => `<li><span class="step-move">${renderMove(s.move)}</span>` +
                `<span class="step-result">${s.result}</span></li>`)
      .join('');
  }

  private renderMoves(): void {
    const g = this.game!;
    const box = document.getElementById('moves-container')!;
    box.innerHTML = '';
    g.choices.forEach(move => {
      const btn = document.createElement('button');
      btn.className = 'move-btn';
      btn.innerHTML = `<span class="move-symbol">${renderMove(move)}</span>` +
                      `<span class="move-desc">both sides</span>`;
      btn.setAttribute('aria-label', describeMove(move));
      btn.addEventListener('click', () => this.pick(move, btn));
      box.appendChild(btn);
    });
  }

  private pick(move: Move, btn: HTMLButtonElement): void {
    const g = this.game;
    if (!g || g.state !== 'playing' || this.locked) return;

    const result = chooseMove(g, move);

    if (!result.productive) {
      soundManager.play('wrong');
      btn.classList.add('shake', 'wrong');
      setTimeout(() => btn.classList.remove('shake', 'wrong'), 600);

      // Show what it WOULD have become. The scale never actually tips — the
      // move was legal — so the lesson is that balance is not the goal,
      // getting x alone is.
      const why = result.makesFractions
        ? `${result.preview} — and now there are fractions.`
        : `${result.preview} — x is still stuck.`;
      this.setMessage(`${getEncouragement(false, 0)} ${why}`, 'warn');
      this.render();

      if (result.newState === 'lost') this.endGame(false);
      return;
    }

    soundManager.play('correct');

    if (!result.puzzleSolved) {
      this.setMessage(getEncouragement(true, g.streak), 'good');
      this.render();
      return;
    }

    // x is free.
    this.locked = true;
    this.render();
    document.getElementById('scale')!.classList.add('solved');
    this.setMessage(`x = ${result.answer}! +${result.pointsEarned} points`, 'good');
    soundManager.play('win');

    setTimeout(() => {
      document.getElementById('scale')!.classList.remove('solved');
      this.locked = false;
      if (g.state === 'won') {
        this.endGame(true);
      } else {
        this.setMessage('Which move gets x by itself?');
        this.render();
      }
    }, 1400);
  }

  private setMessage(text: string, tone: 'good' | 'warn' | 'neutral' = 'neutral'): void {
    const el = document.getElementById('message-display')!;
    el.textContent = text;
    el.className = `message ${tone}`;
    void el.offsetWidth;
    el.classList.add('animate');
  }

  private endGame(won: boolean): void {
    const g = this.game;
    if (!g) return;

    const unlocked = mysteryXStats.recordGame(
      won, g.difficulty, g.score, g.solved, g.perfectPuzzles, g.wrongMoves, g.bestStreak
    );

    soundManager.play(won ? 'win' : 'lose');

    const title = document.getElementById('result-title')!;
    const message = document.getElementById('result-message')!;

    if (won) {
      title.textContent = 'Case Closed!';
      title.className = 'win';
      message.textContent = `You freed x ${g.solved} times.`;
      this.confetti();
    } else {
      title.textContent = 'Out of Hints';
      title.className = 'lose';
      const answer = currentAnswer(g);
      message.textContent = `That last one was x = ${answer}. Try again!`;
    }

    document.getElementById('final-score')!.textContent = `Final Score: ${g.score}`;
    document.getElementById('result-stats')!.innerHTML = `
      Mysteries solved: ${g.solved}<br>
      Solved with no wrong moves: ${g.perfectPuzzles}<br>
      Best streak: ${g.bestStreak}
    `;

    const achEl = document.getElementById('result-achievements')!;
    achEl.innerHTML = unlocked.length
      ? '<h3>New badges!</h3>' + unlocked
          .map(a => `<div class="badge">🏅 <strong>${a.name}</strong> — ${a.description}</div>`)
          .join('')
      : '';

    // Reset for a clean next round.
    nextPuzzle(g);
    setTimeout(() => this.showScreen('result'), 600);
  }

  private confetti(): void {
    const container = document.getElementById('confetti-container')!;
    container.innerHTML = '';
    const colors = ['#fbbf24', '#f472b6', '#34d399', '#60a5fa', '#a78bfa', '#fb923c'];
    for (let i = 0; i < 80; i++) {
      const bit = document.createElement('div');
      bit.className = 'confetti';
      bit.style.cssText = `left:${Math.random() * 100}%;` +
        `background:${colors[Math.floor(Math.random() * colors.length)]};` +
        `animation-delay:${Math.random() * 2}s;`;
      container.appendChild(bit);
    }
    setTimeout(() => { container.innerHTML = ''; }, 5000);
  }
}

document.addEventListener('DOMContentLoaded', () => { new MysteryXApp(); });
