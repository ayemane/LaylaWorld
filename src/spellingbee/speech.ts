// Text-to-speech using Web Speech API

class SpeechManager {
  private synth: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;
  private rate: number = 0.85; // Slightly slower for kids

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoice();
  }

  private loadVoice(): void {
    const setVoice = () => {
      const voices = this.synth.getVoices();
      // Prefer a female US English voice for clarity
      this.voice = voices.find(v =>
        v.lang.startsWith('en') && v.name.toLowerCase().includes('female')
      ) || voices.find(v =>
        v.lang.startsWith('en-US')
      ) || voices.find(v =>
        v.lang.startsWith('en')
      ) || voices[0];
    };

    setVoice();

    // Voices may load async
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = setVoice;
    }
  }

  speak(text: string, onEnd?: () => void): void {
    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    if (this.voice) {
      utterance.voice = this.voice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
    }

    this.synth.speak(utterance);
  }

  speakWord(word: string, onEnd?: () => void): void {
    // Spell out letters for very short words or speak normally
    this.speak(word, onEnd);
  }

  speakSentence(sentence: string, onEnd?: () => void): void {
    this.speak(sentence, onEnd);
  }

  speakDefinition(definition: string, onEnd?: () => void): void {
    this.speak(definition, onEnd);
  }

  speakSpelling(word: string, onEnd?: () => void): void {
    // Speak each letter with pauses
    const letters = word.toUpperCase().split('').join(', ');
    this.speak(letters, onEnd);
  }

  stop(): void {
    this.synth.cancel();
  }

  setRate(rate: number): void {
    this.rate = Math.max(0.5, Math.min(1.5, rate));
  }
}

export const speechManager = new SpeechManager();
