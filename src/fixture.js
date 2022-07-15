import { getWorkerFixtureRegistry } from "./workerFixtureRegistry.js";

/** @typedef {import('..').KeyValue} KeyValue */

/** @typedef { import('..').UseFunction } UseFunction */

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

/**
 * @template TestArgs
 * @template WorkerArgs
 * @param {FixtureList<TestArgs, WorkerArgs>} fixtureList
 * @param {TestArgs & WorkerArgs} args
 * @param {(args: TestArgs & WorkerArgs) => void} fn
 * @returns {Promise<void>}
 */
const reduceFixtures = async (fn, fixtureList, args) => {
  if (fixtureList.length === 0) {
    return fn(args);
  } else {
    const [[key, fixture], ...fixtureListRest] = fixtureList;
    const [fixtureValueOrFunction, { scope }] = Array.isArray(fixture)
      ? fixture
      : [fixture, { scope: "test" }];
    /**
     * @param {KeyValue} _
     * @param {UseFunction} use
     */
    const fixtureValueFunction = (_, use) =>
      use(fixtureValueOrFunction, undefined);
    const fixtureFunction =
      typeof fixtureValueOrFunction === "function"
        ? fixtureValueOrFunction
        : fixtureValueFunction;
    /** @type { UseFunction } */
    const use = async (value, teardown) => {
      const argsAccumulated = { ...args, [key]: value };
      await reduceFixtures(fn, fixtureListRest, argsAccumulated);
      if (teardown) await teardown(); // TODO: accumulate teardowns
    };
    // TODO: inject handlers for test and worker fixtures
    switch (scope) {
      case "test":
        return fixtureFunction(args, use);
      case "worker": {
        /**
         * @param {KeyValue} _
         * @param {UseFunction} use
         */
        const fixtureFunction = (_, use) =>
          use(getWorkerFixtureRegistry().valueCache[key], undefined);
        return fixtureFunction(args, use);
      }
      default:
        throw new Error(`Unsupported scope: ${scope}`);
    }
  }
};

/**
 * @template TestArgs
 * @template WorkerArgs
 * @param {(args: TestArgs & WorkerArgs) => void} fn
 * @param {Fixtures<TestArgs, WorkerArgs, TestArgs, WorkerArgs>} fixtures
 * @returns {Promise<void>}
 */
export const applyWithFixtures = async (fn, fixtures) => {
  const fixtureList = Object.entries(fixtures);
  const args = /** @type {TestArgs & WorkerArgs} */ ({});
  return reduceFixtures(fn, fixtureList, args);
};
