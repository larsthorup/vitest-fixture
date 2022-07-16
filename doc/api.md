# `vitest-fixture` API documentation

The API that `vitest-fixture` provides is heavily inspired by the fixture API provided by [Playwright](https://playwright.dev/docs/test-fixtures). This package is basically a stand-alone re-implementation to support fixtures with [Vitest](https://vitest.dev/).

## Overview

You define fixtures using `test.extend`, which returns a `test` that you can use just like your normal Vitest `test` (aka `it`).

## test.extend(fixtures)

- `fixtures` an object containing fixture declarations and optional fixture options, see below for details.
- returns a new `test` object that will provide fixture values to tests declared with it.

Example fixture: `fixture.ts`

```ts
import { test as base } from "vitest-fixture";

export const test = base.extend<{name: string, resource: string}>({
  name: "fixed-value",
  resource: async ({}, use) => {
    const resource = ...; // setup resource
    await use(resource, async () => {
      ...; // teardown resource
    });
  },
});
```

Such a fixture can then be used when writing tests: `sample.test.ts`:

```ts
import { describe } from "vitest";
import { test } from "./fixture.ts";

describe("sample", () => {
  test("with fixtures", async ({name, resource}) => {
    expect(name).toEqual("fixed-value");
    ...; // use resource fixture here
  });
});
```

Such a fixture can also itself be extended further:

```ts
import { test as base } from "./fixture.ts";

type Server = ...;
export const test = base.extend<{server: Server}>({
  name: "fixed-value",
  resource: async ({ name, resource }, use) => {
    const server = ...; // setup server
    await use(server, async () => {
      ...; // teardown server
    });
  },
});
```

### fixture scope

Fixtures are by default scoped to each test, basically corresponding to the `beforeEach` / `afterEach` functions. Here each fixture is invoked right before and after running the test.

However, you can also define fixtures with worker scope, where the fixture is invoked only once before and after running any tests in a given worker.

The scope can be specified explicitly when declaring a fixture, like this:

```ts
import { test as base } from "vitest-fixture";

export const test = base.extend<{}, {resource: string}>({
  resource: [async ({}, use) => {
    const resource = ...; // setup resource
    await use(resource, async () => {
      ...; // teardown resource
    });
  }, { scope: "worker" }],
});
```

## test(title, testFunction)

- `title` of type `string`: Test title
- `testFunction` of type `(fixtureValues) => Promise<void> | void` where `fixtureValues` is of type `{[key: string]: any}`.
- returns `void`

Declares a test. When the test is run, it will be passed a set of all fixture values defined by `test`. Fixture values of `test` scope will have been recreated right before `testFunction` is run.
