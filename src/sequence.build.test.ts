import { customImport } from '@bemedev/dev-utils/build-tests';
import {
  createFakeWaiter,
  createTests,
} from '@bemedev/dev-utils/vitest-extended';
import { dumbFn, TEST_SKIP } from './fixtures';
import type { SequenceType } from './sequence';
import { nothing } from './helpers';

describe.skipIf(TEST_SKIP)('build', () => {
  const DELAY = 100;
  describe('#001 => Add', () => {
    const { acceptation, success } = createTests.withImplementation(
      dumbFn,
      {
        name: 'sequence',
        instanciation: () =>
          customImport({
            fn: m => {
              const seq = m.sequence() as SequenceType;
              const add = (delay: number) => seq.add(delay, nothing);

              return add;
            },
          }),
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
          expected: {} as any,
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
        instanciation: () =>
          customImport({
            fn: m => {
              const out: Test1 = { index: 0 };
              const seq = m.sequence() as SequenceType;
              const fn = () => out.index++;

              seq.add(DELAY, fn);
              seq.add(DELAY, fn);
              seq.add(DELAY, fn);
              seq.run();
              return () => out;
            },
          }),
      },
    );

    describe('#000 => Acceptation', acceptation);

    describe(
      '#001 => Running',
      success(
        {
          invite: 'No performeds at start, index is (0)',

          expected: {} as any,
          test: (value: Test1) => {
            expect(value.index).toBe(0);
          },
        },
        {
          invite: `Performeds after ${DELAY}ms, index is now (1)`,
          expected: {} as any,
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
      const { sequence } = await customImport({ fn: m => m });
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
