import { describe, expect, it } from 'vitest'
import { getAudioMimeType, parseByteRange } from '../../src/shared/media'

describe('media helpers', () => {
  it('maps audio extensions to browser media mime types', () => {
    expect(getAudioMimeType('/music/track.mp3')).toBe('audio/mpeg')
    expect(getAudioMimeType('/music/track.M4A')).toBe('audio/mp4')
    expect(getAudioMimeType('/music/track.flac')).toBe('audio/flac')
    expect(getAudioMimeType('/music/track.unknown')).toBe('application/octet-stream')
  })

  it('parses standard and open-ended byte ranges', () => {
    expect(parseByteRange('bytes=0-99', 1000)).toEqual({ start: 0, end: 99 })
    expect(parseByteRange('bytes=100-', 1000)).toEqual({ start: 100, end: 999 })
  })

  it('parses suffix byte ranges', () => {
    expect(parseByteRange('bytes=-200', 1000)).toEqual({ start: 800, end: 999 })
    expect(parseByteRange('bytes=-2000', 1000)).toEqual({ start: 0, end: 999 })
  })

  it('rejects invalid byte ranges', () => {
    expect(parseByteRange(null, 1000)).toBeNull()
    expect(parseByteRange('items=0-99', 1000)).toBeNull()
    expect(parseByteRange('bytes=100-10', 1000)).toBeNull()
    expect(parseByteRange('bytes=1000-', 1000)).toBeNull()
  })
})
