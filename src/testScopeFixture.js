import { getWorkerFixtureRegistry } from "./workerScopeFixture.js";
import { instantiateFixtures } from "./fixture.js";

/** @typedef {import('..').KeyValue} KeyValue */
/** @typedef { import('..').UseFunction } UseFunction */

/**
 * @template {KeyValue} TestArgs
 * @template {KeyValue} WorkerArgs
 * @typedef {import("./fixture.js").NormalizeFixtureFunction<TestArgs, WorkerArgs>} NormalizeFixtureFunction
 */

/**
 * @template {KeyValue} T
 * @template {KeyValue} W
 * @template {KeyValue} PT
 * @template {KeyValue} PW
 * @typedef {import('..').Fixtures<T, W, PT, PW>} Fixtures
 */

/**
 * @template {KeyValue} TestArgs
 * @template {KeyValue} WorkerArgs
 * @typedef {import('..').FixtureValue<TestArgs, WorkerArgs>} FixtureValue
 */

/**
 * @template {KeyValue} TestArgs
 * @template {KeyValue} WorkerArgs
 * @typedef {[key: string,value: FixtureValue<TestArgs, WorkerArgs>][]} FixtureList
 */

// /**
//  * @template TestArgs
//  * @template WorkerArgs
//  * @param {(args: TestArgs & WorkerArgs) => void} fn
//  * @param {Fixtures<TestArgs, WorkerArgs, TestArgs, WorkerArgs>} fixtures
//  * @returns {Promise<void>}
//  */
// export const applyWithFixtures = async (fn, fixtures) => {
//   const fixtureList = Object.entries(fixtures);
//   const args = /** @type {TestArgs & WorkerArgs} */ ({});
//   return reduceFixtures(fn, fixtureList, args);
// };

/**
 * @template TestArgs
 * @template WorkerArgs
 * @type {NormalizeFixtureFunction<TestArgs, WorkerArgs>}
 */
const normalizeTestScopeFixtureFunction = (
  key,
  fixtureValueOrFunction,
  scope
) => {
  if (scope === "worker") {
    const value = getWorkerFixtureRegistry().valueCache[key];
    const teardown = undefined;
    /** @type {NormalizeFixtureFunction<TestArgs, WorkerArgs>} */
    const fixtureFunction = (_, use) => use(value, teardown);
    return fixtureFunction;
  } else if (typeof fixtureValueOrFunction !== "function") {
    const value = fixtureValueOrFunction;
    const teardown = undefined;
    /** @type {NormalizeFixtureFunction<TestArgs, WorkerArgs>} */
    const fixtureFunction = (_, use) => use(value, teardown);
    return fixtureFunction;
  } else {
    return fixtureValueOrFunction;
  }
};

/**
 * @template TestArgs
 * @template WorkerArgs
 * @param {(args: TestArgs & WorkerArgs) => Promise<void>} fn
 * @param {Fixtures<TestArgs, WorkerArgs, TestArgs, WorkerArgs>} fixtures
 * @returns {Promise<void>}
 */
export const applyWithFixtures = async (fn, fixtures) => {
  const fixtureList = Object.entries(fixtures);
  const { args, teardownList } = await instantiateFixtures(
    fixtureList,
    normalizeTestScopeFixtureFunction
  );
  await fn(/** @type {TestArgs & WorkerArgs} */ (args));
  for (const teardown of teardownList.reverse()) {
    if (teardown) await teardown();
  }
};
