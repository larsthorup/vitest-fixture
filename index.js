import * as vitest from "vitest";

import { applyWithFixtures } from "./src/fixture.js";

// Note: inspired by https://github.com/microsoft/playwright

/** @typedef {import('.').KeyValue} KeyValue */
/**
 * @template {KeyValue} T
 * @template {KeyValue} W
 * @template {KeyValue} PT
 * @template {KeyValue} PW
 * @typedef {import('.').Fixtures<T, W, PT, PW>} Fixtures
 */
/**
 * @template {KeyValue} TestArgs
 * @template {KeyValue} WorkerArgs
 * @typedef {import('.').TestType<TestArgs, WorkerArgs>} TestType
 */

/**
 * @template {KeyValue} TestArgs
 * @template {KeyValue} WorkerArgs
 */
class TestTypeImpl {
  /**
   * @param {import('.').Fixtures<{}, {}, TestArgs, WorkerArgs>} fixtures
   */
  constructor(fixtures) {
    this.fixtures = fixtures;
    /**
     * @param {string} name
     * @param {(args: TestArgs & WorkerArgs) => void} fn
     */
    const test = (name, fn) => {
      vitest.test(name, () => applyWithFixtures(fn, this.fixtures));
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
