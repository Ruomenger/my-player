import { describe, expect, it } from 'vitest'
import { currentDevelopmentPlatform, isCurrentDevelopmentPlatform } from '../../src/shared/platform'

describe('platform scope', () => {
  it('keeps initial development scoped to macOS', () => {
    expect(currentDevelopmentPlatform).toBe('darwin')
    expect(isCurrentDevelopmentPlatform('darwin')).toBe(true)
    expect(isCurrentDevelopmentPlatform('win32')).toBe(false)
    expect(isCurrentDevelopmentPlatform('linux')).toBe(false)
  })
})
