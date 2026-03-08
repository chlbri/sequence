import sleep from '@bemedev/sleep';
import { nothing } from './helpers';
import type { SequenceEntry, SequenceOptions } from './types';

class SequenceType {
  private readonly entries: SequenceEntry[] = [];
  private readonly delayMultiplier: number;
  private running = false;

  constructor(options: SequenceOptions = {}) {
    const { delayMultiplier = 1 } = options;
    if (delayMultiplier <= 0) {
      throw new RangeError('delayMultiplier must be a positive number');
    }
    this.delayMultiplier = delayMultiplier;
  }

  /**
   * Adds a step to the sequence.
   * @param delay - How long (in ms) to wait **after the previous step** before
   *               running the action (accumulated onto the last entry's delay).
   *               The actual wait is `accumulatedDelay * delayMultiplier`.
   * @param action - The callback to execute.
   */
  add = (delay: number, action = nothing): this => {
    if (delay < 0) {
      throw new RangeError(
        `delay (${delay}) must be a non-negative number`,
      );
    }
    const last = this.entries[this.entries.length - 1];
    const accumulatedDelay = last ? last.delay + delay : delay;
    this.entries.push({ delay: accumulatedDelay, action });
    return this;
  };

  /**
   * Runs all steps in order, waiting the appropriate amount (from t=0) before
   * each one. Concurrent calls while already running are ignored.
   */
  run = async (): Promise<void> => {
    if (this.running) return;
    this.running = true;
    let elapsed = 0;

    const entries = this.entries.map(({ delay, action }) => {
      const promise = async () => {
        const effectiveDelay = delay * this.delayMultiplier - elapsed;
        if (effectiveDelay > 0) {
          await sleep(effectiveDelay);
          elapsed += effectiveDelay;
        }
        const result = action();
        if (result instanceof Promise) await result;
      };

      return promise;
    });

    Promise.all(entries.map(entry => entry())).finally(
      () => (this.running = false),
    );
  };

  /** Clears all registered steps and returns this for chaining. */
  clear = (): this => {
    this.entries.length = 0;
    return this;
  };

  /**
   * Returns a brand-new Sequence with the same options but no entries.
   * The returned object is always a different reference.
   */
  get renew(): SequenceType {
    return new SequenceType({ delayMultiplier: this.delayMultiplier });
  }

  /** Returns the number of registered steps. */
  get size(): number {
    return this.entries.length;
  }

  /** Returns whether the sequence is currently running. */
  get isRunning(): boolean {
    return this.running;
  }
}

export type { SequenceType };
export const createSequence = (
  options?: SequenceOptions,
): SequenceType => {
  return new SequenceType(options);
};

export const sequence = createSequence;
