import type { CurrentColor, Declaration, LABColor, PredefinedColor, RGBColor } from 'lightningcss'
import { describe, expect, it } from 'vitest'
import { parseDeclaration } from '../src/declaration-to-string'

describe('declarationToString', () => {
  it('handles missing value property', () => {
    const decl = {} as Declaration
    expect(parseDeclaration(decl)).toEqual(['unknown', 'unable-to-parse'])
  })

  it('handles number value', () => {
    const decl: Declaration = { property: 'z-index', value: { type: 'integer', value: 999 } }
    expect(parseDeclaration(decl)).toEqual(['z-index', '999'])
  })

  it('handles array value', () => {
    const decl: Declaration = { property: 'font-family', value: ['Arial', 'sans-serif'] }
    expect(parseDeclaration(decl)).toEqual(['font-family', 'Arial sans-serif'])
  })

  it('handles length value', () => {
    const decl: Declaration = {
      property: 'width',
      value: { type: 'length-percentage', value: { type: 'dimension', value: { unit: 'px', value: 100 } } },
    }
    expect(parseDeclaration(decl)).toEqual(['width', '100px'])
  })

  it('handles keyword value', () => {
    const decl: Declaration = {
      property: 'display',
      value: { type: 'keyword', value: 'contents' },
    }
    expect(parseDeclaration(decl)).toEqual(['display', 'contents'])
  })

  it('handles colors', () => {
    const rgb: RGBColor = { type: 'rgb', r: 255, g: 0, b: 0, alpha: 1 }
    expect(parseDeclaration({ property: 'color', value: rgb })).toEqual(['color', 'rgb(255 0 0)'])
    const srgb: PredefinedColor = { type: 'srgb', r: 255, g: 0, b: 0, alpha: 1 }
    expect(parseDeclaration({ property: 'color', value: srgb })).toEqual(['color', 'srgb-rgb(255 0 0)'])
    const lab: LABColor = { type: 'oklch', l: 0, alpha: 0, c: 0, h: 0 }
    expect(parseDeclaration({ property: 'color', value: lab })).toEqual(['color', 'oklch(0 0 0)'])
    const current: CurrentColor = { type: 'currentcolor' }
    expect(parseDeclaration({ property: 'color', value: current })).toEqual(['color', 'currentcolor'])
  })
})
