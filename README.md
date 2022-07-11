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

See [example usage](./example/example.test.js)

## Develop

```bash
npm install
npm test
```

## Publish

```
npm version minor
npm publish
git commit -m "release"
git push
```
