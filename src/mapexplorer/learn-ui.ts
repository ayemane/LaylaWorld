// Learn Mode UI controller

import type { Difficulty, MapData } from './maps/types';
import {
  createLearnBatch, getCurrentCard, advanceToQuiz, handleQuizClick,
  getLearnXPForCard, getTotalBatches, type LearnBatch,
} from './learn';
import { awardXP } from './store';
import { soundManager } from '../game/sounds';
import { US_STATES_MAP } from './maps/us-states';
import { WORLD_MAP } from './maps/world';

type ShowScreenFn = (screen: string) => void;
type RenderMapFn = (mapData: MapData) => void;
type ShowXPNotificationFn = (xp: number, leveledUp: boolean, level: string) => void;

export class LearnUI {
  private batch: LearnBatch | null = null;
  private difficulty: Difficulty = 'easy';
  private mapSvg: SVGSVGElement;
  private showScreen: ShowScreenFn;
  private renderMap: RenderMapFn;
  private showXPNotification: ShowXPNotificationFn;
  private hintTimeout: number | null = null;

  constructor(
    mapSvg: SVGSVGElement,
    showScreen: ShowScreenFn,
    renderMap: RenderMapFn,
    showXPNotification: ShowXPNotificationFn,
  ) {
    this.mapSvg = mapSvg;
    this.showScreen = showScreen;
    this.renderMap = renderMap;
    this.showXPNotification = showXPNotification;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    document.getElementById('learn-quiz-me-btn')?.addEventListener('click', () => {
      this.onQuizMe();
    });

    document.getElementById('learn-next-batch-btn')?.addEventListener('click', () => {
      this.startLearn(this.difficulty);
    });

    document.getElementById('learn-back-btn')?.addEventListener('click', () => {
      this.showScreen('mode-picker');
    });
  }

  startLearn(difficulty: Difficulty): void {
    this.difficulty = difficulty;
    this.batch = createLearnBatch(difficulty);

    if (!this.batch) {
      // All batches done
      this.showAllComplete();
      return;
    }

    this.showCard();
  }

  private showCard(): void {
    if (!this.batch) return;
    const card = getCurrentCard(this.batch);
    const region = card.region;

    // Award XP for viewing card
    const xpResult = awardXP(getLearnXPForCard());

    // Update card content
    const nameEl = document.getElementById('learn-card-name')!;
    const capitalEl = document.getElementById('learn-card-capital')!;
    const factEl = document.getElementById('learn-card-fact')!;
    const flagEl = document.getElementById('learn-card-flag')!;
    const progressEl = document.getElementById('learn-card-progress')!;

    nameEl.textContent = region.name;
    capitalEl.textContent = region.capital ? `Capital: ${region.capital}` : '';
    factEl.textContent = region.funFact;
    flagEl.textContent = region.flagEmoji || (this.difficulty !== 'hard' ? '🇺🇸' : '🌍');
    progressEl.textContent = `Card ${this.batch.currentCardIndex + 1} of ${this.batch.cards.length} · Batch ${this.batch.batchNumber} of ${this.batch.totalBatches}`;

    this.showScreen('learn-card');
    soundManager.play('click');

    if (xpResult.leveledUp) {
      this.showXPNotification(getLearnXPForCard(), true, xpResult.newLevel);
    }
  }

  private onQuizMe(): void {
    if (!this.batch) return;
    advanceToQuiz(this.batch);

    const card = getCurrentCard(this.batch);
    const region = card.region;

    // Render map
    const mapData = this.difficulty === 'hard' ? WORLD_MAP : US_STATES_MAP;
    this.renderMap(mapData);

    // Set up click handlers for quiz
    this.setupQuizClickHandlers();

    // Update quiz UI
    document.getElementById('learn-quiz-prompt')!.textContent = `Find ${region.name}!`;
    document.getElementById('learn-quiz-progress')!.textContent =
      `${this.batch.currentCardIndex + 1} of ${this.batch.cards.length}`;
    document.getElementById('learn-quiz-message')!.textContent = '';

    this.showScreen('learn-quiz');
    soundManager.play('click');
  }

  private setupQuizClickHandlers(): void {
    this.mapSvg.querySelectorAll('.map-region').forEach(el => {
      const clone = el.cloneNode(true) as SVGElement;
      el.parentNode?.replaceChild(clone, el);
      clone.addEventListener('click', () => {
        const regionId = clone.getAttribute('data-id');
        if (regionId) this.onQuizRegionClick(regionId);
      });
    });
  }

  private onQuizRegionClick(regionId: string): void {
    if (!this.batch) return;

    // Clear previous highlight
    this.clearHighlight();

    const result = handleQuizClick(this.batch, regionId);
    const regionEl = this.mapSvg.querySelector(`[data-id="${regionId}"]`) as SVGElement;
    const msgEl = document.getElementById('learn-quiz-message')!;

    if (result.correct) {
      soundManager.play('correct');

      if (regionEl) {
        regionEl.classList.add('correct');
        setTimeout(() => {
          regionEl.classList.remove('correct');
          regionEl.classList.add('found');
        }, 600);
      }

      msgEl.textContent = `+${result.xpEarned} XP`;
      msgEl.className = 'learn-quiz-msg success';

      if (result.batchComplete) {
        setTimeout(() => this.showBatchComplete(), 800);
      } else {
        setTimeout(() => this.showCard(), 1000);
      }
    } else {
      soundManager.play('wrong');

      if (regionEl) {
        regionEl.classList.add('wrong');
        setTimeout(() => regionEl.classList.remove('wrong'), 400);
      }

      if (result.highlighted) {
        // Show where the correct region is
        const card = getCurrentCard(this.batch);
        const targetEl = this.mapSvg.querySelector(`[data-id="${card.region.id}"]`) as SVGElement;
        if (targetEl) {
          targetEl.classList.add('hint-pulse');
          this.hintTimeout = window.setTimeout(() => {
            targetEl.classList.remove('hint-pulse');
          }, 3000);
        }
        msgEl.textContent = "Here it is! Tap it to continue.";
      } else {
        const card = getCurrentCard(this.batch);
        const remaining = 3 - card.quizAttempts;
        msgEl.textContent = remaining > 0
          ? `Not quite! ${remaining} more ${remaining === 1 ? 'try' : 'tries'} before a hint.`
          : "Keep trying!";
      }
      msgEl.className = 'learn-quiz-msg';
    }
  }

  private clearHighlight(): void {
    if (this.hintTimeout) {
      clearTimeout(this.hintTimeout);
      this.hintTimeout = null;
    }
    this.mapSvg.querySelectorAll('.hint-pulse').forEach(el => {
      el.classList.remove('hint-pulse');
    });
  }

  private showBatchComplete(): void {
    if (!this.batch) return;

    const stampsEl = document.getElementById('learn-complete-stamps')!;
    const msgEl = document.getElementById('learn-complete-msg')!;
    const nextBtn = document.getElementById('learn-next-batch-btn')!;

    // Show stamps earned in this batch
    stampsEl.innerHTML = this.batch.cards.map(card => {
      const flag = card.region.flagEmoji || '📍';
      return `<span class="stamp-earned">${flag}</span>`;
    }).join('');

    const totalBatches = getTotalBatches(this.difficulty);
    if (this.batch.batchNumber >= totalBatches) {
      msgEl.textContent = 'You learned them all! Challenge mode unlocked!';
      nextBtn.textContent = 'Back to Menu';
      nextBtn.onclick = () => this.showScreen('mode-picker');
    } else {
      msgEl.textContent = `Batch ${this.batch.batchNumber} complete! +${25} XP`;
      nextBtn.textContent = 'Next Batch';
      nextBtn.onclick = () => this.startLearn(this.difficulty);
    }

    this.showScreen('learn-complete');
    soundManager.play('win');
  }

  private showAllComplete(): void {
    const stampsEl = document.getElementById('learn-complete-stamps')!;
    const msgEl = document.getElementById('learn-complete-msg')!;
    const nextBtn = document.getElementById('learn-next-batch-btn')!;

    stampsEl.innerHTML = '🎉';
    msgEl.textContent = "You've already learned everything! Go try the challenge!";
    nextBtn.textContent = 'Back to Menu';
    nextBtn.onclick = () => this.showScreen('mode-picker');

    this.showScreen('learn-complete');
  }
}
