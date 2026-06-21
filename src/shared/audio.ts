export const supportedAudioExtensions = ['.mp3', '.wav', '.ogg', '.opus', '.flac', '.m4a', '.aac']

export function isSupportedAudioFilePath(filePath: string): boolean {
  const lowerCasePath = filePath.toLowerCase()

  return supportedAudioExtensions.some((extension) => lowerCasePath.endsWith(extension))
}

export function getFileNameFromPath(filePath: string): string {
  return filePath.split(/[\\/]/).pop() || filePath
}

export function getAudioTitleFromPath(filePath: string): string {
  const fileName = getFileNameFromPath(filePath)
  return fileName.replace(/\.[^.]+$/, '') || fileName
}
