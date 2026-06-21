export interface ByteRange {
  start: number
  end: number
}

export function getAudioMimeType(filePath: string): string {
  const lowerCasePath = filePath.toLowerCase()

  if (lowerCasePath.endsWith('.mp3')) {
    return 'audio/mpeg'
  }

  if (lowerCasePath.endsWith('.wav')) {
    return 'audio/wav'
  }

  if (lowerCasePath.endsWith('.ogg') || lowerCasePath.endsWith('.opus')) {
    return 'audio/ogg'
  }

  if (lowerCasePath.endsWith('.flac')) {
    return 'audio/flac'
  }

  if (lowerCasePath.endsWith('.m4a')) {
    return 'audio/mp4'
  }

  if (lowerCasePath.endsWith('.aac')) {
    return 'audio/aac'
  }

  return 'application/octet-stream'
}

export function parseByteRange(rangeHeader: string | null, fileSize: number): ByteRange | null {
  if (!rangeHeader) {
    return null
  }

  const rangeMatch = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim())

  if (!rangeMatch || fileSize <= 0) {
    return null
  }

  const [, rawStart, rawEnd] = rangeMatch

  if (!rawStart && !rawEnd) {
    return null
  }

  if (!rawStart) {
    const suffixLength = Number(rawEnd)

    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) {
      return null
    }

    return {
      start: Math.max(fileSize - suffixLength, 0),
      end: fileSize - 1
    }
  }

  const start = Number(rawStart)
  const end = rawEnd ? Number(rawEnd) : fileSize - 1

  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    start < 0 ||
    end < start ||
    start >= fileSize
  ) {
    return null
  }

  return {
    start,
    end: Math.min(end, fileSize - 1)
  }
}
