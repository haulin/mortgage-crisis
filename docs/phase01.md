# Phase 01 — Deterministic RNG + Shuffle + Seeding Policy

This phase introduces a tiny deterministic PRNG so **deck shuffles, AI choices, and scenario reproduction** are stable and testable on TIC-80.

Phase 00 already proved we can generate `game.js` from `src/` and run `node --test`. Phase 01 builds on that foundation.

## Why we need our own RNG

- `Math.random()` is not seedable and is not reproducible by design.
- We want repeatable runs for debugging and unit tests.
- TIC-80 provides time sources (e.g. `tstamp()`) we can use later for “release-ish” randomness, but Phase 01 focuses on deterministic dev seeding.

## Decisions locked (from interview)

- PRNG: **xorshift32**
- Dev seeding (MVP): **constant seed in code** (`PD.config.seedBase`)
- Release/random seeding: **deferred** (when we add it, `tstamp()`-only is sufficient)
- Cartridge metadata: add **`// saveid: PropertyDeal`** in generated `game.js` header (future-proofing for `pmem()`)

## Definition of Done

Phase 01 is done when:

- `PD.RNG` (xorshift32) exists and passes tests
- We can compute a **32-bit seed** for the current game from `PD.config.seedBase`
- Deck shuffle helper `PD.shuffleInPlace(array, rng)` exists and is deterministic given a seed
- `scripts/build.mjs` injects `// saveid: PropertyDeal` into `game.js` header
- Seed visibility/overlay is **deferred** until we are actually playtesting and need reproducible bug reports
- `npm test` includes RNG + shuffle tests and passes

## Scope (what we implement)

### 1) RNG module (`src/03_rng.js`)

Implement a tiny RNG with a 32-bit state:

- `PD.RNG(seedU32)`
  - stores state as unsigned 32-bit
  - state must never be `0` (if seed resolves to 0, use 1)
- `rng.nextU32()` → unsigned 32-bit int
- `rng.nextInt(n)` → integer in `[0, n)`
- (optional) `rng.nextBool()` or `rng.pick(array)` convenience methods

Recommended xorshift32:

```js
PD.RNG = function (seedU32) {
  var s = (seedU32 >>> 0) || 1;
  this.s = s >>> 0;
};

PD.RNG.prototype.nextU32 = function () {
  var x = this.s >>> 0;
  x ^= (x << 13); x >>>= 0;
  x ^= (x >>> 17);
  x ^= (x << 5);  x >>>= 0;
  this.s = x >>> 0;
  return this.s;
};

PD.RNG.prototype.nextInt = function (n) {
  return (this.nextU32() % n) | 0;
};
```

Notes:

- Bitwise ops in JS are 32-bit signed, but `>>> 0` coerces back to unsigned.
- Modulo bias is acceptable for our use (shuffle + AI), given the tiny state and game requirements.

### 2) Seed policy (`src/04_seed.js` or keep in `src/03_rng.js`)

Add helpers:

- `PD.computeSeed()` → u32 seed
- `PD.newGameRng()` → `new PD.RNG(PD.computeSeed())`

Rules:

#### Dev (Phase 01 / MVP)

- Seed = `PD.config.seedBase` (wrap as u32)

This gives deterministic, memorable sequences and reproducibility by sharing `seedBase`.

#### Release/random seeding (deferred)

When we need “random-enough” seeds for playtesting/release, we can seed from `tstamp()` (seconds since epoch). Starting multiple new games within <1 second is not a realistic concern.

### 3) Shuffle helper (`src/05_shuffle.js` or alongside RNG)

Implement Fisher–Yates in-place shuffle:

- `PD.shuffleInPlace(arr, rng)`
  - for `i = arr.length-1..1`: swap `i` with random `j in [0..i]`

This will be used later for deck shuffling.

### 4) Config changes (`src/01_config.js`)

Add config fields:

- `seedBase: 1001` (memorable base seed)

Keep existing:

- screen dimensions

### 5) Boot screen update (`src/02_boot.js`) (optional)

Phase 01 does not require any UI changes. Optionally, we can print the current seed on the boot screen while developing.

### 6) Build header metadata (`scripts/build.mjs`)

Extend `HEADER_LINES` to include:

- `// saveid: PropertyDeal`

Reason:

- stabilizes future `pmem()` usage across code edits (without relying on code hash)

### 7) Tests (`test/rng.test.mjs`, `test/shuffle.test.mjs`)

Add deterministic tests using Node `--test`:

- RNG sequence test:
  - for a known seed (e.g. 1), assert first N outputs match frozen expected values
- `nextInt(n)` bounds test:
  - generates many values, asserts all are in range
- Shuffle determinism:
  - given seed X and initial array, shuffled result matches frozen expected permutation

Implementation detail:

- Tests load `src/*.js` via `vm` (reuse the Phase 00 loader style).
- Tests should stub TIC-80 globals used by boot code (`cls`, `print`).

## Suggested file list (expected changes)

- `src/01_config.js` (add `seedBase`)
- `src/02_boot.js` (optional: display seed)
- `src/03_rng.js` (new)
- `src/04_seed.js` (new; or fold into `03_rng.js`)
- `src/05_shuffle.js` (new; or fold into seed/rng module)
- `scripts/build.mjs` (inject `// saveid: PropertyDeal`)
- `test/` (new tests: `rng.test.mjs`, `shuffle.test.mjs`)

## Notes / future hooks

- Later we can add seed display and time-based seeding once we actually start playtesting.

## Notes for Phase 02 (rules engine + state)

- Keep `src/*` **TIC-safe** (no `import`/`export`). Use `test/helpers/loadSrcIntoVm.mjs` to unit test `PD.*` code from Node.
- When Phase 02 introduces new TIC-80 globals in `src/*`, stub them in tests (either via `extraGlobals` passed to `loadSrcIntoVm` or default stubs) so tests stay frictionless.
- `// saveid: PropertyDeal` is now injected into generated `game.js`. If Phase 02+ starts using `pmem()`, reserve and document a small slot range early (e.g. 0–31) so saves/debug state don’t collide.
- Treat `game.js` as the canonical paste artifact: after any `src/*` change, run `npm run build` before validating behavior in TIC-80.
- Sprite workflow gotcha: keep a dedicated TIC cart with sprite assets; pasting updated `game.js` updates code while preserving sprites.
- Guard against Phase 02 scope creep: Phase 02 should focus on **state + commands + legality + tests**. Keep UI/rendering minimal until the command layer is stable.

