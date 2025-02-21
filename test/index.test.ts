/// <reference types="vite/client" />
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { cssToJson } from '../src/index'

const __dirname = dirname(fileURLToPath(import.meta.url))

describe('cases', () => {
  it('case 1 - default classes', async () => {
    const input = readFileSync(resolve(__dirname, './cases/case-1/input.css'), 'utf-8')
    const json = cssToJson(input)
    await expect(json).toMatchFileSnapshot(resolve(__dirname, './cases/case-1/output.json'))
  })

  it('case 2 - additional classes', async () => {
    const input = readFileSync(resolve(__dirname, './cases/case-2/input.css'), 'utf-8')
    const json = cssToJson(input)
    await expect(json).toMatchFileSnapshot(resolve(__dirname, './cases/case-2/output.json'))
  })

  it('case 3 - nested classes', async () => {
    const input = readFileSync(resolve(__dirname, './cases/case-3/input.css'), 'utf-8')
    const json = cssToJson(input)
    await expect(json).toMatchFileSnapshot(resolve(__dirname, './cases/case-3/output.json'))
  })

  it('case 4 - nested classes with additional classes', async () => {
    const input = readFileSync(resolve(__dirname, './cases/case-4/input.css'), 'utf-8')
    const json = cssToJson(input)
    await expect(json).toMatchFileSnapshot(resolve(__dirname, './cases/case-4/output.json'))
  })

  it('case 5 - nested classes with additional classes and pseudo classes', async () => {
    const input = readFileSync(resolve(__dirname, './cases/case-5/input.css'), 'utf-8')
    const json = cssToJson(input)
    await expect(json).toMatchFileSnapshot(resolve(__dirname, './cases/case-5/output.json'))
  })
})
