// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { SequenceType } from './index';

/**
 * Types used in the Sequence implementation and tests.
 * These are exported for better type safety and reusability across the codebase.
 * They are not intended to be used directly by end-users of the library, but they
 * can be useful for internal development and testing.
 */
export type Action = () => any | Promise<any>;

/**
 * Represents a single step in the sequence, consisting of a delay and an action to execute after that delay.
 * The delay is specified in milliseconds and will be multiplied by the sequence's delayMultiplier.
 *
 * @see {@linkcode Action}
 */
export type SequenceEntry = {
  delay: number;
  action: Action;
};

/**
 * The main Sequence class, which manages a series of timed actions. It provides methods to add steps, run the sequence,
 */
export type SequenceOptions = {
  /**
   * A base delay multiplier. Every delay specified in the sequence
   * will be multiplied by this value.
   * @default 1
   */
  delayMultiplier?: number;
};

/**
 * Represents the current state of a Sequence instance. The sequence can be in one of the following states:
 * - 'idle': The initial state before any steps have been added.
 * - 'started': After the first step is added, but before run() is called.
 * - 'running': After run() is called and while the sequence is executing.
 * - 'finished': After all steps have completed execution.
 *
 * The state transitions are as follows:
 * idle -> started -> running -> finished
 *        \-> started (if more steps are added while idle)
 *        \-> started (if more steps are added while already started)
 *        \-> running (when run() is called)
 *        \-> finished (when all steps have completed)
 *
 * @see {@linkcode SequenceType}
 */
export type State = 'idle' | 'started' | 'running' | 'finished';
