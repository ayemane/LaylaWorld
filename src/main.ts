// Main application entry point

import './styles/main.css';
import { createGame, guessLetter, type GameData } from './game/hangman';
import type { Difficulty } from './game/words';
import { soundManager } from './game/sounds';
import { Keyboard } from './ui/keyboard';
import { Display } from './ui/display';
import { ScreenManager } from './ui/screens';
import { statsTracker } from './stats/tracker';

class HangmanApp {
  private game: GameData | null = null;
  private keyboard: Keyboard;
  private display: Display;
  private screens: ScreenManager;
  private currentDifficulty: Difficulty = 'easy';

  constructor() {
    this.display = new Display();
    this.screens = new ScreenManager();
    this.keyboard = new Keyboard('keyboard', this.handleGuess.bind(this));

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

    // Back button
    document.getElementById('back-btn')?.addEventListener('click', () => {
      this.screens.show('start-screen');
    });

    // Result screen buttons
    document.getElementById('play-again-btn')?.addEventListener('click', () => {
      this.startGame(this.currentDifficulty);
    });

    document.getElementById('change-level-btn')?.addEventListener('click', () => {
      this.screens.show('start-screen');
    });
  }

  private startGame(difficulty: Difficulty): void {
    this.currentDifficulty = difficulty;
    this.game = createGame(difficulty);

    this.keyboard.reset();
    this.display.reset();

    // Pre-mark hint letter on keyboard for medium difficulty
    if (this.game.hintLetter) {
      this.keyboard.markCorrect(this.game.hintLetter);
    }

    this.display.updateWord(this.game);
    this.display.updateHangman(this.game.wrongGuesses, this.game.maxWrongGuesses);
    this.display.updateProgress(this.game);
    this.display.updateCategory(this.game);

    this.screens.show('game-screen');
    soundManager.play('click');
  }

  private handleGuess(letter: string): void {
    if (!this.game || this.game.state !== 'playing') return;

    const result = guessLetter(this.game, letter);

    if (!result.isNewGuess) return;

    soundManager.play('click');

    if (result.isCorrect) {
      soundManager.play('correct');
      this.keyboard.markCorrect(letter);
      this.display.showEncouragingMessage();
    } else {
      soundManager.play('wrong');
      this.keyboard.markWrong(letter);
      this.display.showMessage('Try another letter!');
    }

    this.display.updateWord(this.game);
    this.display.updateHangman(this.game.wrongGuesses, this.game.maxWrongGuesses);
    this.display.updateProgress(this.game);

    // Check game end
    if (result.gameState === 'won') {
      this.handleWin();
    } else if (result.gameState === 'lost') {
      this.handleLoss();
    }
  }

  private handleWin(): void {
    if (!this.game) return;

    this.keyboard.disableAll();
    this.display.showHappyFace();
    soundManager.play('win');

    const newAchievements = statsTracker.recordGame(
      true,
      this.game.word,
      this.game.difficulty,
      this.game.wrongGuesses
    );

    // Show achievement notification if any
    if (newAchievements.length > 0) {
      console.log('New achievements:', newAchievements);
      // Could show a toast notification here in the future
    }

    setTimeout(() => {
      this.screens.showResult(true, this.game!.word);
    }, 1000);
  }

  private handleLoss(): void {
    if (!this.game) return;

    this.keyboard.disableAll();
    this.display.revealFullWord(this.game.word);
    this.display.showSadFace();
    soundManager.play('lose');

    statsTracker.recordGame(
      false,
      this.game.word,
      this.game.difficulty,
      this.game.wrongGuesses
    );

    setTimeout(() => {
      this.screens.showResult(false, this.game!.word);
    }, 1500);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new HangmanApp();
});
