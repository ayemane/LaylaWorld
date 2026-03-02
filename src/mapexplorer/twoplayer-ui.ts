// 2-Player Mode UI controller

import type { Difficulty, MapData } from './maps/types';
import {
  createTwoPlayerGame, getCurrentTwoPlayerTarget, handleTwoPlayerClick,
  startTurn, getWinner, type TwoPlayerGame,
} from './twoplayer';
import { getTwoPlayerRecord } from './store';
import { soundManager } from '../game/sounds';
import { US_STATES_MAP } from './maps/us-states';
import { WORLD_MAP } from './maps/world';

type ShowScreenFn = (screen: string) => void;
type RenderMapFn = (mapData: MapData) => void;

export class TwoPlayerUI {
  private game: TwoPlayerGame | null = null;
  private difficulty: Difficulty = 'easy';
  private mapSvg: SVGSVGElement;
  private showScreen: ShowScreenFn;
  private renderMap: RenderMapFn;

  constructor(
    mapSvg: SVGSVGElement,
    showScreen: ShowScreenFn,
    renderMap: RenderMapFn,
  ) {
    this.mapSvg = mapSvg;
    this.showScreen = showScreen;
    this.renderMap = renderMap;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    document.getElementById('switch-ready-btn')?.addEventListener('click', () => {
      this.onReady();
    });

    document.getElementById('twoplayer-rematch-btn')?.addEventListener('click', () => {
      this.start2P(this.difficulty);
    });

    document.getElementById('twoplayer-back-btn')?.addEventListener('click', () => {
      this.showScreen('mode-picker');
    });
  }

  start2P(difficulty: Difficulty): void {
    this.difficulty = difficulty;
    this.game = createTwoPlayerGame(difficulty);

    // Show initial switch screen for Layla
    this.showSwitchScreen();
  }

  private showSwitchScreen(): void {
    if (!this.game) return;

    const playerName = this.game.currentPlayer === 'layla' ? "Layla" : "Baba";
    const nextTarget = this.game.currentTargetIndex + 1;

    document.getElementById('switch-player-name')!.textContent = `${playerName}'s Turn!`;
    document.getElementById('switch-message')!.textContent =
      `Round ${nextTarget} of ${this.game.totalTargets}`;

    this.showScreen('switch');
    soundManager.play('click');
  }

  private onReady(): void {
    if (!this.game) return;

    startTurn(this.game);

    // Render map
    const mapData = this.difficulty === 'hard' ? WORLD_MAP : US_STATES_MAP;
    this.renderMap(mapData);
    this.setupClickHandlers();

    // Update game screen for 2P
    const target = getCurrentTwoPlayerTarget(this.game);
    const playerName = this.game.currentPlayer === 'layla' ? "Layla" : "Baba";

    document.getElementById('prompt-display')!.textContent = `Find ${target.name}!`;
    document.getElementById('progress-display')!.textContent =
      `${this.game.currentTargetIndex + 1} of ${this.game.totalTargets}`;
    document.getElementById('score-display')!.textContent = `${playerName}'s turn`;
    document.getElementById('streak-display')!.textContent = '';
    document.getElementById('timer-display')!.textContent = '';
    document.getElementById('lives-display')!.textContent =
      `Layla: ${this.game.laylaScore} · Baba: ${this.game.babaScore}`;
    document.getElementById('hint-btn')!.style.display = 'none';
    document.getElementById('message-display')!.textContent = '';
    document.getElementById('funfact-display')!.textContent = '';

    // Show 2P indicator
    const indicator = document.getElementById('twoplayer-indicator');
    if (indicator) {
      indicator.textContent = `${playerName}'s turn`;
      indicator.className = `twoplayer-indicator ${this.game.currentPlayer}`;
      indicator.style.display = 'block';
    }

    this.showScreen('game');
  }

  private setupClickHandlers(): void {
    this.mapSvg.querySelectorAll('.map-region').forEach(el => {
      const clone = el.cloneNode(true) as SVGElement;
      el.parentNode?.replaceChild(clone, el);
      clone.addEventListener('click', () => {
        const regionId = clone.getAttribute('data-id');
        if (regionId) this.onRegionClick(regionId);
      });
    });
  }

  private onRegionClick(regionId: string): void {
    if (!this.game || this.game.state !== 'playing') return;

    const result = handleTwoPlayerClick(this.game, regionId);
    const regionEl = this.mapSvg.querySelector(`[data-id="${regionId}"]`) as SVGElement;

    if (result.correct) {
      soundManager.play('correct');

      if (regionEl) {
        regionEl.classList.add('correct');
        setTimeout(() => {
          regionEl.classList.remove('correct');
          regionEl.classList.add('found');
        }, 600);
      }

      document.getElementById('message-display')!.textContent = `+${result.pointsEarned} points!`;

      if (result.gameOver) {
        setTimeout(() => this.showResult(), 1000);
      } else if (result.needSwitch) {
        setTimeout(() => this.showSwitchScreen(), 1000);
      }
    } else {
      soundManager.play('wrong');

      if (regionEl) {
        regionEl.classList.add('wrong');
        setTimeout(() => regionEl.classList.remove('wrong'), 400);
      }

      document.getElementById('message-display')!.textContent = 'Not that one! Keep looking!';
    }
  }

  private showResult(): void {
    if (!this.game) return;

    const winner = getWinner(this.game);
    const record = getTwoPlayerRecord();

    const titleEl = document.getElementById('twoplayer-result-title')!;
    const scoresEl = document.getElementById('twoplayer-scores')!;
    const recordEl = document.getElementById('twoplayer-record')!;

    if (winner === 'layla') {
      titleEl.textContent = 'Layla Wins!';
      titleEl.className = 'twoplayer-title win';
    } else if (winner === 'baba') {
      titleEl.textContent = 'Baba Wins!';
      titleEl.className = 'twoplayer-title lose';
    } else {
      titleEl.textContent = "It's a Draw!";
      titleEl.className = 'twoplayer-title draw';
    }

    scoresEl.innerHTML = `
      <div class="score-card layla">
        <div class="score-name">Layla</div>
        <div class="score-value">${this.game.laylaScore}</div>
      </div>
      <div class="score-vs">vs</div>
      <div class="score-card baba">
        <div class="score-name">Baba</div>
        <div class="score-value">${this.game.babaScore}</div>
      </div>
    `;

    recordEl.textContent =
      `Overall: Layla ${record.laylaWins} - ${record.draws} - ${record.babaWins} Baba`;

    // Hide 2P indicator
    const indicator = document.getElementById('twoplayer-indicator');
    if (indicator) indicator.style.display = 'none';

    // Restore hint button visibility
    document.getElementById('hint-btn')!.style.display = '';

    this.showScreen('twoplayer-result');
    soundManager.play(winner === 'layla' ? 'win' : winner === 'baba' ? 'lose' : 'win');
  }
}
