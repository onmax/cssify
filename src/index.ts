import type { CustomAtRules, Visitor } from 'lightningcss'
import type { CssJson } from './types'
import { Buffer } from 'node:buffer'
import { transform } from 'lightningcss'
import { parseDeclaration } from './declaration-to-string'
import { parseSelector } from './parse-selectors'

export function cssToJson(cssString: string): CssJson {
  const result: CssJson = {}

  const visitor: Visitor<CustomAtRules> = {
    Rule: {
      style(rule) {
        // Build an object of declarations for this rule.
        const declarations: Record<string, string> = {}
        rule.value.declarations.declarations.forEach((decl) => {
          const [property, value] = parseDeclaration(decl)
          declarations[property] = value
        })
        const selector = rule.value.selectors.map(parseSelector).join(', ')
        result[selector] = { ...(result[selector] || {}), ...declarations }
        return rule
      },
    },
  }

  transform({
    filename: 'style.css',
    code: Buffer.from(cssString),
    minify: false,
    visitor,
  })

  return result
}
