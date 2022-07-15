import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearWorkerFixtureRegistry,
  getWorkerFixtureRegistry,
  workerHook,
} from "./workerFixtureRegistry.js";

/** @typedef {import('..').KeyValue} KeyValue */

/**
 * @template {KeyValue} T
 * @template {KeyValue} W
 * @template {KeyValue} PT
 * @template {KeyValue} PW
 * @typedef {import('..').Fixtures<T, W, PT, PW>} Fixtures
 */

describe("workerFixtureRegistry", () => {
  beforeEach(() => {
    clearWorkerFixtureRegistry();
  });

  describe("workerHook", () => {
    describe("when no worker scoped fixtures", () => {
      beforeEach(() => {
        getWorkerFixtureRegistry().allTests.push({});
      });

      it("should cache no fixture values", async () => {
        await workerHook();
        expect(getWorkerFixtureRegistry().valueCache).toEqual({});
      });
    });

    describe("when a single worker scoped fixture", () => {
      beforeEach(() => {
        getWorkerFixtureRegistry().allTests.push(
          /** @type { Fixtures<{}, {db: {some: string}}, {}, {}> } */
          ({
            db: [
              async (_, use) => {
                use({ some: "db" });
              },
              { scope: "worker" },
            ],
          })
        );
      });

      it("should cache the value instantiated by that fixture", async () => {
        await workerHook();
        expect(getWorkerFixtureRegistry().valueCache).toEqual({
          db: { some: "db" },
        });
      });
    });

    describe("when a worker scoped fixture has teardown", () => {
      let fixtureTeardown = vi.fn().mockResolvedValue(undefined);
      beforeEach(() => {
        getWorkerFixtureRegistry().allTests.push(
          /** @type { Fixtures<{}, {db: {some: string}}, {}, {}> } */
          ({
            db: [
              async (_, use) => {
                use({ some: "db" }, fixtureTeardown);
              },
              { scope: "worker" },
            ],
          })
        );
      });

      it("should cache the value instantiated by that fixture", async () => {
        const teardown = await workerHook();
        expect(getWorkerFixtureRegistry().valueCache).toEqual({
          db: { some: "db" },
        });
        expect(fixtureTeardown).not.toHaveBeenCalled();
        await teardown();
        expect(fixtureTeardown).toHaveBeenCalledWith();
      });
    });

    describe("when multiple worker scoped fixtures", () => {
      beforeEach(() => {
        getWorkerFixtureRegistry().allTests.push(
          /** @type { Fixtures<{}, {name: string, db: {some: string}}, {}, {}> } */
          ({
            name: ["test", { scope: "worker" }],
            db: [
              async ({ name }, use) => {
                use({ some: name });
              },
              { scope: "worker" },
            ],
          })
        );
      });

      it("should pass value instantiated by earlier fixtures to later fixtures", async () => {
        await workerHook();
        expect(getWorkerFixtureRegistry().valueCache).toEqual({
          name: "test",
          db: { some: "test" },
        });
      });
    });

    describe("when worker scoped fixture after test scoped fixture", () => {
      beforeEach(() => {
        getWorkerFixtureRegistry().allTests.push(
          /** @type { Fixtures<{now: string}, {db: {some: string}}, {}, {}> } */
          ({
            now: ["2022-07-15T13:00:00.000Z", { scope: "test" }],
            db: [
              async (_, use) => {
                use({ some: "db" });
              },
              { scope: "worker" },
            ],
          })
        );
      });

      it("should pass undefined as the value of test scoped fixture", async () => {
        await workerHook();
        expect(getWorkerFixtureRegistry().valueCache).toEqual({
          now: undefined,
          db: { some: "db" },
        });
      });
    });
  });
});
