// Passport page — visual stamp collection

import '../styles/mapexplorer.css';
import type { Difficulty } from './maps/types';
import { getEasyStates, getAllStates } from './maps/us-states';
import { getWorldRegions } from './maps/world';
import { getXPData, hasStamp, getXPForNextLevel } from './store';

type DifficultyTab = { key: Difficulty; label: string; emoji: string };

const TABS: DifficultyTab[] = [
  { key: 'easy', label: 'Scout', emoji: '🗺️' },
  { key: 'medium', label: 'Ranger', emoji: '🧭' },
  { key: 'hard', label: 'Explorer', emoji: '🌍' },
];

function getPool(difficulty: Difficulty) {
  if (difficulty === 'easy') return getEasyStates();
  if (difficulty === 'medium') return getAllStates();
  return getWorldRegions();
}

class PassportPage {
  private currentTab: Difficulty = 'easy';

  constructor() {
    this.render();
  }

  private render(): void {
    const app = document.getElementById('passport-app')!;

    // XP header
    const xpData = getXPData();
    const levelInfo = getXPForNextLevel(xpData.totalXP);
    const pct = levelInfo.xpNeeded > 0
      ? Math.round((levelInfo.xpIntoLevel / levelInfo.xpNeeded) * 100)
      : 100;

    app.innerHTML = `
      <a href="/mapexplorer/" class="home-link">&larr; Map Explorer</a>
      <h1 class="passport-title">My Passport</h1>

      <div class="passport-xp">
        <span class="passport-level">${levelInfo.current}</span>
        <div class="xp-bar-container">
          <div class="xp-bar-fill" style="width: ${pct}%"></div>
        </div>
        <span class="passport-xp-text">${xpData.totalXP} XP</span>
      </div>

      <div class="passport-tabs" id="passport-tabs"></div>
      <div class="passport-progress" id="passport-progress"></div>
      <div class="passport-grid" id="passport-grid"></div>
    `;

    // Render tabs
    const tabsEl = document.getElementById('passport-tabs')!;
    tabsEl.innerHTML = TABS.map(tab => `
      <button class="passport-tab ${tab.key === this.currentTab ? 'active' : ''}"
              data-tab="${tab.key}">
        ${tab.emoji} ${tab.label}
      </button>
    `).join('');

    tabsEl.querySelectorAll('.passport-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.currentTab = (e.currentTarget as HTMLElement).dataset.tab as Difficulty;
        this.render();
      });
    });

    this.renderGrid();
  }

  private renderGrid(): void {
    const pool = getPool(this.currentTab);
    const collected = pool.filter(r => hasStamp(this.currentTab, r.id)).length;
    const total = pool.length;

    document.getElementById('passport-progress')!.textContent =
      `${collected}/${total} collected`;

    const grid = document.getElementById('passport-grid')!;
    grid.innerHTML = pool.map(region => {
      const earned = hasStamp(this.currentTab, region.id);
      const flag = region.flagEmoji || (this.currentTab !== 'hard' ? '🇺🇸' : '🌍');
      return `
        <div class="stamp-cell ${earned ? 'earned' : 'locked'}">
          <span class="stamp-icon">${earned ? flag : '❓'}</span>
          <span class="stamp-name">${earned ? region.name : '???'}</span>
        </div>
      `;
    }).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PassportPage();
});
