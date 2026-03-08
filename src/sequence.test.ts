import { createFakeWaiter, createTests } from '@bemedev/vitest-extended';
import { createSequence, type SequenceType, sequence } from './index';
import { record, useStart } from './fixtures';
import sleep from '@bemedev/sleep';

vi.useFakeTimers();
const waiter = createFakeWaiter(vi);

describe('#01 => createSequence', () => {
  const { success, fails, acceptation } = createTests(createSequence);
  describe('#00 => Acceptation', acceptation);

  describe(
    '#01 => Success',
    success(
      {
        invite: 'no options – returns a Sequence object',

        expected: {} as SequenceType,
        test: value => {
          expect(value).toBeDefined();
          expect(typeof value.add).toBe('function');
          expect(typeof value.run).toBe('function');
          expect(typeof value.clear).toBe('function');
        },
      },
      {
        invite: 'multiplier = 2 – returns a Sequence object',
        parameters: [{ delayMultiplier: 2 }],
        expected: {} as SequenceType,
        test: value => {
          expect(value).toBeDefined();
          expect(typeof value.run).toBe('function');
        },
      },
    ),
  );

  describe(
    '#02 => fails',
    fails(
      {
        invite: 'delayMultiplier = 0',
        parameters: [{ delayMultiplier: 0 }],
        error: 'delayMultiplier must be a positive number',
      },
      {
        invite: 'delayMultiplier = -1',
        parameters: [{ delayMultiplier: -1 }],
        error: 'delayMultiplier must be a positive number',
      },
    ),
  );
});

describe('#02 => Sequence – add', () => {
  describe('#01 => returns this (fluent) adn increases size', () => {
    const seq = sequence();
    const add = (delay: number) => seq.add(delay, () => {});
    const { success, fails, acceptation } = createTests(add);
    describe('#00 => Acceptation', acceptation);

    describe(
      '#01 => success',
      success(
        {
          invite: 'add returns the sequence itself',
          parameters: 100,
          expected: seq,
          test: (value, expected) => {
            expect(value).toBe(expected);
          },
        },
        {
          invite: 'Increase size by 1 for each added step',
          parameters: 10,
          expected: seq,
          test: value => {
            expect(value.size).toBe(2);
          },
        },
      ),
    );

    describe(
      '#02 => fails',
      fails(
        {
          invite: '-1',
          parameters: -1,
          error: 'delay (-1) must be a non-negative number',
        },
        {
          invite: '-100',
          parameters: -100,
          error: 'delay (-100) must be a non-negative number',
        },
        {
          invite: '-(1/100)',
          parameters: -0.01,
          error: 'delay (-0.01) must be a non-negative number',
        },
      ),
    );
  });

  describe('#02 => accumulates delay onto the last entry', () => {
    describe('#01 => second entry fires at sum of both delays', async () => {
      const start = useStart();
      const recorder = record(() => start());
      const seq = createSequence();

      test('#01 => Add actions', () => {
        seq.add(100, recorder.action(0)).add(150, recorder.action(1));
      });

      test('#02 => Run the sequence', seq.run);
      test('#03 => Waits for "100" ms', () => waiter(100));

      test('#04 => It should have fired the first action', () => {
        expect(recorder.log).toHaveLength(1);
      });

      test('#05 => Waits for "150" ms', () => waiter(150));

      test('#06 => It should have fired the second action', () => {
        expect(recorder.log).toHaveLength(2);
      });

      describe('#07 => Elapsed times are correct', () => {
        test('#01 => first action at 100 ms', () => {
          expect(recorder.log[0].elapsed).toBe(100);
        });

        test('#02 => second action at 250 ms (100 + 150)', () => {
          expect(recorder.log[1].elapsed).toBe(250);
        });
      });
    });

    describe('#02 => three entries each spaced by 100 ms', () => {
      let start = 0;
      const recorder = record(() => start);
      const seq = createSequence();
      beforeAll(() => (start = Date.now()));

      test('#01 => Add actions', () => {
        seq
          .add(100, recorder.action(0))
          .add(100, recorder.action(1))
          .add(100, recorder.action(2));
      });

      test('#02 => Run the sequence', seq.run);

      test('#03 => Initially empty', () => {
        expect(recorder.log).toHaveLength(0);
      });

      test('#04 => Wait 100ms', () => waiter(100));

      test('#05 => First action fired', () => {
        expect(recorder.log).toHaveLength(1);
      });

      test('#06 => Wait 100ms', () => waiter(100));

      test('#07 => Second action fired', () => {
        expect(recorder.log).toHaveLength(2);
      });

      test('#08 => Wait 100ms', () => waiter(100));

      test('#09 => Third action fired', () => {
        expect(recorder.log).toHaveLength(3);
      });

      describe('#10 => Elapsed times are correct', () => {
        test('#01 => first action at 100 ms', () => {
          expect(recorder.log[0].elapsed).toBe(100);
        });

        test('#02 => second action at 200 ms', () => {
          expect(recorder.log[1].elapsed).toBe(200);
        });

        test('#03 => third action at 300 ms', () => {
          expect(recorder.log[2].elapsed).toBe(300);
        });
      });
    });

    describe('#03 => first entry with delay 0 does not offset later entries', () => {
      const start = useStart();
      const recorder = record(() => start());
      const seq = createSequence();

      test('#01 => Add actions', () => {
        seq.add(0, recorder.action(0)).add(200, recorder.action(1));
      });

      test('#02 => Run the sequence', seq.run);
      test('#03 => Wait 200ms', () => waiter(200));

      test('#04 => Both actions fired', () => {
        expect(recorder.log).toHaveLength(2);
      });

      describe('#05 => Elapsed times are correct', () => {
        test('#01 => first action at 0 ms', () => {
          expect(recorder.log[0].elapsed).toBe(0);
        });

        test('#02 => second action at 200 ms', () => {
          expect(recorder.log[1].elapsed).toBe(200);
        });
      });
    });
  });
});

describe('#03 => Sequence – clear', () => {
  describe('#01 => resets size to 0 and return this (fluent)', () => {
    const seq = sequence();
    test('#01 => Initial size is 0', () => expect(seq.size).toBe(0));
    test('#02 => Add two actions', () => seq.add(100).add(200));
    test('#03 => Size is 2', () => expect(seq.size).toBe(2));

    test('#04 => Clear returns the sequence itself', () => {
      const result = seq.clear();
      expect(result).toBe(seq);
    });

    test('#05 => Size is reset to 0', () => expect(seq.size).toBe(0));
  });
});

test('#04 => Sequence.isRunning -> initially false', () => {
  const seq = createSequence();
  expect(seq.isRunning).toBe(false);
});

describe('#05 => Sequence – renew', () => {
  describe('#01 => returns a new object (different reference)', () => {
    const seq = createSequence();
    const getRenew = () => seq.renew;
    const { success } = createTests(getRenew);

    describe(
      '#01 => Common',
      success(
        {
          invite: 'renew returns a different Sequence instance',
          expected: seq,
          test: (value, expected) => {
            expect(value).not.toBe(expected);
          },
        },
        {
          invite: 'renewed sequence starts with size 0',
          expected: {} as SequenceType,
          test: value => {
            expect(value.size).toBe(0);
          },
        },
      ),
    );

    describe('#02 => renewed sequence uses same delayMultiplier', () => {
      const start = useStart();
      const recorder = record(() => start());
      const original = createSequence({ delayMultiplier: 2 });
      original.add(100, recorder.action(10));
      const renewed = original.renew;

      test('#01 => Renewed is a different instance with size 0', () => {
        expect(renewed).not.toBe(original);
        expect(renewed.size).toBe(0);
      });

      test('#02 => Add action to renewed', () => {
        renewed.add(100, recorder.action(0));
      });

      test('#03 => Run renewed', renewed.run);
      test('#04 => Wait 200ms (100 * 2)', () => waiter(200));

      test('#05 => Renewed sequence fired with scaled delay', () => {
        expect(recorder.log).toHaveLength(1);
        expect(recorder.log[0].elapsed).toBe(200);
      });

      test('#06 => Wait 200ms', () => waiter(100 * 2));
      test('#07 => Run original', original.run);
      test('#08 => Wait 200ms', () => waiter(100 * 2));

      test('#09 => Original fired with scaled delay', () => {
        expect(recorder.log).toHaveLength(2);
        expect(recorder.log[1].elapsed).toBe(600);
      });

      test('#10 => Wait 2000ms (no more actions)', () => waiter(100 * 20));

      describe('#11 => No additional actions fired', () => {
        test('#01 => Still only 2 actions', () => {
          expect(recorder.log).toHaveLength(2);
        });

        test('#02 => First action elapsed is 200 ms', () => {
          expect(recorder.log[0].elapsed).toBe(200);
        });

        test('#03 => Second action elapsed is 600 ms', () => {
          expect(recorder.log[1].elapsed).toBe(600);
        });
      });
    });
  });
});

describe('#06 => Sequence – run (timing)', () => {
  describe('#01 => actions run in order with accumulated delays', () => {
    const start = useStart();
    const recorder = record(() => start());
    const seq = createSequence();

    test('#01 => Add actions', () => {
      seq
        .add(100, recorder.action(0))
        .add(200, recorder.action(1))
        .add(50, recorder.action(2));
    });

    test('#02 => Run the sequence', seq.run);

    test('#03 => Initially empty', () => {
      expect(recorder.log).toHaveLength(0);
    });

    test('#04 => Wait 100ms', () => waiter(100));

    test('#05 => First action fired', () => {
      expect(recorder.log).toHaveLength(1);
    });

    test('#06 => Wait 200ms', () => waiter(200));

    test('#07 => Second action fired', () => {
      expect(recorder.log).toHaveLength(2);
    });

    test('#08 => Wait 50ms', () => waiter(50));

    test('#09 => Third action fired', () => {
      expect(recorder.log).toHaveLength(3);
    });

    describe('#10 => Actions ran in correct order', () => {
      test('#01 => index 0', () => {
        expect(recorder.log[0].index).toBe(0);
      });

      test('#02 => index 1', () => {
        expect(recorder.log[1].index).toBe(1);
      });

      test('#03 => index 2', () => {
        expect(recorder.log[2].index).toBe(2);
      });
    });

    describe('#11 => Elapsed times are correct', () => {
      test('#01 => first action at 100 ms', () => {
        expect(recorder.log[0].elapsed).toBe(100);
      });

      test('#02 => second action at 300 ms', () => {
        expect(recorder.log[1].elapsed).toBe(300);
      });

      test('#03 => third action at 350 ms', () => {
        expect(recorder.log[2].elapsed).toBe(350);
      });
    });
  });

  describe('#02 => zero-delay actions run immediately', () => {
    const start = useStart();
    const recorder = record(() => start());
    const seq = createSequence();

    test('#01 => Add actions', () => {
      seq.add(0, recorder.action(0)).add(0, recorder.action(1));
    });

    test('#02 => Run the sequence', seq.run);

    test('#03 => Both actions fired immediately', () => {
      expect(recorder.log).toHaveLength(2);
    });

    describe('#04 => Actions ran in correct order', () => {
      test('#01 => index 0', () => {
        expect(recorder.log[0].index).toBe(0);
      });

      test('#02 => index 1', () => {
        expect(recorder.log[1].index).toBe(1);
      });
    });

    describe('#05 => Elapsed times are 0', () => {
      test('#01 => first action at 0 ms', () => {
        expect(recorder.log[0].elapsed).toBe(0);
      });

      test('#02 => second action at 0 ms', () => {
        expect(recorder.log[1].elapsed).toBe(0);
      });
    });
  });

  describe('#03 => delayMultiplier scales all accumulated delays', () => {
    const start = useStart();
    const recorder = record(() => start());
    const seq = createSequence({ delayMultiplier: 3 });

    test('#01 => Add actions', () => {
      seq.add(100, recorder.action(0)).add(200, recorder.action(1));
    });

    test('#02 => Run the sequence', seq.run);
    test('#03 => Wait 300ms (100 * 3)', () => waiter(100 * 3));
    test('#04 => Wait 600ms (200 * 3)', () => waiter(200 * 3));

    test('#05 => Both actions fired', () => {
      expect(recorder.log).toHaveLength(2);
    });

    describe('#06 => Elapsed times are correct', () => {
      test('#01 => first action at 300 ms', () => {
        expect(recorder.log[0].elapsed).toBe(300);
      });

      test('#02 => second action at 900 ms', () => {
        expect(recorder.log[1].elapsed).toBe(900);
      });
    });
  });

  describe('#04 => fractional delayMultiplier works', () => {
    const start = useStart();
    const recorder = record(() => start());
    const seq = createSequence({ delayMultiplier: 1 / 2 });

    test('#01 => Add action', () => {
      seq.add(200, recorder.action(0));
    });

    test('#02 => Run the sequence', seq.run);
    test('#03 => Wait 100ms (200 / 2)', () => waiter(200 / 2));

    test('#04 => Action fired', () => {
      expect(recorder.log).toHaveLength(1);
    });

    test('#05 => Elapsed time is 100 ms', () => {
      expect(recorder.log[0].elapsed).toBe(100);
    });
  });

  describe('#05 => concurrent run calls are ignored', () => {
    const start = useStart();
    const recorder = record(() => start());
    const seq = createSequence();

    test('#01 => Add actions', () => {
      seq.add(100, recorder.action(0)).add(100, recorder.action(1));
    });

    test('#02 => Run the sequence concurrently', () => {
      Promise.all([seq.run(), seq.run()]);
    });

    test('#03 => Initially empty', () => {
      expect(recorder.log).toHaveLength(0);
    });

    test('#04 => Wait 100ms', () => waiter(100));

    test('#05 => First action fired', () => {
      expect(recorder.log).toHaveLength(1);
    });

    test('#06 => Wait 100ms', () => waiter(100));

    test('#07 => Second action fired', () => {
      expect(recorder.log).toHaveLength(2);
    });

    test('#08 => Wait 10000ms (no more)', () => waiter(10_000));

    test('#09 => No additional actions fired', () => {
      expect(recorder.log).toHaveLength(2);
    });
  });

  describe('#06 => isRunning is true while running', () => {
    const seq = createSequence();

    test('#01 => Add action', () => {
      seq.add(200, () => {});
    });

    test('#02 => isRunning is false before run', () => {
      expect(seq.isRunning).toBe(false);
    });

    test('#03 => Run the sequence', seq.run);

    test('#04 => isRunning is true during run', () => {
      expect(seq.isRunning).toBe(true);
    });

    test('#05 => Wait 200ms', () => waiter(200));

    test('#06 => isRunning is false after run', () => {
      expect(seq.isRunning).toBe(false);
    });
  });

  describe('#07 => can run again after completion, but not in running', () => {
    const counter = { count: 0 };
    const seq = createSequence();

    test('#01 => Add action', () => {
      seq.add(50, () => counter.count++);
    });

    test('#02 => Run the sequence', seq.run);
    test('#03 => Run again (ignored while running)', seq.run);
    test('#04 => Wait 50ms', () => waiter(50));

    test('#05 => Action fired once', () => {
      expect(counter.count).toBe(1);
    });

    test('#06 => Run again after completion', seq.run);
    test('#07 => Wait 50ms', () => waiter(50));

    test('#08 => Action fired again', () => {
      expect(counter.count).toBe(2);
    });
  });

  describe('#08 => async actions are awaited before next step', () => {
    const order: string[] = [];
    const seq = sequence();

    test('#01 => Add actions', () => {
      seq
        .add(50, async () => {
          order.push('start-a');
          await sleep(100);
          order.push('end-a');
        })
        .add(10, () => {
          order.push('b');
        });
    });

    test('#02 => Run the sequence', seq.run);
    test('#03 => Wait 50ms', () => waiter(50));

    test('#04 => Async action started', () => {
      expect(order).toEqual(['start-a']);
    });

    test('#05 => Wait 100ms', () => waiter(10));

    test('#06 => Async action not yet completed', () => {
      expect(order).toEqual(['start-a', 'b']);
    });

    test('#07 => Wait 10ms', () => waiter(100 - 10));

    test('#08 => Next action fired after async completion', () => {
      expect(order).toEqual(['start-a', 'b', 'end-a']);
    });
  });
});

describe('#07 => Sequence – run (withDefaultDelay helper)', () => {
  describe('#01 => three steps each 100 ms apart (accumulated)', () => {
    const advance = createFakeWaiter.withDefaultDelay(vi, 100);
    const start = useStart();
    const recorder = record(() => start());
    const seq = createSequence();

    test('#01 => Add actions', () => {
      seq
        .add(100, recorder.action(0))
        .add(100, recorder.action(1))
        .add(100, recorder.action(2));
    });

    test('#02 => Run the sequence', seq.run);

    test('#03 => Advance all steps', async () => {
      const steps = [advance(0), advance(1), advance(2)];
      await Promise.all(steps.map(([, fn]) => fn()));
    });

    test('#04 => Actions ran in correct order', () => {
      expect(recorder.log.map(e => e.index)).toEqual([0, 1, 2]);
    });

    describe('#05 => Elapsed times are correct', () => {
      test('#01 => first action at 100 ms', () => {
        expect(recorder.log[0].elapsed).toBe(100);
      });

      test('#02 => second action at 200 ms', () => {
        expect(recorder.log[1].elapsed).toBe(200);
      });

      test('#03 => third action at 300 ms', () => {
        expect(recorder.log[2].elapsed).toBe(300);
      });
    });
  });
});
