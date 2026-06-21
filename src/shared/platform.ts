export const currentDevelopmentPlatform = 'darwin'

export function isCurrentDevelopmentPlatform(platform: string): boolean {
  return platform === currentDevelopmentPlatform
}
