import { describe, expect, it } from 'vitest';

import { classifyKeySound, createSoundVariation } from './audio';

describe('typing sound classification', () => {
  it('classifies special typing keys', () => {
    expect(classifyKeySound('Backspace')).toBe('backspace');
    expect(classifyKeySound('Enter')).toBe('enter');
    expect(classifyKeySound(' ')).toBe('space');
  });

  it('classifies printable single-character keys as letters', () => {
    expect(classifyKeySound('a')).toBe('letter');
    expect(classifyKeySound('Ж')).toBe('letter');
  });

  it('ignores modifier and navigation keys', () => {
    expect(classifyKeySound('Shift')).toBeNull();
    expect(classifyKeySound('ArrowLeft')).toBeNull();
  });
});

describe('typing sound variation', () => {
  it('keeps randomized pitch and gain inside quiet bounds', () => {
    const variation = createSoundVariation('letter', () => 0.75);

    expect(variation.frequency).toBeGreaterThanOrEqual(420);
    expect(variation.frequency).toBeLessThanOrEqual(680);
    expect(variation.gain).toBeGreaterThanOrEqual(0.015);
    expect(variation.gain).toBeLessThanOrEqual(0.045);
    expect(variation.durationMs).toBe(28);
  });
});
