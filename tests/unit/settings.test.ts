import { describe, expect, it } from 'vitest'
import {
  clampVolume,
  defaultPlayerSettings,
  mergePlayerSettings,
  normalizePlayerSettings,
  normalizeWindowSize
} from '../../src/shared/settings'

describe('clampVolume', () => {
  it('keeps values within [0, 1]', () => {
    expect(clampVolume(0.5)).toBe(0.5)
    expect(clampVolume(-1)).toBe(0)
    expect(clampVolume(4)).toBe(1)
  })

  it('falls back to the default for non-numeric input', () => {
    expect(clampVolume('oops')).toBe(defaultPlayerSettings.volume)
    expect(clampVolume(Number.NaN)).toBe(defaultPlayerSettings.volume)
    expect(clampVolume(undefined)).toBe(defaultPlayerSettings.volume)
  })
})

describe('normalizeWindowSize', () => {
  it('rounds and enforces the minimum window size', () => {
    expect(normalizeWindowSize({ width: 1000.6, height: 700.2 })).toEqual({
      width: 1001,
      height: 700
    })
    expect(normalizeWindowSize({ width: 100, height: 50 })).toEqual({
      width: 960,
      height: 620
    })
  })

  it('fills missing or invalid fields with defaults', () => {
    expect(normalizeWindowSize(undefined)).toEqual(defaultPlayerSettings.window)
    expect(normalizeWindowSize({ width: 'x' })).toEqual(defaultPlayerSettings.window)
  })
})

describe('normalizePlayerSettings', () => {
  it('produces a fully-formed settings object from partial input', () => {
    expect(normalizePlayerSettings({ volume: 2 })).toEqual({
      volume: 1,
      window: defaultPlayerSettings.window
    })
    expect(normalizePlayerSettings(null)).toEqual(defaultPlayerSettings)
  })
})

describe('mergePlayerSettings', () => {
  it('applies a volume patch without losing the window size', () => {
    const merged = mergePlayerSettings(defaultPlayerSettings, { volume: 0.3 })
    expect(merged).toEqual({ volume: 0.3, window: defaultPlayerSettings.window })
  })

  it('applies a partial window patch without losing the volume', () => {
    const merged = mergePlayerSettings(
      { volume: 0.7, window: { width: 1200, height: 760 } },
      { window: { width: 1400 } }
    )
    expect(merged).toEqual({ volume: 0.7, window: { width: 1400, height: 760 } })
  })

  it('returns a normalized copy when there is no patch', () => {
    expect(mergePlayerSettings(defaultPlayerSettings, undefined)).toEqual(defaultPlayerSettings)
  })
})
