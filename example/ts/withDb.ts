import { test as base } from "../..";

export type Db = { some: "db" };
export const test = base.extend<{}, { db: Db }>({
  db: [
    async ({}, use) => {
      let db: Db | undefined = { some: "db" };
      await use(db, async () => {
        db = undefined;
      });
    },
    { scope: "worker" },
  ],
});
