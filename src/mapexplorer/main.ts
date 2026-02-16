// Map Explorer - Main entry point

import '../styles/mapexplorer.css';
import {
  createGame, handleRegionClick, handleTimeout, useHint,
  getCurrentTarget, getEncouragingMessage, getMapType,
  type GameData
} from './game';
import type { Difficulty, MapData } from './maps/types';
import { mapStatsTracker } from './stats';
import { soundManager } from '../game/sounds';
import { US_STATES_MAP } from './maps/us-states';
import { WORLD_MAP, WORLD_BG_PATHS } from './maps/world';

class MapExplorerApp {
  private game: GameData | null = null;
  private currentDifficulty: Difficulty = 'easy';
  private timerInterval: number | null = null;
  private hintTimeout: number | null = null;

  // DOM elements
  private startScreen = document.getElementById('start-screen')!;
  private gameScreen = document.getElementById('game-screen')!;
  private resultScreen = document.getElementById('result-screen')!;
  private mapSvg = document.getElementById('map-svg') as unknown as SVGSVGElement;

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

    // Hint button
    document.getElementById('hint-btn')!.addEventListener('click', () => this.requestHint());

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

    // Clear messages
    document.getElementById('message-display')!.textContent = '';
    document.getElementById('funfact-display')!.textContent = '';

    // Render the map
    const mapData = getMapType(difficulty) === 'us' ? US_STATES_MAP : WORLD_MAP;
    this.renderMap(mapData);

    this.updateDisplay();
    this.showScreen('game');
    this.startTimer();

    soundManager.play('click');
  }

  private renderMap(mapData: MapData): void {
    this.mapSvg.setAttribute('viewBox', mapData.viewBox);
    this.mapSvg.innerHTML = '';

    // Render background countries for world map (with borders, not clickable)
    if (mapData.id === 'world') {
      for (const bgPath of WORLD_BG_PATHS) {
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        bg.setAttribute('d', bgPath);
        bg.classList.add('map-land-bg');
        this.mapSvg.appendChild(bg);
      }
    }

    // Render regions
    mapData.regions.forEach(region => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', region.path);
      path.setAttribute('data-id', region.id);
      path.classList.add('map-region');

      path.addEventListener('click', () => this.onRegionClick(region.id));

      this.mapSvg.appendChild(path);
    });

    // Render labels
    mapData.regions.forEach(region => {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(region.labelX));
      text.setAttribute('y', String(region.labelY));
      text.classList.add('map-label');
      text.textContent = region.abbreviation || '';
      this.mapSvg.appendChild(text);
    });
  }

  private onRegionClick(regionId: string): void {
    if (!this.game || this.game.state !== 'playing') return;

    // Don't allow clicking already-found regions
    if (this.game.foundRegions.has(regionId)) return;

    // Clear any hint pulse
    this.clearHintPulse();

    const result = handleRegionClick(this.game, regionId);
    const regionEl = this.mapSvg.querySelector(`[data-id="${regionId}"]`) as SVGElement;

    if (result.correct) {
      soundManager.play('correct');

      // Animate correct
      if (regionEl) {
        regionEl.classList.add('correct');
        setTimeout(() => {
          regionEl.classList.remove('correct');
          regionEl.classList.add('found');
        }, 600);
      }

      let msg = getEncouragingMessage(true, this.game.streak);
      if (result.streakBonus) msg += ` Streak x${this.game.streak}!`;
      if (result.speedBonus) msg += ' Speed bonus!';
      msg += ` +${result.pointsEarned}`;
      this.showMessage(msg);

      if (result.funFact) {
        document.getElementById('funfact-display')!.textContent = `💡 ${result.funFact}`;
      }
    } else {
      soundManager.play('wrong');

      // Flash wrong
      if (regionEl) {
        regionEl.classList.add('wrong');
        setTimeout(() => regionEl.classList.remove('wrong'), 400);
      }

      // Pulse the target as hint
      const targetId = getCurrentTarget(this.game).id;
      const targetEl = this.mapSvg.querySelector(`[data-id="${targetId}"]`) as SVGElement;
      if (targetEl) {
        targetEl.classList.add('hint-pulse');
        this.hintTimeout = window.setTimeout(() => {
          targetEl.classList.remove('hint-pulse');
        }, 2000);
      }

      this.showMessage(getEncouragingMessage(false, 0));
      document.getElementById('funfact-display')!.textContent = '';
    }

    this.updateDisplay();

    if (result.newState !== 'playing') {
      this.endGame(result.newState === 'won');
    }
  }

  private requestHint(): void {
    if (!this.game) return;

    const hintRegionId = useHint(this.game);
    if (!hintRegionId) return;

    soundManager.play('click');

    // Pulse the target region
    this.clearHintPulse();
    const targetEl = this.mapSvg.querySelector(`[data-id="${hintRegionId}"]`) as SVGElement;
    if (targetEl) {
      targetEl.classList.add('hint-pulse');
      this.hintTimeout = window.setTimeout(() => {
        targetEl.classList.remove('hint-pulse');
      }, 3000);
    }

    this.updateHintButton();
  }

  private clearHintPulse(): void {
    if (this.hintTimeout) {
      clearTimeout(this.hintTimeout);
      this.hintTimeout = null;
    }
    this.mapSvg.querySelectorAll('.hint-pulse').forEach(el => {
      el.classList.remove('hint-pulse');
    });
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
        this.onTimeout();
      }
    }, 1000);
  }

  private onTimeout(): void {
    if (!this.game) return;

    const result = handleTimeout(this.game);
    soundManager.play('wrong');

    this.showMessage("Time's up! " + getEncouragingMessage(false, 0));
    document.getElementById('funfact-display')!.textContent = '';
    this.updateDisplay();

    if (result.newState !== 'playing') {
      this.endGame(result.newState === 'won');
    }
  }

  private updateDisplay(): void {
    if (!this.game) return;

    const target = getCurrentTarget(this.game);

    // Prompt
    document.getElementById('prompt-display')!.textContent = `Find ${target.name}!`;
    document.getElementById('progress-display')!.textContent =
      `${this.game.correctAnswers + 1} of ${this.game.totalQuestions}`;

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
    const maxLives = this.currentDifficulty === 'easy' ? 5 : this.currentDifficulty === 'medium' ? 4 : 3;
    const livesEl = document.getElementById('lives-display')!;
    livesEl.innerHTML = '❤️'.repeat(this.game.lives) + '🖤'.repeat(maxLives - this.game.lives);

    // Timer
    this.updateTimerDisplay();

    // Hint button
    this.updateHintButton();
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

  private updateHintButton(): void {
    if (!this.game) return;
    const btn = document.getElementById('hint-btn') as HTMLButtonElement;
    btn.textContent = `💡 Hint (${this.game.hintsRemaining})`;
    btn.disabled = this.game.hintsRemaining <= 0;
  }

  private showMessage(msg: string): void {
    const el = document.getElementById('message-display')!;
    el.textContent = msg;
    el.classList.remove('animate');
    void el.offsetWidth;
    el.classList.add('animate');
  }

  private endGame(won: boolean): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.clearHintPulse();

    if (!this.game) return;

    // Record stats
    mapStatsTracker.recordGame(
      won,
      this.game.difficulty,
      this.game.score,
      this.game.correctAnswers,
      this.game.wrongAnswers,
      this.game.bestStreak,
      this.game.foundRegions
    );

    // Play sound
    soundManager.play(won ? 'win' : 'lose');

    // Update result screen
    const titleEl = document.getElementById('result-title')!;
    const messageEl = document.getElementById('result-message')!;
    const scoreEl = document.getElementById('final-score')!;
    const statsEl = document.getElementById('result-stats')!;

    if (won) {
      titleEl.textContent = 'Great Exploring!';
      titleEl.className = 'win';
      messageEl.textContent = 'You found all the places!';
      this.triggerConfetti();
    } else {
      titleEl.textContent = 'Expedition Over';
      titleEl.className = 'lose';
      messageEl.textContent = "Don't worry, explore again!";
    }

    scoreEl.textContent = `Final Score: ${this.game.score}`;
    statsEl.innerHTML = `
      Found: ${this.game.correctAnswers}/${this.game.totalQuestions}<br>
      Best Streak: ${this.game.bestStreak}
    `;

    setTimeout(() => this.showScreen('result'), 500);
  }

  private triggerConfetti(): void {
    const container = document.getElementById('confetti-container')!;
    container.innerHTML = '';

    const colors = ['#10b981', '#f472b6', '#34d399', '#fbbf24', '#f87171', '#60a5fa'];

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
  new MapExplorerApp();
});
