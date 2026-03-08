export type Action = () => any | Promise<any>;

export type SequenceEntry = {
  delay: number;
  action: Action;
};

export type SequenceOptions = {
  /**
   * A base delay multiplier. Every delay specified in the sequence
   * will be multiplied by this value.
   * @default 1
   */
  delayMultiplier?: number;
};

export type State = 'idle' | 'running' | 'finished';
