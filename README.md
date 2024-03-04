# css4ify

A simple tool to convert CSS to JSON.

- 🌲 Uses [`csstree`](https://github.com/csstree/csstree) to parse CSS
- 🚀 ESM support
- 🤘 TypeScript support
- 🔮 CSS 4 features supported like CSS Nesting and modern pseudoselectors
- 📦 Bundled with [Bun](https://bun.sh)
- 📎 Lightweight

## Usage

```bash
npm install cssify
```

```javascript
import { cssify } from 'cssify';

cssify(`
  .foo {
    color: red;
  }
  .bar {
    color: blue;
  }
`);
```

## Missing features

Do you need a feature that is not implemented? Please open an issue or a pull request.

## Development

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run src/index.ts
```

This project was created using `bun init` in bun v1.0.20. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
