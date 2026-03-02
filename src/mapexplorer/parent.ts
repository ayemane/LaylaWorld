// Parent Dashboard

import '../styles/mapexplorer.css';
import type { Difficulty } from './maps/types';
import {
  getParentSettings, saveParentSettings,
  getLearnProgress, getXPData, getXPForNextLevel,
  getTwoPlayerRecord, resetLearnProgress, resetTwoPlayerRecord, resetAll,
  type GatingMode,
} from './store';
import { getTotalRegions } from './learn';

class ParentDashboard {
  constructor() {
    this.render();
  }

  private render(): void {
    const app = document.getElementById('parent-app')!;
    const settings = getParentSettings();
    const xpData = getXPData();
    const levelInfo = getXPForNextLevel(xpData.totalXP);
    const record = getTwoPlayerRecord();

    const difficulties: { key: Difficulty; label: string }[] = [
      { key: 'easy', label: 'Scout (15 states)' },
      { key: 'medium', label: 'Ranger (50 states)' },
      { key: 'hard', label: 'Explorer (World)' },
    ];

    const learnRows = difficulties.map(d => {
      const progress = getLearnProgress(d.key);
      const total = getTotalRegions(d.key);
      const pct = Math.round((progress.learnedRegions.length / total) * 100);
      return `
        <div class="parent-progress-row">
          <span>${d.label}</span>
          <div class="parent-bar-container">
            <div class="parent-bar-fill" style="width: ${pct}%"></div>
          </div>
          <span>${progress.learnedRegions.length}/${total}</span>
        </div>
      `;
    }).join('');

    const recentMatches = record.history.slice(-5).reverse().map(m => {
      const date = new Date(m.date).toLocaleDateString();
      const winner = m.laylaScore > m.babaScore ? 'Layla' : m.babaScore > m.laylaScore ? 'Baba' : 'Draw';
      return `<div class="match-row">${date}: Layla ${m.laylaScore} - ${m.babaScore} Baba (${winner})</div>`;
    }).join('') || '<div class="match-row">No matches yet</div>';

    app.innerHTML = `
      <a href="/mapexplorer/" class="home-link">&larr; Map Explorer</a>
      <h1 class="parent-title">Parent Dashboard</h1>

      <section class="parent-section">
        <h2>Game Access Settings</h2>
        <div class="parent-radio-group" id="gating-radios">
          <label class="parent-radio">
            <input type="radio" name="gating" value="gated"
              ${settings.gatingMode === 'gated' ? 'checked' : ''}>
            <div>
              <strong>Gated</strong>
              <p>Challenge mode locked until all learn batches are complete</p>
            </div>
          </label>
          <label class="parent-radio">
            <input type="radio" name="gating" value="soft_gate"
              ${settings.gatingMode === 'soft_gate' ? 'checked' : ''}>
            <div>
              <strong>Soft Gate</strong>
              <p>Locked on first play, permanently unlocked after completing learn once</p>
            </div>
          </label>
          <label class="parent-radio">
            <input type="radio" name="gating" value="always_available"
              ${settings.gatingMode === 'always_available' ? 'checked' : ''}>
            <div>
              <strong>Always Available</strong>
              <p>All modes available from the start</p>
            </div>
          </label>
        </div>
      </section>

      <section class="parent-section">
        <h2>Learning Progress</h2>
        ${learnRows}
      </section>

      <section class="parent-section">
        <h2>XP Progress</h2>
        <div class="parent-xp-info">
          <span>Level: <strong>${levelInfo.current}</strong></span>
          <span>Total XP: <strong>${xpData.totalXP}</strong></span>
          ${levelInfo.next ? `<span>Next: ${levelInfo.next} (${levelInfo.xpNeeded - levelInfo.xpIntoLevel} XP to go)</span>` : '<span>Max level!</span>'}
        </div>
      </section>

      <section class="parent-section">
        <h2>Layla vs Baba</h2>
        <div class="parent-2p-record">
          <span>Layla: <strong>${record.laylaWins}</strong></span>
          <span>Draws: <strong>${record.draws}</strong></span>
          <span>Baba: <strong>${record.babaWins}</strong></span>
        </div>
        <h3>Recent Matches</h3>
        ${recentMatches}
      </section>

      <section class="parent-section">
        <h2>Reset Options</h2>
        <div class="parent-reset-buttons">
          <button class="secondary-btn" id="reset-learn">Reset Learn Progress</button>
          <button class="secondary-btn" id="reset-2p">Reset 2P Record</button>
          <button class="secondary-btn danger" id="reset-all">Reset Everything</button>
        </div>
      </section>
    `;

    // Event listeners
    document.getElementById('gating-radios')!.addEventListener('change', (e) => {
      const value = (e.target as HTMLInputElement).value as GatingMode;
      saveParentSettings({ gatingMode: value });
    });

    document.getElementById('reset-learn')!.addEventListener('click', () => {
      if (confirm('Reset all learning progress? This cannot be undone.')) {
        resetLearnProgress();
        this.render();
      }
    });

    document.getElementById('reset-2p')!.addEventListener('click', () => {
      if (confirm('Reset the Layla vs Baba record?')) {
        resetTwoPlayerRecord();
        this.render();
      }
    });

    document.getElementById('reset-all')!.addEventListener('click', () => {
      if (confirm('Reset ALL Map Explorer data? This cannot be undone.')) {
        resetAll();
        this.render();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ParentDashboard();
});
