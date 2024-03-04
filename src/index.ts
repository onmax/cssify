import { parse } from 'css-tree'
import type { SelectorList, PseudoClassSelector, Block, Rule, Atrule, MediaQueryList, MediaQuery, StyleSheet, List, CssNode } from 'css-tree'

export type CSSRule = {
  [key: string]: string | CSSRule
}

const notImplemented = (node: CssNode, src: string) => console.warn(`Node.type ${node.type} in ${src} has not been implemented yet. PR Welcome!`)

function walkChildren(children: List<CssNode>) {
  let v: string = '';
  let lastType: string = '';
  for (const child of children) {
    let spaceBefore = '';
    let spaceAfter = '';

    // Determine when to add spaces
    if (child.type === 'Identifier' || child.type === 'Dimension' || child.type === 'Number' || child.type === 'Percentage' || child.type === 'String') {
      if (lastType === 'Identifier' || lastType === 'Dimension' || lastType === 'Number' || lastType === 'Percentage') {
        spaceBefore = ' ';
      }
    }

    if (child.type === 'Operator' && child.value === ',') {
      spaceAfter = ' ';
    }

    v += spaceBefore;

    if (child.type === 'Dimension') {
      v += `${child.value}${child.unit}`
    } else if (child.type === 'Function') {
      v += `${child.name}(${walkChildren(child.children)})`
    } else if (child.type === 'Value') {
      v += walkChildren(child.children);
    } else if (child.type === 'Number') {
      v += child.value
    } else if (child.type === 'String') {
      v += `'${child.value}'`
    } else if (child.type === 'Percentage') {
      v += `${child.value}%`
    } else if (child.type === 'Operator') {
      v += child.value
    } else if (child.type === 'Selector') {
      v += walkChildren(child.children);
    } else if (child.type === 'SelectorList') {
      v += walkSelectorList(child)
    } else if (child.type === 'TypeSelector' || child.type === 'Combinator' || child.type === 'Identifier') {
      v += child.name
    } else if (child.type === 'IdSelector') {
      v += `#${child.name}`
    } else if (child.type === 'ClassSelector') {
      v += `.${child.name}`
    } else if (child.type === 'PseudoClassSelector') {
      v += walkPseudoClassSelector(child)
    } else if (child.type === 'AttributeSelector') {
      v += `[${child.name.name}${child.matcher}${child.value?.type === 'String' ? `"${child.value.value}"` : ''}]`
    } else if (child.type === 'PseudoElementSelector') {
      v += `::${child.name}`
    } else if (child.type === 'Declaration') {
      v += `${child.property}: ${child.value.type === 'Value' ? walkChildren(child.value.children) : cssify(child.value.value)}${child.important ? '!important' : ''}`
    } else if (child.type === 'Url') {
      v += `url('${child.value}')`
    } else if (child.type === 'UnicodeRange') {
      v += `${child.value}`
      // @ts-ignore
    } else if (child.type === 'NestingSelector') {
      v += '&'
    } else if (child.type === 'WhiteSpace') {
      v += ' '
    } else if (child.type === 'Parentheses') {
      v += `(${walkChildren(child.children)})`
    } else if (child.type === 'Raw') {
      return cssify(child.value)
    } else {
      notImplemented(child, 'walkChildren')
    }

    v += spaceAfter;
    lastType = child.type;
  }
  return v
}

function walkPseudoClassSelector(node: PseudoClassSelector) {
  const pseudoSelector = `:${node.name}`
  if (!node.children)
    return pseudoSelector
  return `${pseudoSelector}(${walkChildren(node.children)})`
}


function walkSelectorList(node: SelectorList) {
  let selector: string[] = []
  for (const child of node.children) {
    if (child.type === 'Selector') {
      selector.push(walkChildren(child.children) as string)
    } else if (child.type === 'MediaQueryList') {
      for (const media of child.children) {
        if (media.type === 'MediaQuery') {
          selector.push(walkMediaQuery(media))
        }
      }
    }
  }
  return selector.join(', ')
}

function walkBlock(node: Block) {
  const block: CSSRule = {}
  for (const child of node.children) {
    if (child.type === 'Declaration') {
      const suffix = child.important ? ' !important' : ''
      if (child.value.type === 'Value') {
        block[child.property] = `${walkChildren(child.value.children)}${suffix}`
      } else if (child.value.type === 'Raw') {
        block[child.property] = child.value.value.trim()
      }
    } else if (child.type === 'Raw') {
      return _cssify(child.value, block)
    } else if (child.type === 'Rule') {
      walkRule(block, child)
    } else if (child.type === 'Atrule') {
      walkAtrule(block, child)
    } else {
      notImplemented(child, 'walkBlock')
    }
  }
  return block
}

function walkRule(rules: CSSRule, node: Rule) {
  const { prelude, block } = node
  let selector = ''
  if (prelude.type === "SelectorList") {
    selector = walkSelectorList(prelude)
  } else {
    notImplemented(prelude, 'walkRule')
  }
  rules[selector] = walkBlock(block)
}

function walkMediaQuery(node: MediaQuery) {
  let selector = ''
  for (const child of node.children) {
    if (child.type === 'MediaFeature') {
      if (child.value?.type === 'Identifier') {
        selector += `(${child.name}: ${child.value.name})`
      } else if (child.value?.type === 'Dimension') {
        selector += `(${child.name}: ${child.value.value}${child.value.unit})`
      } else {
        notImplemented(child, 'walkMediaQuery/MediaFeature')
      }
    } else if (child.type === 'Identifier') {
      selector += `${child.name} `
    } else {
      notImplemented(child, 'walkMediaQuery')
    }
  }
  return selector
}

function walkMediaQueryList(node: MediaQueryList) {
  let selector = ''
  for (const child of node.children) {
    if (child.type === 'MediaQuery') {
      selector = walkMediaQuery(child)
    } else {
      notImplemented(child, 'walkMediaQueryList')
    }
  }
  return selector
}

function walkAtrule(rules: CSSRule, node: Atrule) {
  const { prelude, block } = node
  let selector = `@${node.name}`
  if (prelude?.type === "AtrulePrelude") {
    for (const child of prelude.children) {
      if (child.type === 'MediaQueryList') {
        selector += ` ${walkMediaQueryList(child)}`
      } else if (child.type === 'Identifier') {
        selector += ` ${child.name}`
      } else if (child.type === 'Parentheses') {
        selector += ` (${walkChildren(child.children)})`
      } else {
        notImplemented(child, 'walkAtRule')
      }
    }
  } else {
    selector = `@${node.name}`
  }
  rules[selector] = block ? walkBlock(block) : ''
}

function walkStylesheet(rules: CSSRule, node: StyleSheet) {
  for (const child of node.children) {
    if (child.type === 'Rule') {
      walkRule(rules, child)
    } else if (child.type === 'Atrule') {
      walkAtrule(rules, child)
    } else {
      notImplemented(child, 'walkStylesheet')
    }
  }
}

function _cssify(content: string, rules: CSSRule = {}): CSSRule {
  const ast = parse(content)
  if (ast.type === 'StyleSheet')
    walkStylesheet(rules, ast)
  return rules
}

export function cssify(content: string): CSSRule {
  return _cssify(content)
}
