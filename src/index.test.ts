import { test, expect } from "bun:test";
import { cssify } from ".";

test("simple css declaration", () => {
  const input = `
    body { background: red; h1 { margin: 0 } }
    body :not(.container) { max-width: 200px; }
  `;
  const expected = {
    body: { background: 'red', h1: { margin: '0' } }, 'body :not(.container)': { 'max-width': '200px' }
  }
  expect(cssify(input)).toEqual(expected);
})

test("css grid and flexbox properties", () => {
  const input = `div { display: grid; grid-template-columns: repeat(3, 1fr); } .flex { display: flex; justify-content: space-between; }`;
  const expected = {
    'div': { 'display': 'grid', 'grid-template-columns': 'repeat(3, 1fr)' },
    '.flex': { 'display': 'flex', 'justify-content': 'space-between' }
  }
  expect(cssify(input)).toEqual(expected);
});

test("css declaration with global keywords", () => {
  const input = `div { display: initial; } span { color: inherit; } ul.list { list-style: unset; }`;
  const expected = {
    'div': { 'display': 'initial' },
    'span': { 'color': 'inherit' },
    'ul.list': { 'list-style': 'unset' }
  }
  expect(cssify(input)).toEqual(expected);
});

test("nested simple css declaration", () => {
  const input = ` body { div { background: red; } } `;
  const expected = { body: { div: { background: 'red' } } }
  expect(cssify(input)).toEqual(expected);
})

test("simple css declaration with comma", () => {
  const input = ` body, div { background: red; } `;
  const expected = { "body, div": { background: 'red' } }
  expect(cssify(input)).toEqual(expected);
})

test("simple css declaration with media attribute", () => {
  const input = ` @media (max-width: 600px) { body { background: white; } } @media(prefers-color-scheme: dark) { body { background: black; } }`;
  const expected = {
    '@media (max-width: 600px)': { body: { background: 'white' } },
    '@media (prefers-color-scheme: dark)': { body: { background: 'black' } }
  }
  expect(cssify(input)).toEqual(expected);
})

test("With more custom selectors", () => {
  const input = `body { h1 + p, h2 ~ h3 { aspect-ratio: 1 / 1; content: ''; max-width: clamp(1rem, 16px, 12em)}}`
  const expected = { body: { 'h1+p, h2~h3': { 'aspect-ratio': '1/1', 'content': "''", 'max-width': 'clamp(1rem, 16px, 12em)' } } }
  expect(cssify(input)).toEqual(expected)
})

test("multiple declarations with !important", () => {
  const input = `p { color: red !important; font-size: 14px; }`;
  const expected = { 'p': { 'color': 'red !important', 'font-size': '14px' } }
  expect(cssify(input)).toEqual(expected);
});

test("deeply nested css declaration", () => {
  const input = `body { div { p { span { color: blue; } } } }`;
  const expected = { body: { div: { p: { span: { color: 'blue' } } } } }
  expect(cssify(input)).toEqual(expected);
});

test("css declaration with pseudo-classes and pseudo-elements", () => {
  const input = `a:hover, a::after { color: green; }`;
  const expected = { 'a:hover, a::after': { color: 'green' } }
  expect(cssify(input)).toEqual(expected);
});

test("@font-face rule", () => {
  const input = `@font-face { font-family: 'MyFont'; src: url('font.woff2') format('woff2'); unicode-range: U+000-5FF; }`;
  const expected = {
    '@font-face': { 'font-family': "'MyFont'", 'src': "url('font.woff2')format('woff2')", 'unicode-range': 'U+000-5FF' }
  }
  expect(cssify(input)).toEqual(expected);
});

test("@keyframes rule", () => {
  const input = `@keyframes slide { from { opacity: 0; } to { opacity: 1; } }`;
  const expected = {
    '@keyframes slide': { 'from': { opacity: '0' }, 'to': { opacity: '1' } }
  }
  expect(cssify(input)).toEqual(expected);
});

test("css declaration with variables", () => {
  const input = `:root { --main-bg-color: brown; &:has(.dark) { --main-bg-color: pink;} } body { background-color: var(--main-bg-color); }`;
  const expected = {
    ':root': { '--main-bg-color': 'brown', '&:has(.dark)': { '--main-bg-color': 'pink' } },
    'body': { 'background-color': 'var(--main-bg-color)' }
  }
  expect(cssify(input)).toEqual(expected);
});

test("css declaration with syntax variations", () => {
  const input = `body {background:yellow} p{color:black}`;
  const expected = { body: { background: 'yellow' }, p: { color: 'black' } }
  expect(cssify(input)).toEqual(expected);
});

test("css declaration with functions", () => {
  const input = `div { width: calc(100% - 80px); background: linear-gradient(to right, red, yellow); }`;
  const expected = {
    'div': {
      width: 'calc(100% - 80px)',
      background: 'linear-gradient(to right, red, yellow)'
    }
  }
  expect(cssify(input)).toEqual(expected);
});

test("attribute selectors with various operators", () => {
  const input = `
    a[target="_blank"] { color: blue; }
    a[href^="https"] { font-weight: bold; }
    a[href$=".pdf"] { font-style: italic; }
    a[href*="example"] { text-decoration: underline; }
  `;
  const expected = {
    'a[target="_blank"]': { 'color': 'blue' },
    'a[href^="https"]': { 'font-weight': 'bold' },
    'a[href$=".pdf"]': { 'font-style': 'italic' },
    'a[href*="example"]': { 'text-decoration': 'underline' }
  };
  expect(cssify(input)).toEqual(expected);
});

test("nested atrules", () => {
  const input = `
    @media screen and (min-width: 900px) {
      article {
        padding: 1rem 3rem;
      }
      @media (prefers-color-scheme: dark) {
        article {
          background: black;
          color: white;
        }
      }
    }
  `;
  const expected = {
    '@media screen and (min-width: 900px)': {
      'article': { 'padding': '1rem 3rem' },
      '@media (prefers-color-scheme: dark)': {
        'article': { 'background': 'black', 'color': 'white' }
      }
    }
  };
  expect(cssify(input)).toEqual(expected);
});

test("CSS variables in complex scenarios", () => {
  const input = `
    :root {
      --main-color: black;
      --padding: 5px;
    }
    body {
      color: var(--main-color);
      padding: var(--padding);
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --main-color: white;
      }
      body {
        background: var(--main-color);
      }
    }
  `;
  const expected = {
    ':root': { '--main-color': 'black', '--padding': '5px' },
    'body': { 'color': 'var(--main-color)', 'padding': 'var(--padding)' },
    '@media (prefers-color-scheme: dark)': {
      ':root': { '--main-color': 'white' },
      'body': { 'background': 'var(--main-color)' }
    }
  };
  expect(cssify(input)).toEqual(expected);
});

test("complex selectors including pseudo-classes and attributes", () => {
  const input = `
    div:first-child { margin-top: 0; }
    a[rel="noopener noreferrer"]:hover { color: red; }
  `;
  const expected = {
    'div:first-child': { 'margin-top': '0' },
    'a[rel="noopener noreferrer"]:hover': { 'color': 'red' }
  };
  expect(cssify(input)).toEqual(expected);
});

test("CSS declaration with @supports rule", () => {
  const input = `
    @supports (display: grid) {
      div {
        display: grid;
      }
    }
    @supports not (display: grid) {
      div {
        float: left;
      }
    }
  `;
  const expected = {
    '@supports (display: grid)': { 'div': { 'display': 'grid' } },
    '@supports not (display: grid)': { 'div': { 'float': 'left' } }
  };
  expect(cssify(input)).toEqual(expected);
});
