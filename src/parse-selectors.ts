import type { Selector } from 'lightningcss'

export function parseSelector(selector: Selector): string {
  return selector.map((s) => {
    if (!('type' in s))
      return ''
    switch (s.type) {
      case 'class':
        return `.${s.name}`
      case 'id':
        return `#${s.name}`
      default:
        return ''
    }
  }).join('')
}
