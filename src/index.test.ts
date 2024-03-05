import { expect, test } from 'bun:test'
import { cssify, jsonify } from '.'

function t(input: string, expected: any) {
  const json = jsonify(input.trim())
  expect(json).toEqual(expected)
  const css = cssify(json).trim()
  expect(css).toEqual(input.trim())
}

test('simple css declaration', () => {
  const input = `
body {
  background: red;
  h1 {
    margin: 0;
  }
}
body :not(.container) {
  max-width: 200px;
}
`
  const expected = {
    'body': { background: 'red', h1: { margin: '0' } },
    'body :not(.container)': { 'max-width': '200px' },
  }
  t(input, expected)
})

test('css grid and flexbox properties', () => {
  const input = `
div {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
.flex {
  display: flex;
  justify-content: space-between;
}
`
  const expected = {
    'div': { 'display': 'grid', 'grid-template-columns': 'repeat(3, 1fr)' },
    '.flex': { 'display': 'flex', 'justify-content': 'space-between' },
  }
  t(input, expected)
})

test('css declaration with global keywords', () => {
  const input = `
div {
  display: initial;
}
span {
  color: inherit;
}
ul.list {
  list-style: unset;
}
`

  const expected = {
    'div': { display: 'initial' },
    'span': { color: 'inherit' },
    'ul.list': { 'list-style': 'unset' },
  }
  t(input, expected)
})

test('nested simple css declaration', () => {
  const input = `
body {
  div {
    background: red;
  }
}
`
  const expected = { body: { div: { background: 'red' } } }
  t(input, expected)
})

test('simple css declaration with comma', () => {
  const input = `
body, div {
  background: red;
}
`
  const expected = { 'body, div': { background: 'red' } }
  t(input, expected)
})

test('simple css declaration with media attribute', () => {
  const input = `
@media (max-width: 600px) {
  body {
    background: white;
  }
}
@media (prefers-color-scheme: dark) {
  body {
    background: black;
  }
}`
  const expected = {
    '@media (max-width: 600px)': { body: { background: 'white' } },
    '@media (prefers-color-scheme: dark)': { body: { background: 'black' } },
  }
  t(input, expected)
})

test('With more custom selectors', () => {
  const input = `
body {
  h1+p, h2~h3 {
    aspect-ratio: 1/1;
    content: '';
    max-width: clamp(1rem, 16px, 12em);
  }
}
`
  const expected = { body: { 'h1+p, h2~h3': { 'aspect-ratio': '1/1', 'content': '\'\'', 'max-width': 'clamp(1rem, 16px, 12em)' } } }
  t(input, expected)
})

test('multiple declarations with !important', () => {
  const input = `
p {
  color: red !important;
  font-size: 14px;
}
`
  const expected = { p: { 'color': 'red !important', 'font-size': '14px' } }
  t(input, expected)
})

test('deeply nested css declaration', () => {
  const input = `
body {
  div {
    p {
      span {
        color: blue;
      }
    }
  }
}
`
  const expected = { body: { div: { p: { span: { color: 'blue' } } } } }
  t(input, expected)
})

/**
 * Skipping since csstree walker gives us a Raw node which we can handle only if
 * the nested block is at the end of the block.
 *
 * Supported:
 * .main {
 *    color:red;
 *    .nested {
 *       background: blue;
 * }
 *
 * Not supported:
 * .main {
 *  .nested {
 *    background: blue;
 *  }
 *  color:red;
 * }
 */
test.skip('mixed nested css declaration with normal declaration', () => {
  const input = `
body {
  p {
    span {
      color: blue;
    }
    padding: 10px;
  }
  aspect-ratio: 1 / 1;
  div {
    color: blue;
  }
  background: red;
}`
  const expected = { body: { 'p': { span: { color: 'blue' }, padding: '10px' }, 'aspect-ratio': '1/1', 'div': { color: 'blue' }, 'background': 'red' } }
  t(input, expected)
})

test('css declaration with pseudo-classes and pseudo-elements', () => {
  const input = `
a:hover, a::after {
  color: green;
}
`
  const expected = { 'a:hover, a::after': { color: 'green' } }
  t(input, expected)
})

test('@font-face rule', () => {
  const input = `
@font-face {
  font-family: 'MyFont';
  src: url('font.woff2')format('woff2');
  unicode-range: U+000-5FF;
}`
  const expected = {
    '@font-face': { 'font-family': '\'MyFont\'', 'src': 'url(\'font.woff2\')format(\'woff2\')', 'unicode-range': 'U+000-5FF' },
  }
  t(input, expected)
})

test('@keyframes rule', () => {
  const input = `
@keyframes slide {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}`
  const expected = {
    '@keyframes slide': { from: { opacity: '0' }, to: { opacity: '1' } },
  }
  t(input, expected)
})

test('css declaration with variables', () => {
  const input = `
:root {
  --main-bg-color: brown;
  &:has(.dark) {
    --main-bg-color: pink;
  }
}
body {
  background-color: var(--main-bg-color);
}`
  const expected = {
    ':root': { '--main-bg-color': 'brown', '&:has(.dark)': { '--main-bg-color': 'pink' } },
    'body': { 'background-color': 'var(--main-bg-color)' },
  }
  t(input, expected)
})

test('css declaration with syntax variations', () => {
  const input = `
body {
  background: yellow;
}
p {
  color: black;
}
`
  const expected = { body: { background: 'yellow' }, p: { color: 'black' } }
  t(input, expected)
})

test('css declaration with functions', () => {
  const input = `
div {
  width: calc(100% - 80px);
  background: linear-gradient(to right, red, yellow);
}
`
  const expected = {
    div: {
      width: 'calc(100% - 80px)',
      background: 'linear-gradient(to right, red, yellow)',
    },
  }
  t(input, expected)
})

test('attribute selectors with various operators', () => {
  const input = `
a[target="_blank"] {
  color: blue;
}
a[href^="https"] {
  font-weight: bold;
}
a[href$=".pdf"] {
  font-style: italic;
}
a[href*="example"] {
  text-decoration: underline;
}
`
  const expected = {
    'a[target="_blank"]': { color: 'blue' },
    'a[href^="https"]': { 'font-weight': 'bold' },
    'a[href$=".pdf"]': { 'font-style': 'italic' },
    'a[href*="example"]': { 'text-decoration': 'underline' },
  }
  t(input, expected)
})

test('nested atrules', () => {
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
`
  const expected = {
    '@media screen and (min-width: 900px)': {
      'article': { padding: '1rem 3rem' },
      '@media (prefers-color-scheme: dark)': {
        article: { background: 'black', color: 'white' },
      },
    },
  }
  t(input, expected)
})

test('CSS variables in complex scenarios', () => {
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
  `
  const expected = {
    ':root': { '--main-color': 'black', '--padding': '5px' },
    'body': { color: 'var(--main-color)', padding: 'var(--padding)' },
    '@media (prefers-color-scheme: dark)': {
      ':root': { '--main-color': 'white' },
      'body': { background: 'var(--main-color)' },
    },
  }
  t(input, expected)
})

test('complex selectors including pseudo-classes and attributes', () => {
  const input = `
div:first-child {
  margin-top: 0;
}
a[rel="noopener noreferrer"]:hover {
  color: red;
}
  `
  const expected = {
    'div:first-child': { 'margin-top': '0' },
    'a[rel="noopener noreferrer"]:hover': { color: 'red' },
  }
  t(input, expected)
})

test('CSS declaration with @supports rule', () => {
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
`
  const expected = {
    '@supports (display: grid)': { div: { display: 'grid' } },
    '@supports not (display: grid)': { div: { float: 'left' } },
  }
  t(input, expected)
})
