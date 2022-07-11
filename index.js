import * as vitest from "vitest";

/**
 * @template {KeyValue} T
 * @template {KeyValue} W
 * @template {KeyValue} PT
 * @template {KeyValue} PW
 * @typedef {import('./index.js').Fixtures<T, W, PT, PW>} Fixtures
 */
/**
 * @template {KeyValue} TestArgs
 * @template {KeyValue} WorkerArgs
 * @typedef {import('./index.js').FixtureList<TestArgs, WorkerArgs>} FixtureList
 */
/** @typedef {import('./index.js').KeyValue} KeyValue */
/**
 * @template {KeyValue} TestArgs
 * @template {KeyValue} WorkerArgs
 * @typedef {import('./index.js').TestType<TestArgs, WorkerArgs>} TestType
 */

// Note: inspired by https://github.com/microsoft/playwright
/**
 * @template {KeyValue} TestArgs
 * @template {KeyValue} WorkerArgs
 */
class TestTypeImpl {
  /**
   * @param {import('./index.js').Fixtures<{}, {}, TestArgs, WorkerArgs>} fixtures
   */
  constructor(fixtures) {
    this.fixtures = fixtures;
    /**
     * @param {string} name
     * @param {(args: TestArgs & WorkerArgs) => void} fn
     */
    const test = (name, fn) => {
      vitest.it(name, async () => {
        /**
         * @param {FixtureList<TestArgs, WorkerArgs>} fixtureList
         * @param {TestArgs & WorkerArgs} args
         * @returns {Promise<void>}
         */
        const reduceFixtures = async (fixtureList, args) => {
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
            const fixtureValueFunction = (_, use) =>
              use(fixtureValueOrFunction);
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
              await reduceFixtures(fixtureListRest, argsAccumulated);
              if (teardown) await teardown();
            };
            switch (scope) {
              case "test":
                return fixtureFunction(args, use);
              default:
                throw new Error(`Unsupported scope: ${scope}`);
            }
          }
        };
        const fixtureList = Object.entries(this.fixtures);
        const args = /** @type {TestArgs & WorkerArgs} */ ({});
        return reduceFixtures(fixtureList, args);
      });
    };
    /**
     * @template {KeyValue} T
     * @template {KeyValue} W
     * @param {Fixtures<T & TestArgs,W & WorkerArgs,T & TestArgs,W & WorkerArgs>} fixtures
     * @returns {TestType<TestArgs & T, WorkerArgs & W>}
     */
    test.extend = (fixtures) => {
      const fixturesExtended =
        /** @type {Fixtures<{},{},T & TestArgs,W & WorkerArgs>} */ ({
          ...this.fixtures,
          ...fixtures,
        });
      return /** @type {TestType<TestArgs & T, WorkerArgs & W>} */ (
        new TestTypeImpl(fixturesExtended).test
      );
    };
    this.test = test;
  }
}

const rootTestType = new TestTypeImpl({});
const baseTest = rootTestType.test;
export const test = baseTest;
