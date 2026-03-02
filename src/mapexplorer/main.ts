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
import { WORLD_MAP } from './maps/world';
import {
  isChallengeUnlocked, getXPData, getXPForNextLevel, awardXP, XP_AWARDS,
} from './store';
import { getTotalRegions } from './learn';
import { LearnUI } from './learn-ui';
import { TwoPlayerUI } from './twoplayer-ui';

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Scout',
  medium: 'Ranger',
  hard: 'Explorer',
};

class MapExplorerApp {
  private game: GameData | null = null;
  private currentDifficulty: Difficulty = 'easy';
  private timerInterval: number | null = null;
  private hintTimeout: number | null = null;
  private learnUI: LearnUI;
  private twoPlayerUI: TwoPlayerUI;

  // DOM elements
  private startScreen = document.getElementById('start-screen')!;
  private modePickerScreen = document.getElementById('mode-picker-screen')!;
  private learnCardScreen = document.getElementById('learn-card-screen')!;
  private learnQuizScreen = document.getElementById('learn-quiz-screen')!;
  private learnCompleteScreen = document.getElementById('learn-complete-screen')!;
  private gameScreen = document.getElementById('game-screen')!;
  private switchScreen = document.getElementById('switch-screen')!;
  private resultScreen = document.getElementById('result-screen')!;
  private twoplayerResultScreen = document.getElementById('twoplayer-result-screen')!;
  private mapSvg = document.getElementById('map-svg') as unknown as SVGSVGElement;
  private learnMapSvg = document.getElementById('learn-map-svg') as unknown as SVGSVGElement;

  private allScreens: HTMLElement[];

  constructor() {
    this.allScreens = [
      this.startScreen, this.modePickerScreen,
      this.learnCardScreen, this.learnQuizScreen, this.learnCompleteScreen,
      this.gameScreen, this.switchScreen,
      this.resultScreen, this.twoplayerResultScreen,
    ];

    this.learnUI = new LearnUI(
      this.learnMapSvg,
      (screen) => this.showScreen(screen),
      (mapData) => this.renderMap(mapData, this.learnMapSvg),
      (_xp, _leveledUp, level) => this.showLevelUp(level),
    );

    this.twoPlayerUI = new TwoPlayerUI(
      this.mapSvg,
      (screen) => this.showScreen(screen),
      (mapData) => this.renderMap(mapData, this.mapSvg),
    );

    this.setupEventListeners();
    this.updateXPBar();
  }

  private setupEventListeners(): void {
    // Difficulty buttons → show mode picker
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const difficulty = target.dataset.difficulty as Difficulty;
        this.showModePicker(difficulty);
      });
    });

    // Mode picker buttons
    document.getElementById('mode-learn-btn')!.addEventListener('click', () => {
      this.learnUI.startLearn(this.currentDifficulty);
    });

    document.getElementById('mode-challenge-btn')!.addEventListener('click', () => {
      const totalRegions = getTotalRegions(this.currentDifficulty);
      if (!isChallengeUnlocked(this.currentDifficulty, totalRegions)) {
        soundManager.play('wrong');
        return;
      }
      this.startGame(this.currentDifficulty);
    });

    document.getElementById('mode-2p-btn')!.addEventListener('click', () => {
      const totalRegions = getTotalRegions(this.currentDifficulty);
      if (!isChallengeUnlocked(this.currentDifficulty, totalRegions)) {
        soundManager.play('wrong');
        return;
      }
      this.twoPlayerUI.start2P(this.currentDifficulty);
    });

    document.getElementById('mode-back-btn')!.addEventListener('click', () => {
      this.showScreen('start');
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

  private showScreen(screen: string): void {
    this.allScreens.forEach(s => s.classList.remove('active'));

    const screenMap: Record<string, HTMLElement> = {
      'start': this.startScreen,
      'mode-picker': this.modePickerScreen,
      'learn-card': this.learnCardScreen,
      'learn-quiz': this.learnQuizScreen,
      'learn-complete': this.learnCompleteScreen,
      'game': this.gameScreen,
      'switch': this.switchScreen,
      'result': this.resultScreen,
      'twoplayer-result': this.twoplayerResultScreen,
    };

    const el = screenMap[screen];
    if (el) el.classList.add('active');

    // Update XP bar whenever returning to start
    if (screen === 'start') {
      this.updateXPBar();
    }
  }

  private showModePicker(difficulty: Difficulty): void {
    this.currentDifficulty = difficulty;
    soundManager.play('click');

    // Update title
    document.getElementById('mode-picker-title')!.textContent =
      `You picked ${DIFFICULTY_LABELS[difficulty]}!`;

    // Update lock states
    const totalRegions = getTotalRegions(difficulty);
    const unlocked = isChallengeUnlocked(difficulty, totalRegions);

    const challengeBtn = document.getElementById('mode-challenge-btn')!;
    const twopBtn = document.getElementById('mode-2p-btn')!;
    const challengeLock = document.getElementById('challenge-lock')!;
    const twopLock = document.getElementById('twoplayer-lock')!;

    if (unlocked) {
      challengeBtn.classList.remove('locked');
      twopBtn.classList.remove('locked');
      challengeLock.textContent = '';
      twopLock.textContent = '';
    } else {
      challengeBtn.classList.add('locked');
      twopBtn.classList.add('locked');
      challengeLock.textContent = '🔒';
      twopLock.textContent = '🔒';
    }

    this.showScreen('mode-picker');
  }

  private updateXPBar(): void {
    const xpData = getXPData();
    const levelInfo = getXPForNextLevel(xpData.totalXP);
    const pct = levelInfo.xpNeeded > 0
      ? Math.min(100, Math.round((levelInfo.xpIntoLevel / levelInfo.xpNeeded) * 100))
      : 100;

    document.getElementById('xp-level')!.textContent = levelInfo.current;
    document.getElementById('xp-bar-fill')!.style.width = `${pct}%`;
    document.getElementById('xp-text')!.textContent = `${xpData.totalXP} XP`;
  }

  private showLevelUp(level: string): void {
    const notification = document.getElementById('level-up-notification')!;
    document.getElementById('level-up-text')!.textContent = `You're now a ${level}!`;
    notification.style.display = 'flex';
    soundManager.play('win');
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }

  private startGame(difficulty: Difficulty): void {
    this.currentDifficulty = difficulty;
    this.game = createGame(difficulty);

    // Clear messages
    document.getElementById('message-display')!.textContent = '';
    document.getElementById('funfact-display')!.textContent = '';

    // Ensure hint button is visible (may have been hidden by 2P mode)
    document.getElementById('hint-btn')!.style.display = '';
    // Hide 2P indicator
    const indicator = document.getElementById('twoplayer-indicator');
    if (indicator) indicator.style.display = 'none';

    // Render the map
    const mapData = getMapType(difficulty) === 'us' ? US_STATES_MAP : WORLD_MAP;
    this.renderMap(mapData, this.mapSvg);

    // Set up click handlers for solo game
    this.setupSoloClickHandlers();

    this.updateDisplay();
    this.showScreen('game');
    this.startTimer();

    soundManager.play('click');
  }

  private setupSoloClickHandlers(): void {
    this.mapSvg.querySelectorAll('.map-region').forEach(el => {
      const clone = el.cloneNode(true) as SVGElement;
      el.parentNode?.replaceChild(clone, el);
      clone.addEventListener('click', () => {
        const regionId = clone.getAttribute('data-id');
        if (regionId) this.onRegionClick(regionId);
      });
    });
  }

  renderMap(mapData: MapData, svg: SVGSVGElement): void {
    svg.setAttribute('viewBox', mapData.viewBox);
    svg.innerHTML = '';

    // Render regions
    mapData.regions.forEach(region => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', region.path);
      path.setAttribute('data-id', region.id);
      path.classList.add('map-region');
      svg.appendChild(path);
    });

    // Render labels
    mapData.regions.forEach(region => {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(region.labelX));
      text.setAttribute('y', String(region.labelY));
      text.classList.add('map-label');
      text.textContent = region.abbreviation || '';
      svg.appendChild(text);
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

      // Award challenge XP
      awardXP(XP_AWARDS.CHALLENGE_CORRECT);

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

    // Award XP
    if (won) {
      awardXP(XP_AWARDS.CHALLENGE_WIN);
      if (this.game.wrongAnswers === 0) {
        awardXP(XP_AWARDS.PERFECT_GAME);
      }
    }

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
