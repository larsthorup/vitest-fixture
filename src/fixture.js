import { getWorkerFixtureRegistry } from "./workerFixtureRegistry.js";

/** @typedef {import('..').KeyValue} KeyValue */

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
     * @param {(value: any) => Promise<void>} use
     */
    const fixtureValueFunction = (_, use) => use(fixtureValueOrFunction);
    const fixtureFunction =
      typeof fixtureValueOrFunction === "function"
        ? fixtureValueOrFunction
        : fixtureValueFunction;
    /**
     * @param {any} value
     * @param {() => Promise<void>} teardown
     */
    const use = async (value, teardown) => {
      const argsAccumulated = { ...args, [key]: value };
      await reduceFixtures(fn, fixtureListRest, argsAccumulated);
      if (teardown) await teardown();
    };
    switch (scope) {
      case "test":
        return fixtureFunction(args, use);
      case "worker": {
        // TODO: merge with above
        const value = getWorkerFixtureRegistry().valueCache[key];
        const argsAccumulated = { ...args, [key]: value };
        return reduceFixtures(fn, fixtureListRest, argsAccumulated);
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
