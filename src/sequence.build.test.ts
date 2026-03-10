import { this1 } from '@bemedev/build-tests/constants';
import { createFakeWaiter, createTests } from '@bemedev/vitest-extended';
import { dumbFn, TEST_SKIP } from './fixtures';
import type { SequenceType } from './sequence';

describe.skipIf(TEST_SKIP)('build', () => {
  const DELAY = 100;
  describe('#001 => Add', () => {
    const { acceptation, success } = createTests.withImplementation(
      dumbFn,
      {
        name: 'sequence',
        instanciation: async () => {
          const func = await import(this1).then(({ sequence }) => {
            const seq = sequence();
            const add = (delay: number) => seq.add(delay, () => {});

            return add;
          });

          return func;
        },
      },
    );

    describe('#000 => Acceptation', acceptation);

    describe(
      '#01 => success',
      success(
        {
          invite: 'add returns the sequence itself',
          parameters: 100,
          expected: {} as any,
          test: value => {
            expect(value).toBeDefined();
          },
        },
        {
          invite: 'Increase size by 1 for each added step',
          parameters: 10,
          expected: {},
          test: value => {
            expect(value.size).toBe(2);
          },
        },
      ),
    );
  });

  describe('#002 => Run', () => {
    beforeAll(() => vi.useFakeTimers());

    type Test1 = {
      index: number;
    };

    const { acceptation, success } = createTests.withImplementation(
      dumbFn,
      {
        name: 'sequence',
        instanciation: async () => {
          const func = await import(this1).then(({ sequence }) => {
            const out: Test1 = {
              index: 0,
            };
            const seq: SequenceType = sequence();
            const fn = () => out.index++;
            seq.add(DELAY, fn);
            seq.add(DELAY, fn);
            seq.add(DELAY, fn);
            seq.run();
            return () => out;
          });

          return func;
        },
      },
    );

    describe('#000 => Acceptation', acceptation);

    describe(
      '#001 => Running',
      success(
        {
          invite: 'No performeds at start, index is (0)',

          expected: {},
          test: (value: Test1) => {
            expect(value.index).toBe(0);
          },
        },
        {
          invite: `Performeds after ${DELAY}ms, index is now (1)`,
          expected: {},
          test: async (value: Test1) => {
            await vi.advanceTimersByTimeAsync(DELAY);
            expect(value.index).toBe(1);
          },
        },
      ),
    );
  });

  describe('#003 => Real case', () => {
    let out: SequenceType;
    const logs: number[] = [];
    const waiter = createFakeWaiter.withDefaultDelay(vi, DELAY);

    beforeAll(async () => {
      const { sequence } = await import(this1);
      out = sequence();
    });

    it('#00 => build sequence', async () => {
      out.add(DELAY, () => logs.push(1));
      out.add(DELAY * 2, () => logs.push(2));
      out.add(DELAY * 3, () => logs.push(3));
    });

    it('#01 => run it!', () => {
      out.run();
    });

    it('#02 => Now, logs are empty', () => {
      expect(logs).toEqual([]);
    });

    it(...waiter(3));

    it('#04 => Now, logs have one member', () => {
      expect(logs).toEqual([1]);
    });

    it(...waiter(5));

    it('#06 => Now, logs have not yet 2 members', () => {
      expect(logs).toEqual([1]);
    });

    it(...waiter(7));

    it('#08 => Now, logs have 2 members', () => {
      expect(logs).toEqual([1, 2]);
    });

    it(...waiter(9));

    it('#10 => Now, logs have not yet 3 members', () => {
      expect(logs).toEqual([1, 2]);
    });

    it(...waiter(11));

    it('#12 => Now, logs have not yet 3 members', () => {
      expect(logs).toEqual([1, 2]);
    });

    it(...waiter(13));

    it('#14 => Now, logs have 3 members', () => {
      expect(logs).toEqual([1, 2, 3]);
    });

    it(...waiter(13, 50));

    it('#16 => Now, logs still have 3 members, you can wait forever', () => {
      expect(logs).toEqual([1, 2, 3]);
    });
  });
});
