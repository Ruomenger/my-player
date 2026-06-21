import { describe, expect, it } from 'vitest'
import { formatDuration } from '../../src/shared/time'

describe('formatDuration', () => {
  it('formats sub-hour durations as m:ss', () => {
    expect(formatDuration(0)).toBe('0:00')
    expect(formatDuration(5)).toBe('0:05')
    expect(formatDuration(65)).toBe('1:05')
    expect(formatDuration(600)).toBe('10:00')
  })

  it('formats durations of an hour or more as h:mm:ss', () => {
    expect(formatDuration(3600)).toBe('1:00:00')
    expect(formatDuration(3661)).toBe('1:01:01')
  })

  it('floors fractional seconds', () => {
    expect(formatDuration(65.9)).toBe('1:05')
  })

  it('falls back to 0:00 for invalid values', () => {
    expect(formatDuration(Number.NaN)).toBe('0:00')
    expect(formatDuration(Number.POSITIVE_INFINITY)).toBe('0:00')
    expect(formatDuration(-12)).toBe('0:00')
  })
})
