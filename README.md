# css4ify

A simple tool to convert CSS to JSON and JSON to CSS.

- 🌲 Uses [`csstree`](https://github.com/csstree/csstree) to parse CSS
- 🚀 ESM support
- 🤘 TypeScript support
- 🔮 CSS 4 features supported like CSS Nesting and modern pseudoselectors
- 📦 Bundled with [Bun](https://bun.sh)
- 📎 Lightweight

## Usage

```bash
npm install css4ify
```

<details>

<summary>Convert CSS to JSON</summary>

```javascript
import { jsonify } from 'css4ify';

const json = jsonify(`
  .foo {
    color: red;
  }
  .bar {
    color: blue;

    &:hover {
      color: green;
    }
  }
`);
```

It will return:

```json
{
  ".foo": {
    "color": "red"
  },
  ".bar": {
    "color": "blue",
    "&:hover": {
      "color": "green"
    }
  }
}
```

</details>

<details>

<summary>Convert JSON to CSS</summary>

```javascript
import { stringify } from 'css4ify';

const css = stringify({
  ".foo": {
    "color": "red"
  },
  ".bar": {
    "color": "blue",
    "&:hover": {
      "color": "green"
    }
  }
});
```

It will return:

```css
.foo {
  color: red;
}
.bar {
  color: blue;
  &:hover {
    color: green;
  }
}
```

</details>

## Missing features

> This project is in early stages and may not support all CSS features. You can help by opening an issue or a pull request.

> CSS Nesting is NOT supported when there is properties after the nested selector. For example:

```css
/* This will not work */
.foo {
  color: red;
  &:hover {
    color: green;
  }
  background-color: blue;
}
```

To solve it, just move the properties to be before the nested selector:

```css
/* This will work */
.foo {
  color: red;
  background-color: blue;
  &:hover {
    color: green;
  }
}
```

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
