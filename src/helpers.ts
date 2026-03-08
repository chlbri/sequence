import type { Action } from './types';

/**
 * A no-op function that does nothing. Used as a default action when none is provided.
 * @see {@linkcode Action}
 */
export const nothing: Action = () => {};
