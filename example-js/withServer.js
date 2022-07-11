import { test as base } from "../index.js";

/** @typedef {import('../index.js').KeyValue} KeyValue */

/**
 * @template {KeyValue} T
   @template {KeyValue} W
 * @template {KeyValue} PT
   @template {KeyValue} PW
   @typedef {import('../index.js').Fixtures<T,W,PT,PW>} Fixtures
 */

/** @typedef { { port: number } } Server */

export const test = base.extend(
  /** @type { Fixtures<{port: number, server: Server | undefined}, {}, {}, {}> } */
  ({
    port: 8000,
    server: async ({ port }, use) => {
      /** @type { Server | undefined } */
      let server = { port };
      await use(server, async () => {
        server = undefined;
      });
    },
  })
);
