import type { CSSRule } from './types'

export interface CssifyOptions {
  /**
   * The string to use for indentation
   * @default '  ' (two spaces)
   */
  indent?: string
}

export function cssify(json: CSSRule, options: CssifyOptions = {}): string {
  const { indent = '  ' } = options
  function processRule(rule: CSSRule | string, carryIndent: string = ''): string {
    // console.log(JSON.stringify(rule, null, 2))
    if (typeof rule === 'string')
      return `${carryIndent}${rule}\n`

    let result = ''

    for (const [selector, block] of Object.entries(rule)) {
      // console.log(JSON.stringify({ selector, block, indent, carryIndent }, null, 2))
      if (typeof block === 'object') {
        if (typeof block[selector] === 'string') {
          result += `${carryIndent}${selector} {\n`
          result += `${carryIndent}${indent}${block[selector]};\n`
          result += `${carryIndent}}\n`
        }
        else {
          result += `${carryIndent}${selector} {\n`
          result += processRule(block as CSSRule, carryIndent + indent)
          result += `${carryIndent}}\n`
        }
      }
      else {
        result += `${carryIndent}${selector}: ${block};\n`
      }
    }

    return result
  }

  return processRule(json)
}
