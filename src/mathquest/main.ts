// Math Quest - Main entry point

import '../styles/mathquest.css';
import { createGame, submitAnswer, getEncouragingMessage, getRocketStage, type GameData } from './game';
import type { Difficulty } from './problems';
import { mathStatsTracker } from './stats';
import { soundManager } from '../game/sounds';

class MathQuestApp {
  private game: GameData | null = null;
  private currentDifficulty: Difficulty = 'easy';
  private timerInterval: number | null = null;

  // DOM elements
  private startScreen = document.getElementById('start-screen')!;
  private gameScreen = document.getElementById('game-screen')!;
  private resultScreen = document.getElementById('result-screen')!;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Difficulty buttons
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const difficulty = target.dataset.difficulty as Difficulty;
        this.startGame(difficulty);
      });
    });

    // Answer input
    const answerInput = document.getElementById('answer-input') as HTMLInputElement;
    const submitBtn = document.getElementById('submit-btn')!;

    submitBtn.addEventListener('click', () => this.submitAnswer());

    answerInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.submitAnswer();
      }
    });

    // Number pad
    document.querySelectorAll('.num-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const value = target.dataset.value!;

        if (value === 'clear') {
          answerInput.value = '';
        } else if (value === 'backspace') {
          answerInput.value = answerInput.value.slice(0, -1);
        } else if (value === 'negative') {
          if (answerInput.value.startsWith('-')) {
            answerInput.value = answerInput.value.slice(1);
          } else {
            answerInput.value = '-' + answerInput.value;
          }
        } else {
          answerInput.value += value;
        }

        soundManager.play('click');
        answerInput.focus();
      });
    });

    // Result buttons
    document.getElementById('play-again-btn')!.addEventListener('click', () => {
      this.startGame(this.currentDifficulty);
    });

    document.getElementById('change-level-btn')!.addEventListener('click', () => {
      this.showScreen('start');
    });
  }

  private showScreen(screen: 'start' | 'game' | 'result'): void {
    this.startScreen.classList.remove('active');
    this.gameScreen.classList.remove('active');
    this.resultScreen.classList.remove('active');

    if (screen === 'start') this.startScreen.classList.add('active');
    if (screen === 'game') this.gameScreen.classList.add('active');
    if (screen === 'result') this.resultScreen.classList.add('active');
  }

  private startGame(difficulty: Difficulty): void {
    this.currentDifficulty = difficulty;
    this.game = createGame(difficulty);

    // Reset UI
    (document.getElementById('answer-input') as HTMLInputElement).value = '';
    document.getElementById('message-display')!.textContent = '';

    this.updateDisplay();
    this.showScreen('game');
    this.startTimer();

    soundManager.play('click');
    (document.getElementById('answer-input') as HTMLInputElement).focus();
  }

  private startTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = window.setInterval(() => {
      if (!this.game || this.game.state !== 'playing') {
        if (this.timerInterval) clearInterval(this.timerInterval);
        return;
      }

      this.game.timeLeft--;
      this.updateTimerDisplay();

      if (this.game.timeLeft <= 0) {
        this.handleTimeout();
      }
    }, 1000);
  }

  private handleTimeout(): void {
    if (!this.game) return;

    const result = submitAnswer(this.game, -9999);
    soundManager.play('wrong');

    this.showMessage("Time's up! " + getEncouragingMessage(false, 0));
    this.updateDisplay();

    if (result.newState !== 'playing') {
      this.endGame(result.newState === 'won');
    }
  }

  private submitAnswer(): void {
    if (!this.game || this.game.state !== 'playing') return;

    const input = document.getElementById('answer-input') as HTMLInputElement;
    const answer = parseInt(input.value, 10);

    if (isNaN(answer)) {
      this.showMessage('Enter a number!');
      return;
    }

    const result = submitAnswer(this.game, answer);
    mathStatsTracker.recordOperation(this.game.currentProblem.operation, result.correct);

    if (result.correct) {
      soundManager.play('correct');
      let msg = getEncouragingMessage(true, this.game.streak);
      if (result.streakBonus) {
        msg += ` +${result.pointsEarned} pts!`;
      }
      this.showMessage(msg);
    } else {
      soundManager.play('wrong');
      this.showMessage(`${getEncouragingMessage(false, 0)} Answer: ${result.correctAnswer}`);
    }

    input.value = '';
    this.updateDisplay();

    if (result.newState !== 'playing') {
      this.endGame(result.newState === 'won');
    } else {
      input.focus();
    }
  }

  private updateDisplay(): void {
    if (!this.game) return;

    // Problem
    document.getElementById('problem-display')!.textContent = this.game.currentProblem.question;

    // Score
    document.getElementById('score-display')!.textContent = `Score: ${this.game.score}`;

    // Streak
    const streakEl = document.getElementById('streak-display')!;
    if (this.game.streak >= 3) {
      streakEl.textContent = `🔥 ${this.game.streak}`;
      streakEl.classList.add('active');
    } else {
      streakEl.textContent = `${this.game.streak}`;
      streakEl.classList.remove('active');
    }

    // Lives
    const livesEl = document.getElementById('lives-display')!;
    livesEl.innerHTML = '❤️'.repeat(this.game.lives) + '🖤'.repeat(
      (this.currentDifficulty === 'easy' ? 5 : this.currentDifficulty === 'medium' ? 4 : 3) - this.game.lives
    );

    // Rocket progress
    const rocketEl = document.getElementById('rocket')!;
    const progressEl = document.getElementById('rocket-progress')!;
    rocketEl.textContent = getRocketStage(this.game.rocketHeight);
    rocketEl.style.bottom = `${this.game.rocketHeight}%`;
    progressEl.style.height = `${this.game.rocketHeight}%`;

    // Progress text
    document.getElementById('progress-text')!.textContent =
      `${this.game.correctAnswers}/${this.game.totalQuestions}`;

    // Timer
    this.updateTimerDisplay();
  }

  private updateTimerDisplay(): void {
    if (!this.game) return;

    const timerEl = document.getElementById('timer-display')!;
    timerEl.textContent = `⏱️ ${this.game.timeLeft}s`;

    timerEl.classList.remove('warning', 'danger');
    if (this.game.timeLeft <= 5) {
      timerEl.classList.add('danger');
    } else if (this.game.timeLeft <= 10) {
      timerEl.classList.add('warning');
    }
  }

  private showMessage(msg: string): void {
    const el = document.getElementById('message-display')!;
    el.textContent = msg;
    el.classList.remove('animate');
    void el.offsetWidth; // Trigger reflow
    el.classList.add('animate');
  }

  private endGame(won: boolean): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    if (!this.game) return;

    // Record stats
    mathStatsTracker.recordGame(
      won,
      this.game.difficulty,
      this.game.score,
      this.game.correctAnswers,
      this.game.wrongAnswers,
      this.game.bestStreak
    );

    // Play sound
    soundManager.play(won ? 'win' : 'lose');

    // Update result screen
    const titleEl = document.getElementById('result-title')!;
    const messageEl = document.getElementById('result-message')!;
    const scoreEl = document.getElementById('final-score')!;
    const statsEl = document.getElementById('result-stats')!;

    if (won) {
      titleEl.textContent = 'Mission Complete!';
      titleEl.className = 'win';
      messageEl.textContent = 'The rocket made it to space!';
      this.triggerConfetti();
    } else {
      titleEl.textContent = 'Mission Failed';
      titleEl.className = 'lose';
      messageEl.textContent = "Don't worry, try again!";
    }

    scoreEl.textContent = `Final Score: ${this.game.score}`;
    statsEl.innerHTML = `
      Correct: ${this.game.correctAnswers}/${this.game.questionsAnswered}<br>
      Best Streak: ${this.game.bestStreak}
    `;

    setTimeout(() => this.showScreen('result'), 500);
  }

  private triggerConfetti(): void {
    const container = document.getElementById('confetti-container')!;
    container.innerHTML = '';

    const colors = ['#8b5cf6', '#f472b6', '#34d399', '#fbbf24', '#f87171', '#60a5fa'];

    for (let i = 0; i < 80; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.cssText = `
        left: ${Math.random() * 100}%;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        animation-delay: ${Math.random() * 2}s;
      `;
      container.appendChild(confetti);
    }

    setTimeout(() => container.innerHTML = '', 5000);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new MathQuestApp();
});
