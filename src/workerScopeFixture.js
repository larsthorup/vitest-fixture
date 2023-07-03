import { instantiateFixtures } from "./fixture.js";

/** @typedef {import('..').KeyValue} KeyValue */

/** @typedef { import('..').UseFunction } UseFunction */

/**
 * @template {KeyValue} TestArgs
 * @template {KeyValue} WorkerArgs
 * @typedef {import("./fixture.js").NormalizeFixtureFunction<TestArgs, WorkerArgs>} NormalizeFixtureFunction
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

/** @typedef {import('..').WorkerFixtureRegistry} WorkerFixtureRegistry */

/** @type {WorkerFixtureRegistry | undefined} */
let workerFixtureRegistry = undefined;
export const clearWorkerFixtureRegistry = () => {
  workerFixtureRegistry = undefined;
};
export const hasWorkerFixtureRegistry = () =>
  workerFixtureRegistry !== undefined;
export const getWorkerFixtureRegistry = () => {
  if (!workerFixtureRegistry) {
    workerFixtureRegistry = {
      allTests: [],
      hookRegistered: false,
      valueCache: {},
    };
  }
  return workerFixtureRegistry;
};

/**
 * @template {KeyValue} TestArgs
 * @template {KeyValue} WorkerArgs
 * @type {NormalizeFixtureFunction<TestArgs, WorkerArgs>}
 */
const normalizeWorkerScopeFixtureFunction = (
  key,
  fixtureValueOrFunction,
  scope
) => {
  if (scope === "test") {
    const value = undefined;
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

export const workerHook = async () => {
  const allFixtures = {};
  for (const fixtures of getWorkerFixtureRegistry().allTests) {
    Object.assign(allFixtures, fixtures);
  }
  const fixtureList = Object.entries(allFixtures); /*as FixtureList<
    KeyValue,
    KeyValue
  >*/

  const { args, teardownList } = await instantiateFixtures(
    fixtureList,
    normalizeWorkerScopeFixtureFunction
  );

  getWorkerFixtureRegistry().valueCache = args;

  return async () => {
    for (const teardown of teardownList.reverse()) {
      if (teardown) await teardown();
    }
  };
};
