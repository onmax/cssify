import type { PropertyId } from 'lightningcss'

export type CSSProperty = PropertyId['property']
export type CSSValue = string
export interface CssRule { [key: CSSProperty]: CSSValue | CssRule }
export interface CssJson { [key: string]: CssRule }
