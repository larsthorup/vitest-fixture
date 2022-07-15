import { test as base } from "../..";

/** @typedef {import('../..').KeyValue} KeyValue */

/**
 * @template {KeyValue} T
 * @template {KeyValue} W
 * @template {KeyValue} PT
 * @template {KeyValue} PW
 * @typedef {import('../..').Fixtures<T,W,PT,PW>} Fixtures
 */

/** @typedef { { some: string } } Db */

export const test = base.extend(
  /** @type { Fixtures<{}, { db: Db | undefined }, {}, {}> } */
  ({
    db: [
      async (_, use) => {
        /** @type { Db | undefined } */
        let db = { some: "db" };
        await use(db, async () => {
          db = undefined;
        });
      },
      { scope: "worker" },
    ],
  })
);
