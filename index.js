import * as vitest from "vitest";

// Note: inspired by https://github.com/microsoft/playwright
class TestTypeImpl {
  constructor(fixtures) {
    this.fixtures = fixtures;
    const test = (name, fn) => {
      vitest.it(name, async () => {
        const reduceFixtures = async (fixtureList, args) => {
          if (fixtureList.length === 0) {
            return fn(args);
          } else {
            const [[key, fixture], ...fixtureListRest] = fixtureList;
            const [fixtureValueOrFunction, { scope }] = Array.isArray(fixture)
              ? fixture
              : [fixture, { scope: "test" }];
            const fixtureFunction =
              typeof fixtureValueOrFunction === "function"
                ? fixtureValueOrFunction
                : (_, use) => use(fixtureValueOrFunction);
            switch (scope) {
              case "test":
                return fixtureFunction(args, async (value, teardown) => {
                  const argsAccumulated = { ...args, [key]: value };
                  await reduceFixtures(fixtureListRest, argsAccumulated);
                  if (teardown) await teardown();
                });
              default:
                throw new Error(`Unsupported scope: ${scope}`);
            }
          }
        };
        const fixtureList = Object.entries(this.fixtures);
        const args = {};
        return reduceFixtures(fixtureList, args);
      });
    };
    test.extend = (fixtures) => {
      const fixturesExtended = { ...this.fixtures, ...fixtures };
      return new TestTypeImpl(fixturesExtended).test;
    };
    this.test = test;
  }
}

const rootTestType = new TestTypeImpl({});
const baseTest = rootTestType.test;
export const test = baseTest;
