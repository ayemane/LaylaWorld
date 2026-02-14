// Word display and hangman drawing components

import type { GameData } from '../game/hangman';
import { getDisplayWord, getGuessPercentage, isLetterHint } from '../game/hangman';

const BODY_PARTS = [
  'head',
  'body',
  'left-arm',
  'right-arm',
  'left-leg',
  'right-leg'
];

const ENCOURAGING_MESSAGES = [
  "You've got this!",
  "Keep going!",
  "Great thinking!",
  "Almost there!",
  "You're doing amazing!",
  "Nice try!",
  "Keep guessing!",
  "You can do it!"
];

export class Display {
  private wordContainer: HTMLElement;
  private hangmanSvg: SVGElement;
  private progressBar: HTMLElement;
  private messageDisplay: HTMLElement;
  private categoryBadge: HTMLElement;
  private guessCounter: HTMLElement;

  constructor() {
    this.wordContainer = document.getElementById('word-display')!;
    this.hangmanSvg = document.getElementById('hangman-svg') as unknown as SVGElement;
    this.progressBar = document.getElementById('progress-bar')!;
    this.messageDisplay = document.getElementById('message-display')!;
    this.categoryBadge = document.getElementById('category-badge')!;
    this.guessCounter = document.getElementById('guess-counter')!;
  }

  updateWord(game: GameData): void {
    const displayWord = getDisplayWord(game);
    this.wordContainer.innerHTML = '';

    displayWord.forEach((char, index) => {
      const tile = document.createElement('div');
      tile.className = 'letter-tile';

      if (char !== '_') {
        tile.textContent = char;
        tile.classList.add('revealed');

        // Mark hint letters differently
        if (isLetterHint(game, game.word[index])) {
          tile.classList.add('hint');
        }
      }

      this.wordContainer.appendChild(tile);
    });
  }

  updateHangman(wrongGuesses: number, maxGuesses: number): void {
    // Reset all parts
    BODY_PARTS.forEach(part => {
      const element = this.hangmanSvg.querySelector(`.${part}`);
      if (element) {
        element.classList.remove('visible');
      }
    });

    // Show face parts
    this.hangmanSvg.querySelectorAll('.face-part').forEach(el => {
      el.classList.remove('visible');
    });
    this.hangmanSvg.querySelectorAll('.face-part-win').forEach(el => {
      el.classList.remove('visible');
    });

    // Calculate how many parts to show based on wrong guesses
    // For easy mode (8 guesses), we need to scale to 6 body parts
    const partsToShow = Math.min(
      Math.ceil((wrongGuesses / maxGuesses) * BODY_PARTS.length),
      BODY_PARTS.length
    );

    for (let i = 0; i < partsToShow; i++) {
      const element = this.hangmanSvg.querySelector(`.${BODY_PARTS[i]}`);
      if (element) {
        element.classList.add('visible');
      }
    }
  }

  showSadFace(): void {
    this.hangmanSvg.querySelectorAll('.face-part').forEach(el => {
      el.classList.add('visible');
    });
  }

  showHappyFace(): void {
    // First show the head if not visible
    const head = this.hangmanSvg.querySelector('.head');
    if (head) {
      head.classList.add('visible');
    }

    this.hangmanSvg.querySelectorAll('.face-part-win').forEach(el => {
      el.classList.add('visible');
    });
  }

  updateProgress(game: GameData): void {
    const percentage = getGuessPercentage(game);
    this.progressBar.style.width = `${percentage}%`;

    this.progressBar.classList.remove('warning', 'danger');
    if (percentage <= 33) {
      this.progressBar.classList.add('danger');
    } else if (percentage <= 50) {
      this.progressBar.classList.add('warning');
    }

    const remaining = game.maxWrongGuesses - game.wrongGuesses;
    this.guessCounter.textContent = `${remaining} left`;
  }

  updateCategory(game: GameData): void {
    // Only show category for easy mode
    if (game.difficulty === 'easy') {
      this.categoryBadge.textContent = game.categoryDisplay;
      this.categoryBadge.style.display = 'block';
    } else {
      this.categoryBadge.style.display = 'none';
    }
  }

  showMessage(message: string): void {
    this.messageDisplay.textContent = message;
    this.messageDisplay.style.animation = 'none';
    // Trigger reflow
    void this.messageDisplay.offsetWidth;
    this.messageDisplay.style.animation = 'fadeIn 0.3s ease';
  }

  showEncouragingMessage(): void {
    const message = ENCOURAGING_MESSAGES[
      Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)
    ];
    this.showMessage(message);
  }

  clearMessage(): void {
    this.messageDisplay.textContent = '';
  }

  reset(): void {
    this.wordContainer.innerHTML = '';
    this.progressBar.style.width = '100%';
    this.progressBar.classList.remove('warning', 'danger');
    this.clearMessage();

    // Reset hangman
    BODY_PARTS.forEach(part => {
      const element = this.hangmanSvg.querySelector(`.${part}`);
      if (element) {
        element.classList.remove('visible');
      }
    });

    this.hangmanSvg.querySelectorAll('.face-part').forEach(el => {
      el.classList.remove('visible');
    });
    this.hangmanSvg.querySelectorAll('.face-part-win').forEach(el => {
      el.classList.remove('visible');
    });
  }

  revealFullWord(word: string): void {
    const tiles = this.wordContainer.querySelectorAll('.letter-tile');
    tiles.forEach((tile, index) => {
      if (!tile.textContent) {
        tile.textContent = word[index];
        tile.classList.add('revealed');
      }
    });
  }
}
