<details>
<summary>

## **[0.0.1] - 08/03/2026** => _22:46_

</summary>

- Add `SequenceType` class with fluent API (`add`, `run`, `clear`, `renew`,
  `size`, `state`)
- Add `createSequence` factory function (alias: `sequence`) with
  `delayMultiplier` option
- Add `nothing` helper — no-op default action
- Add accumulated delay system: each step's delay is added onto the
  previous one
- Add state machine: `idle` → `started` → `running` → `finished`
- Add `RangeError` guards for invalid `delayMultiplier` (≤ 0) and negative
  delays
- Add `renew` getter — creates a fresh instance with the same options
- Add `fixtures.ts` utilities (`record`, `useStart`) for timing-based tests
- Add full test suite (`sequence.test.ts`)
- Remove placeholder `todo()` function and its test
- <u>Test coverage **_100%_**</u>

</details>

<br/>
