// On-screen keyboard component

export type KeyCallback = (letter: string) => void;

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

export class Keyboard {
  private container: HTMLElement;
  private keys: Map<string, HTMLButtonElement> = new Map();
  private onKeyPress: KeyCallback;

  constructor(containerId: string, onKeyPress: KeyCallback) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Keyboard container #${containerId} not found`);
    }
    this.container = container;
    this.onKeyPress = onKeyPress;
    this.render();
    this.setupPhysicalKeyboard();
  }

  private render(): void {
    this.container.innerHTML = '';
    this.keys.clear();

    KEYBOARD_ROWS.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'keyboard-row';

      row.forEach(letter => {
        const button = document.createElement('button');
        button.className = 'key';
        button.textContent = letter;
        button.dataset.letter = letter;
        button.addEventListener('click', () => this.handleClick(letter));
        rowDiv.appendChild(button);
        this.keys.set(letter, button);
      });

      this.container.appendChild(rowDiv);
    });
  }

  private handleClick(letter: string): void {
    const button = this.keys.get(letter);
    if (button && !button.disabled) {
      this.onKeyPress(letter);
    }
  }

  private setupPhysicalKeyboard(): void {
    document.addEventListener('keydown', (event) => {
      const letter = event.key.toUpperCase();
      if (this.keys.has(letter)) {
        this.handleClick(letter);
      }
    });
  }

  markCorrect(letter: string): void {
    const button = this.keys.get(letter.toUpperCase());
    if (button) {
      button.classList.add('correct');
      button.disabled = true;
    }
  }

  markWrong(letter: string): void {
    const button = this.keys.get(letter.toUpperCase());
    if (button) {
      button.classList.add('wrong');
      button.disabled = true;
    }
  }

  reset(): void {
    this.keys.forEach(button => {
      button.classList.remove('correct', 'wrong');
      button.disabled = false;
    });
  }

  disableAll(): void {
    this.keys.forEach(button => {
      button.disabled = true;
    });
  }
}
