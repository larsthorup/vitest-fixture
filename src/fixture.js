// TODO: rename to fixture, and rename fixture.js to testScopedFixture

/** @typedef {import('..').KeyValue} KeyValue */
/** @typedef {import('..').FixtureScope} FixtureScope */
/** @typedef {import('..').UseFunction} UseFunction */

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
 * @template {KeyValue} TestArgs
 * @template {KeyValue} WorkerArgs
 * @typedef {(key: string, fixtureValue: FixtureValue<TestArgs, WorkerArgs>, scope: FixtureScope) => FixtureValue<TestArgs, WorkerArgs>} NormalizeFixtureFunction
 */

/**
 * @template {KeyValue} TestArgs
 * @template {KeyValue} WorkerArgs
 * @param {string} key
 * @param {FixtureValue<TestArgs, WorkerArgs>} fixture
 * @returns
 */
export const normalizeFixture = (key, fixture) => {
  const [fixtureValue, { scope }] = Array.isArray(fixture)
    ? fixture
    : [fixture, { scope: "test" }];
  return { fixtureValue, scope };
};

/**
 * @template {KeyValue} TestArgs
 * @template {KeyValue} WorkerArgs
 * @param {FixtureList<TestArgs, WorkerArgs>} fixtureList
 * @param {NormalizeFixtureFunction<TestArgs, WorkerArgs>} normalizeFixtureFunction
 * @returns {Promise<{args: TestArgs & WorkerArgs, teardownList: ((() => Promise<void>) | undefined)[]}>}
 */
export const instantiateFixtures = async (
  fixtureList,
  normalizeFixtureFunction
) => {
  let args = /** @type {TestArgs & WorkerArgs} */ ({});
  const teardownList = [];

  for (const [key, fixture] of fixtureList) {
    const { fixtureValue, scope } = normalizeFixture(key, fixture);
    const fixtureFunction = normalizeFixtureFunction(key, fixtureValue, scope);
    const { value, teardown } = await new Promise((resolve, reject) => {
      /** @type {UseFunction} */
      const use = async (value, teardown) => resolve({ value, teardown });
      /* TODO: await? */ fixtureFunction(args, use).catch(reject);
    });
    args = { ...args, [key]: value };
    teardownList.push(teardown);
  }
  return { args, teardownList };
};
