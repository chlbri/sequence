/** Records the elapsed time (relative to a given start) at which each action fires. */
export const record = (getStart: () => number) => {
  const log: { index: number; elapsed: number }[] = [];
  return {
    log,
    action(index: number) {
      return () => {
        log.push({ index, elapsed: Date.now() - getStart() });
      };
    },
  };
};

export const useStart = () => {
  let start = 0;
  beforeAll(() => (start = Date.now()));
  return () => start;
};

export const dumbFn = () => {};
export const TEST_SKIP = process.env.VITEST_VSCODE === 'true';
