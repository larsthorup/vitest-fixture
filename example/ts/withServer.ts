import { test as base } from "../..";

type Server = { port: number };

export const test = base.extend<{ port: number; server: Server | undefined }>({
  port: 8000,
  server: async ({ port }, use) => {
    let server: Server | undefined = { port };
    await use(server, async () => {
      server = undefined;
    });
  },
});
