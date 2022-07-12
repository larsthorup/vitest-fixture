import { describe, expect } from "vitest";
import { test } from "./withServer.js";

describe("example", () => {
  test("server", ({ server }) => {
    expect(server).toEqual({ port: 8000 });
  });
});
