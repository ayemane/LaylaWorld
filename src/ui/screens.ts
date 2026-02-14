// Screen management and transitions

export type ScreenId = 'start-screen' | 'game-screen' | 'result-screen';

export class ScreenManager {
  private screens: Map<ScreenId, HTMLElement> = new Map();
  private currentScreen: ScreenId = 'start-screen';

  constructor() {
    const screenIds: ScreenId[] = ['start-screen', 'game-screen', 'result-screen'];
    screenIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        this.screens.set(id, element);
      }
    });
  }

  show(screenId: ScreenId): void {
    this.screens.forEach((screen, id) => {
      if (id === screenId) {
        screen.classList.add('active');
      } else {
        screen.classList.remove('active');
      }
    });
    this.currentScreen = screenId;
  }

  getCurrentScreen(): ScreenId {
    return this.currentScreen;
  }

  showResult(won: boolean, word: string): void {
    const title = document.getElementById('result-title')!;
    const message = document.getElementById('result-message')!;
    const wordDisplay = document.getElementById('result-word')!;

    if (won) {
      title.textContent = 'You Won!';
      title.className = 'win';
      message.textContent = 'Amazing job! You figured it out!';
    } else {
      title.textContent = 'Nice Try!';
      title.className = 'lose';
      message.textContent = "Don't worry, you'll get it next time!";
    }

    wordDisplay.textContent = word;
    this.show('result-screen');

    if (won) {
      this.triggerConfetti();
    }
  }

  private triggerConfetti(): void {
    const container = document.getElementById('confetti-container')!;
    container.innerHTML = '';

    const colors = ['#8b5cf6', '#f472b6', '#34d399', '#fbbf24', '#f87171', '#60a5fa'];
    const shapes = ['square', 'circle'];

    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';

      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const left = Math.random() * 100;
      const delay = Math.random() * 2;
      const size = Math.random() * 8 + 6;

      confetti.style.cssText = `
        left: ${left}%;
        background: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: ${shape === 'circle' ? '50%' : '0'};
        animation-delay: ${delay}s;
      `;

      container.appendChild(confetti);
    }

    // Clean up after animation
    setTimeout(() => {
      container.innerHTML = '';
    }, 5000);
  }
}
