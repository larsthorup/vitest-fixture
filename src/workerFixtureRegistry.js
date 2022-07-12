/** @typedef {import('..').KeyValue} KeyValue */

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

/** @type { () => Promise<() => Promise<void>> } */
export const workerHook = async () => {
  /** @type { (() => Promise<void>)[] } */
  const teardownList = [];
  /**
   * @param {FixtureList<KeyValue, KeyValue>} fixtureList
   * @param {KeyValue} args
   * @returns
   */
  const reduceFixtures = async (fixtureList, args) /*: Promise<void>*/ => {
    if (fixtureList.length > 0) {
      const [[key, fixture], ...fixtureListRest] = fixtureList;
      const [fixtureValueOrFunction, { scope }] = Array.isArray(fixture)
        ? fixture
        : [fixture, { scope: "test" /* as FixtureScope*/ }];
      /**
       * @param {KeyValue} _
       * @param {(value: any) => Promise<void>} use
       */
      const fixtureValueFunction = (_, use) => use(fixtureValueOrFunction);
      const fixtureFunction /*: TestFixture<any, KeyValue> */ =
        typeof fixtureValueOrFunction === "function"
          ? fixtureValueOrFunction
          : fixtureValueFunction;
      /**
       * @param {any} value
       * @param {() => Promise<void>} teardown
       */
      const use = async (value, teardown) => {
        getWorkerFixtureRegistry().valueCache[key] = value;
        const argsAccumulated = { ...args, [key]: value };
        if (teardown) teardownList.push(teardown);
        return reduceFixtures(fixtureListRest, argsAccumulated);
      };
      switch (scope) {
        case "test":
          getWorkerFixtureRegistry().valueCache[key] = undefined;
          return;
        case "worker":
          return fixtureFunction(args, use);
      }
    }
  };
  const allFixtures = {};
  for (const fixtures of getWorkerFixtureRegistry().allTests) {
    Object.assign(allFixtures, fixtures);
  }
  const fixtureList = Object.entries(allFixtures); /*as FixtureList<
    KeyValue,
    KeyValue
  >*/
  const args = {}; /*as KeyValue*/
  await reduceFixtures(fixtureList, args);
  return async () => {
    for (const teardown of teardownList.reverse()) {
      await teardown();
    }
  };
};
