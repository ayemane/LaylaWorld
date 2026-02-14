// Spelling Bee - Main entry point

import '../styles/spellingbee.css';
import { createGame, checkSpelling, skipWord, useHint, getProgress, getEncouragingMessage, type GameData } from './game';
import type { Difficulty } from './words';
import { speechManager } from './speech';
import { spellingStatsTracker } from './stats';
import { soundManager } from '../game/sounds';

class SpellingBeeApp {
  private game: GameData | null = null;
  private currentDifficulty: Difficulty = 'easy';
  private masteredWords: string[] = [];

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

    // Speak buttons
    document.getElementById('speak-word-btn')!.addEventListener('click', () => {
      if (this.game) {
        speechManager.speakWord(this.game.currentWord.word);
        soundManager.play('click');
      }
    });

    document.getElementById('speak-sentence-btn')!.addEventListener('click', () => {
      if (this.game) {
        useHint(this.game);
        speechManager.speakSentence(this.game.currentWord.sentence);
        soundManager.play('click');
        this.updateHintDisplay();
      }
    });

    document.getElementById('speak-definition-btn')!.addEventListener('click', () => {
      if (this.game) {
        useHint(this.game);
        speechManager.speakDefinition(this.game.currentWord.definition);
        soundManager.play('click');
        this.updateHintDisplay();
      }
    });

    // Submit answer
    const input = document.getElementById('spelling-input') as HTMLInputElement;
    const submitBtn = document.getElementById('submit-btn')!;

    submitBtn.addEventListener('click', () => this.submitAnswer());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.submitAnswer();
      }
    });

    // Skip button
    document.getElementById('skip-btn')!.addEventListener('click', () => {
      this.handleSkip();
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
    this.masteredWords = [];

    const input = document.getElementById('spelling-input') as HTMLInputElement;
    input.value = '';
    document.getElementById('message-display')!.textContent = '';

    this.updateDisplay();
    this.showScreen('game');
    soundManager.play('click');

    // Speak the first word after a short delay
    setTimeout(() => {
      speechManager.speakWord(this.game!.currentWord.word);
    }, 500);

    input.focus();
  }

  private submitAnswer(): void {
    if (!this.game || this.game.state !== 'playing') return;

    const input = document.getElementById('spelling-input') as HTMLInputElement;
    const attempt = input.value.trim();

    if (!attempt) {
      this.showMessage('Type your spelling!');
      return;
    }

    const result = checkSpelling(this.game, attempt);

    if (result.correct) {
      soundManager.play('correct');
      this.masteredWords.push(result.correctSpelling);
      let msg = getEncouragingMessage(true, this.game.streak);
      if (result.streakBonus) {
        msg += ` +${result.pointsEarned} pts!`;
      }
      this.showMessage(msg);
    } else {
      soundManager.play('wrong');
      this.showMessage(`${getEncouragingMessage(false, 0)} Try again!`);
      // Don't clear input on wrong answer - let them fix it
      input.select();
      this.updateDisplay();
      return;
    }

    input.value = '';
    this.updateDisplay();

    if (result.newState !== 'playing') {
      this.endGame(result.newState === 'won');
    } else {
      // Speak next word
      setTimeout(() => {
        speechManager.speakWord(this.game!.currentWord.word);
      }, 800);
      input.focus();
    }
  }

  private handleSkip(): void {
    if (!this.game || this.game.state !== 'playing') return;

    const correctWord = this.game.currentWord.word;
    skipWord(this.game);
    soundManager.play('wrong');
    this.showMessage(`The word was: ${correctWord.toUpperCase()}`);

    const input = document.getElementById('spelling-input') as HTMLInputElement;
    input.value = '';
    this.updateDisplay();

    if (this.game.state !== 'playing') {
      this.endGame(this.game.state === 'won');
    } else {
      setTimeout(() => {
        speechManager.speakWord(this.game!.currentWord.word);
      }, 1500);
      input.focus();
    }
  }

  private updateDisplay(): void {
    if (!this.game) return;

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
    const maxLives = this.currentDifficulty === 'easy' ? 4 : 3;
    livesEl.innerHTML = '🐝'.repeat(this.game.lives) + '💔'.repeat(maxLives - this.game.lives);

    // Progress
    const progress = getProgress(this.game);
    document.getElementById('progress-fill')!.style.width = `${progress}%`;
    document.getElementById('progress-text')!.textContent =
      `Word ${this.game.currentIndex + 1} of ${this.game.totalWords}`;

    // Word number display
    document.getElementById('word-number')!.textContent =
      `#${this.game.currentIndex + 1}`;

    this.updateHintDisplay();
  }

  private updateHintDisplay(): void {
    if (!this.game) return;

    const hintIndicator = document.getElementById('hint-indicator')!;
    if (this.game.hintsUsed > 0) {
      hintIndicator.textContent = `(${this.game.hintsUsed} hint${this.game.hintsUsed > 1 ? 's' : ''} used)`;
      hintIndicator.style.display = 'block';
    } else {
      hintIndicator.style.display = 'none';
    }
  }

  private showMessage(msg: string): void {
    const el = document.getElementById('message-display')!;
    el.textContent = msg;
    el.classList.remove('animate');
    void el.offsetWidth;
    el.classList.add('animate');
  }

  private endGame(won: boolean): void {
    if (!this.game) return;

    speechManager.stop();

    spellingStatsTracker.recordGame(
      won,
      this.game.difficulty,
      this.game.score,
      this.game.correctCount,
      this.game.wrongCount,
      this.game.bestStreak,
      this.masteredWords
    );

    soundManager.play(won ? 'win' : 'lose');

    const titleEl = document.getElementById('result-title')!;
    const messageEl = document.getElementById('result-message')!;
    const scoreEl = document.getElementById('final-score')!;
    const statsEl = document.getElementById('result-stats')!;

    if (won) {
      titleEl.textContent = 'Spelling Champion!';
      titleEl.className = 'win';
      messageEl.textContent = 'You spelled all the words!';
      this.triggerConfetti();
    } else {
      titleEl.textContent = 'Nice Try!';
      titleEl.className = 'lose';
      messageEl.textContent = 'Keep practicing, you\'re getting better!';
    }

    scoreEl.textContent = `Final Score: ${this.game.score}`;
    statsEl.innerHTML = `
      Words Spelled: ${this.game.correctCount}/${this.game.totalWords}<br>
      Best Streak: ${this.game.bestStreak}
    `;

    setTimeout(() => this.showScreen('result'), 500);
  }

  private triggerConfetti(): void {
    const container = document.getElementById('confetti-container')!;
    container.innerHTML = '';

    const colors = ['#fbbf24', '#f59e0b', '#d97706', '#fcd34d', '#fef3c7'];

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

document.addEventListener('DOMContentLoaded', () => {
  new SpellingBeeApp();
});
