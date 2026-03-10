<details>
<summary>

## **[0.1.0] - 10/03/2026** => _23:09_

</summary>

- Add suite de tests de build (`sequence.build.test.ts`) couvrant `add` et `run`
- Add `dumbFn` et `TEST_SKIP` dans `fixtures.ts`
- Wire `@bemedev/build-tests` dans les hooks `pretest`/`posttest`
- Refactor : passage de `sleep` en import nommé dans `sequence.ts`
- Update `tsconfig.json` : `module: esnext`, types vitest
- Update dépendances : `@bemedev/build-tests@^0.1.2`, `@types/node@^25.4.0`, `@typescript-eslint@^8.57.0`, `@bemedev/sleep@^0.2.2`
- <u>Test coverage **_100%_**</u>

</details>

<br/>

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
