# vitest-fixture

Reusable fixtures for your Vitest tests

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

See [example usage](./example/ts/example.test.ts)

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
