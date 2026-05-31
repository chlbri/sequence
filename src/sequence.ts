import { sleep } from '@bemedev/sleep';
import { nothing } from './helpers';
import type { SequenceEntry, SequenceOptions, State } from './types';

/**
 * Class representing a sequence of delayed actions. Use {@linkcode createSequence} to create an instance.
 *
 * @see {@linkcode createSequence}
 *
 * @example
 * import { createSequence } from '@bemedev/sequence';
 * const seq = createSequence({ delayMultiplier: 2 });
 * seq.add(1000, () => console.log('This will log after 2000ms'));
 * seq.run();
 */
class SequenceType {
  private readonly entries: SequenceEntry[] = [];
  private readonly delayMultiplier: number;
  #state: State = 'idle';

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
    this.#state = 'started';
    return this;
  };

  /**
   * Runs all steps in order, waiting the appropriate amount (from t=0) before
   * each one. Concurrent calls while already running are ignored.
   * Cannot run if the sequence is finished.
   */
  run = async (): Promise<void> => {
    if (this.#state === 'running' || this.#state === 'finished') return;
    this.#state = 'running';
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
        this.entries.shift();
      };

      return promise;
    });

    await Promise.all(entries.map(fn => fn())).finally(() => {
      this.#state = 'finished';
    });
  };

  /** Clears all registered steps and returns this for chaining. */
  clear = (): this => {
    this.entries.length = 0;
    this.#state = 'started';
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

  /** Returns the current state of the sequence. */
  get state(): State {
    return this.#state;
  }
}

export type { SequenceType };

/**
 * Factory function to create a Sequence instance. Accepts the same options as the
 * Sequence constructor, but is more convenient to import and use.
 * Other names : {@linkcode sequence}
 *
 * @see {@linkcode SequenceType}
 *
 * @example
 * import { createSequence } from '@bemedev/sequence';
 * const seq = createSequence({ delayMultiplier: 2 });
 * seq.add(1000, () => console.log('This will log after 2000ms'));
 * seq.run();
 *
 */
export const createSequence = (
  options?: SequenceOptions,
): SequenceType => {
  return new SequenceType(options);
};

export const sequence = createSequence;
