import { test as base } from "./withDb";

/** @typedef {import('../..').KeyValue} KeyValue */

/**
 * @template {KeyValue} T
 * @template {KeyValue} W
 * @template {KeyValue} PT
 * @template {KeyValue} PW
 * @typedef {import('../..').Fixtures<T,W,PT,PW>} Fixtures
 */

/** @typedef {import('./withDb.js').Db } Db */

/** @typedef { { db: Db, port: number } } Server */

export const test = base.extend(
  /** @type { Fixtures<{port: number, server: Server | undefined}, {}, {}, {db: Db}> } */
  ({
    port: 8000,
    server: async ({ db, port }, use) => {
      /** @type { Server | undefined } */
      let server = { db, port };
      await use(server, async () => {
        server = undefined;
      });
    },
  })
);
