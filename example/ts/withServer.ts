import { Db, test as base } from "./withDb";

type Server = { db: Db; port: number };

export const test = base.extend<{ port: number; server: Server | undefined }>({
  port: 8000,
  server: async ({ db, port }, use) => {
    let server: Server | undefined = { db, port };
    await use(server, async () => {
      server = undefined;
    });
  },
});
