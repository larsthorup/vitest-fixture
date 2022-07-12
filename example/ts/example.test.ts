import { describe, expect } from "vitest";
import { test } from "./withServer";

describe("example", () => {
  test("server", ({ server }) => {
    expect(server).toEqual({ db: { some: "db" }, port: 8000 });
  });
});
