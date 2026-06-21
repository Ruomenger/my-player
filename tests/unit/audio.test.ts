import { describe, expect, it } from 'vitest'
import {
  getAudioTitleFromPath,
  getFileNameFromPath,
  isSupportedAudioFilePath
} from '../../src/shared/audio'

describe('audio file helpers', () => {
  it('detects supported audio extensions case-insensitively', () => {
    expect(isSupportedAudioFilePath('/music/song.MP3')).toBe(true)
    expect(isSupportedAudioFilePath('/music/song.flac')).toBe(true)
    expect(isSupportedAudioFilePath('/music/readme.txt')).toBe(false)
  })

  it('derives display names from macOS and Windows style paths', () => {
    expect(getFileNameFromPath('/Users/me/Music/Track 01.m4a')).toBe('Track 01.m4a')
    expect(getAudioTitleFromPath('C:\\Music\\Album\\Track 02.wav')).toBe('Track 02')
  })
})
