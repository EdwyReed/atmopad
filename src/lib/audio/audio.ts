export type KeySound = 'letter' | 'space' | 'enter' | 'backspace';

export interface SoundVariation {
  frequency: number;
  gain: number;
  durationMs: number;
}

const BASE_FREQUENCIES: Record<KeySound, number> = {
  letter: 520,
  space: 260,
  enter: 180,
  backspace: 340
};

const DURATIONS: Record<KeySound, number> = {
  letter: 28,
  space: 38,
  enter: 58,
  backspace: 34
};

export function classifyKeySound(key: string): KeySound | null {
  if (key === 'Backspace') return 'backspace';
  if (key === 'Enter') return 'enter';
  if (key === ' ') return 'space';
  if (key.length === 1 && !/^\s$/.test(key)) return 'letter';
  return null;
}

export function createSoundVariation(
  sound: KeySound,
  random: () => number = Math.random
): SoundVariation {
  const center = BASE_FREQUENCIES[sound];
  const pitchJitter = 0.86 + random() * 0.28;
  const gain = 0.015 + random() * 0.03;

  return {
    frequency: Math.round(center * pitchJitter),
    gain,
    durationMs: DURATIONS[sound]
  };
}

export class TypingAudio {
  #context: AudioContext | null = null;

  async unlock(): Promise<void> {
    const AudioContextCtor = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextCtor) return;
    this.#context ??= new AudioContextCtor();
    if (this.#context.state === 'suspended') {
      await this.#context.resume();
    }
  }

  play(sound: KeySound): void {
    if (!this.#context || this.#context.state !== 'running') return;

    const variation = createSoundVariation(sound);
    const oscillator = this.#context.createOscillator();
    const gain = this.#context.createGain();
    const now = this.#context.currentTime;
    const duration = variation.durationMs / 1000;

    oscillator.type = sound === 'enter' ? 'triangle' : 'sine';
    oscillator.frequency.setValueAtTime(variation.frequency, now);
    gain.gain.setValueAtTime(variation.gain, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gain);
    gain.connect(this.#context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
