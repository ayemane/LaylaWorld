// Sound manager using Web Audio API

type SoundType = 'correct' | 'wrong' | 'win' | 'lose' | 'click';

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.3
  ): void {
    if (!this.enabled) return;

    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  private playChord(
    frequencies: number[],
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.2
  ): void {
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, duration, type, volume);
      }, index * 80);
    });
  }

  play(sound: SoundType): void {
    if (!this.enabled) return;

    switch (sound) {
      case 'click':
        this.playTone(800, 0.05, 'sine', 0.1);
        break;

      case 'correct':
        // Happy ascending chime
        this.playChord([523, 659, 784], 0.3, 'sine', 0.2);
        break;

      case 'wrong':
        // Gentle descending tone
        this.playTone(300, 0.2, 'triangle', 0.15);
        setTimeout(() => this.playTone(250, 0.3, 'triangle', 0.1), 100);
        break;

      case 'win':
        // Victory fanfare
        this.playChord([523, 659, 784, 1047], 0.5, 'sine', 0.25);
        setTimeout(() => {
          this.playChord([587, 740, 880, 1175], 0.6, 'sine', 0.25);
        }, 300);
        break;

      case 'lose':
        // Encouraging "try again" sound
        this.playChord([392, 330, 294], 0.4, 'triangle', 0.15);
        break;
    }
  }
}

export const soundManager = new SoundManager();
