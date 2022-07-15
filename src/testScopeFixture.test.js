import { describe, expect, it, vi } from "vitest";
import { applyWithFixtures } from "./testScopeFixture.js";

/** @typedef {import('..').KeyValue} KeyValue */

/**
 * @template {KeyValue} T
 * @template {KeyValue} W
 * @template {KeyValue} PT
 * @template {KeyValue} PW
 * @typedef {import('..').Fixtures<T, W, PT, PW>} Fixtures
 */

describe("fixture", () => {
  describe("applyWithFixtures", () => {
    const mockFn = () => vi.fn().mockResolvedValue(undefined);
    describe("when no fixtures", () => {
      it("should apply with no fixtures", async () => {
        const fn = mockFn();
        await applyWithFixtures(fn, {});
        expect(fn).toHaveBeenCalledWith({});
      });
    });

    describe("when fixture is constant value", () => {
      it("should apply with that constant value", async () => {
        const fn = mockFn();
        await applyWithFixtures(
          fn,
          /** @type { Fixtures<{port: number}, {}, {}, {}> } */
          ({
            port: 3000,
          })
        );
        expect(fn).toHaveBeenCalledWith({ port: 3000 });
      });
    });

    describe("when fixture has explicit test scope", () => {
      it("should apply with that constant value", async () => {
        const fn = mockFn();
        await applyWithFixtures(
          fn,
          /** @type { Fixtures<{port: number}, {}, {}, {}> } */
          ({
            port: [3000, { scope: "test" }],
          })
        );
        expect(fn).toHaveBeenCalledWith({ port: 3000 });
      });
    });

    describe("when fixture is a function", () => {
      it("should apply with the value produced by the function", async () => {
        const fn = mockFn();
        await applyWithFixtures(
          fn,
          /** @type { Fixtures<{server: { port: number }}, {}, {}, {}> } */
          ({
            server: async (_, use) => {
              use({ port: 3000 });
            },
          })
        );
        expect(fn).toHaveBeenCalledWith({ server: { port: 3000 } });
      });
    });

    describe("when there are multiple fixtures", () => {
      it("should apply later fixtures with the values produced by earlier fixtures", async () => {
        const fn = mockFn();
        await applyWithFixtures(
          fn,
          /** @type { Fixtures<{port: number, server: { port: number }}, {}, {}, {}> } */
          ({
            port: 3000,
            server: async ({ port }, use) => {
              use({ port });
            },
          })
        );
        expect(fn).toHaveBeenCalledWith({ port: 3000, server: { port: 3000 } });
      });
    });

    describe("when a fixture includes a teardown function", () => {
      it("should apply teardown", async () => {
        const fn = mockFn();
        const teardown = mockFn();
        await applyWithFixtures(
          fn,
          /** @type { Fixtures<{server: { port: number }}, {}, {}, {}> } */
          ({
            server: async (_, use) => {
              use({ port: 3000 }, teardown);
            },
          })
        );
        expect(fn).toHaveBeenCalledWith({ server: { port: 3000 } });
        expect(teardown).toHaveBeenCalledWith();
      });
    });
  });
});
