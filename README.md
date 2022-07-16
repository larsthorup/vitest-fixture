# vitest-fixture

[![npm](https://img.shields.io/npm/v/vitest-fixture)](https://www.npmjs.com/package/vitest-fixture)
[![npm](https://img.shields.io/npm/l/vitest-fixture)](https://www.npmjs.com/package/vitest-fixture)

Reusable fixtures for your Vitest tests

## Getting started

```bash
npm install --save-dev vitest-fixture vitest
```

Create `vitest.config.js`:

```js
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    deps: {
      inline: ["vitest-fixture"],
    },
  },
});
```

## Documentation

The concept of test fixtures provides a way to build reusable and composable setup and teardown code for your tests, and thereby helps you remove much of otherwise duplicated `before` / `after` boilerplate code.

- See [example usage](https://github.com/larsthorup/vitest-fixture/blob/main/example/ts/example.test.ts) where the `server` fixture is passed into the test.
- See the sample [`server` fixture](https://github.com/larsthorup/vitest-fixture/blob/main/example/ts/withServer.ts) which is itself defined on top of a [`db` fixture](https://github.com/larsthorup/vitest-fixture/blob/main/example/ts/withDb.ts).
- [API documentation](https://github.com/larsthorup/vitest-fixture/blob/main/doc/api.md)

## Develop

```bash
npm install
npm test
```

## Publish

```
npm version minor
npm publish
git push
```

## Credits

Thanks to the [Playwright](https://playwright.dev/docs/test-fixtures) team for the inspiration for the fixture API.
