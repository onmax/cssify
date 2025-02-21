import type { CalcFor_DimensionPercentageFor_LengthValue, CssColor, Declaration, DimensionPercentageFor_LengthValue, LengthValue, MathFunctionFor_DimensionPercentageFor_LengthValue } from 'lightningcss'
import type { CSSProperty, CSSValue } from './types'

export function parseDeclaration(decl: Declaration): [CSSProperty, CSSValue] {
  const prefix = 'vendorPrefix' in decl ? decl.vendorPrefix : ''
  const parsedProperty = 'property' in decl ? decl.property : 'unknown'
  const property: CSSProperty = `${prefix}${parsedProperty}`

  if (!('value' in decl))
    return [property, 'unable-to-parse']

  if (typeof decl.value === 'string')
    return [property, decl.value]

  if (typeof decl.value === 'number')
    return [property, decl.value.toString()]

  if (Array.isArray(decl.value))
    return [property, decl.value.join(' ')]

  if (typeof decl.value === 'object' && decl.value && 'type' in decl.value) {
    switch (decl.value.type) {
      case 'integer':
        return [property, decl.value.value.toString()]
      case 'a98-rgb':
      case 'currentcolor':
      case 'display-p3':
      case 'hsl':
      case 'hwb':
      case 'lab':
      case 'lch':
      case 'oklab':
      case 'oklch':
      case 'prophoto-rgb':
      case 'light-dark':
      case 'rec2020':
      case 'rgb':
      case 'srgb':
      case 'xyz-d50':
      case 'xyz-d65':
        return [property, handleCssColor(decl.value)]
      case 'color':
        return [property, handleCssColor(decl.value.value)]
      case 'absolute': {
        return [property, decl.value.type]
      }
      case 'area': {
        return [property, decl.value.name]
      }
      case 'areas': {
        return [property, decl.value.areas.join(' ') || `${decl.value.columns}`]
      }
      case 'auto': {
        return [property, decl.value.type]
      }
      case 'baseline-position': {
        if (!('value' in decl.value))
          return [property, decl.value]
        return [property, 'TODO']
      }
      case 'length': {
        const lengthVal = decl.value.value
        if ('unit' in lengthVal && 'value' in lengthVal) {
          return [property, `${lengthVal.value}${lengthVal.unit}`]
        }
        break
      }
      case 'keyword': {
        const keywordValue = 'value' in decl.value ? decl.value.value : null
        if (keywordValue !== null) {
          return [property, String(keywordValue)]
        }
        break
      }

      case 'context-fill':
        return [property, 'context-fill']
      case 'context-stroke':
        return [property, 'context-stroke']

      // Some extra dimension / position / or single-keyword values
      case 'percentage':
        return [property, `${decl.value.value}%`]
      case 'dimension': {
        const dimensionVal = decl.value.value
        if (
          dimensionVal
          && typeof dimensionVal.value === 'number'
          && typeof dimensionVal.unit === 'string'
        ) {
          return [property, `${dimensionVal.value}${dimensionVal.unit}`]
        }
        return [property, 'unable-to-parse-dimension']
      }
      case 'length-percentage':
        return [property, handleDimensionPercentageFor_LengthValue(decl.value.value)]
      case 'line':
        // Possibly a line-based value
        return [property, 'line']
      case 'span':
        // Possibly used in grid
        return [property, 'span']

      // Position or special layout keywords
      case 'left':
      case 'right':
      case 'static':
      case 'relative':
      case 'sticky':
      case 'fixed':
        return [property, decl.value.type]

      // Additional textual keywords
      case 'none':
      case 'normal':
      case 'medium':
      case 'thick':
      case 'thin':
      case 'bolder':
      case 'italic':
      case 'oblique':
      case 'stretch':
        return [property, decl.value.type]

      // Additional function-like or container-like
      case 'fit-content':
      case 'fit-content-function':
      case 'from-font':
      case 'shape':
      case 'values':
        return [property, decl.value.type]

      // Gradients, image-set, etc.
      case 'gradient':
        return [property, 'gradient(...)']
      case 'image-set':
        return [property, 'image-set(...)']
      case 'filters':
        return [property, 'filters(...)']
      case 'track-list':
        return [property, 'track-list(...)']

      // Content distribution/position
      case 'content-distribution':
      case 'content-position':
      case 'self-position':
      case 'line-style':
      case 'legacy':
      case 'pair':
      case 'box':
      case 'names':
        // Just placeholders for any complex structure
        return [property, decl.value.type]

      // Summation, calc, product, function, etc. if not covered:
      case 'calc': {
        return [property, `calc(${JSON.stringify(decl.value.value)})`]
      }
      default:
        // Fallback for anything not explicitly handled
        return [property, JSON.stringify(decl.value)]
    }
  }

  return [property, 'unable-to-parse']
}

function handleDimensionPercentageFor_LengthValue(decl: DimensionPercentageFor_LengthValue): string {
  if (decl.type === 'dimension')
    return handleLengthValue(decl.value)
  if (decl.type === 'percentage')
    return `${decl.value}%`
  if (decl.type === 'calc')
    return handleCalcFor_DimensionPercentageFor_LengthValue(decl.value)
  return decl
}

function handleLengthValue({ unit, value }: LengthValue): string {
  return `${value}${unit}`
}
function handleCalcFor_DimensionPercentageFor_LengthValue(decl: CalcFor_DimensionPercentageFor_LengthValue): string {
  if (decl.type === 'value')
    return handleDimensionPercentageFor_LengthValue(decl.value)
  if (decl.type === 'number')
    return `${decl.value}`
  if (decl.type === 'function')
    return handleMathFunctionFor_DimensionPercentageFor_LengthValue(decl.value)
  if (decl.type === 'product')
    return `${decl.value[0]} * ${handleCalcFor_DimensionPercentageFor_LengthValue(decl.value[1])}`
  if (decl.type === 'sum')
    return `sum(${decl.value})`
  return decl
}

function handleMathFunctionFor_DimensionPercentageFor_LengthValue(decl: MathFunctionFor_DimensionPercentageFor_LengthValue): string {
  if (decl.type === 'abs')
    return `abs(${decl.value})`
  if (decl.type === 'min')
    return `min(${decl.value})`
  if (decl.type === 'max')
    return `max(${decl.value})`
  if (decl.type === 'clamp')
    return `clamp(${decl.value})`
  if (decl.type === 'calc')
    return handleCalcFor_DimensionPercentageFor_LengthValue(decl.value)
  if (decl.type === 'hypot')
    return `hypot(${decl.value})`
  if (decl.type === 'mod')
    return `mod(${decl.value})`
  if (decl.type === 'rem')
    return `rem(${decl.value})`
  if (decl.type === 'round')
    return `round(${decl.value})`
  if (decl.type === 'sign')
    return `sign(${decl.value})`
  return decl
}

function handleCssColor(decl: CssColor): string {
  if (typeof decl === 'string')
    return decl
  switch (decl.type) {
    case 'a98-rgb': return `a98-rgb(${decl.r} ${decl.g} ${decl.b})`
    case 'currentcolor': return 'currentcolor'
    case 'display-p3': return `display-p3-rgb(${decl.r} ${decl.g} ${decl.b})`
    case 'hsl': return `hsl(${decl.h} ${decl.s}% ${decl.l}%)`
    case 'hwb': return `hwb(${decl.h} ${decl.w}% ${decl.b}%)`
    case 'lab': return `lab(${decl.l} ${decl.a} ${decl.b})`
    case 'lch': return `lch(${decl.l} ${decl.c} ${decl.h})`
    case 'light-dark': return `light-dark(${handleCssColor(decl.light)} ${handleCssColor(decl.dark)})`
    case 'oklab': return `oklab(${decl.l} ${decl.a} ${decl.b})`
    case 'oklch': return `oklch(${decl.l} ${decl.c} ${decl.h})`
    case 'prophoto-rgb': return `prophoto-rgb(${decl.r} ${decl.g} ${decl.b})`
    case 'rec2020': return `rec2020-rgb(${decl.r} ${decl.g} ${decl.b})`
    case 'rgb': return `rgb(${decl.r} ${decl.g} ${decl.b})`
    case 'srgb': return `srgb-rgb(${decl.r} ${decl.g} ${decl.b})`
    case 'srgb-linear': return `srgb-linear-rgb(${decl.r} ${decl.g} ${decl.b})`
    case 'xyz-d50': return `xyz-d50(${decl.x} ${decl.y} ${decl.z})`
    case 'xyz-d65': return `xyz-d65(${decl.x} ${decl.y} ${decl.z})`
    default:
      throw new Error(`Unknown color type: ${JSON.stringify(decl)}`)
  }
}
