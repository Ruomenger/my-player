export const appInfoChannel = 'app:get-info'
export const selectAudioFilesChannel = 'library:select-audio-files'
export const mediaProtocol = 'my-player-media'

export interface AppInfo {
  name: string
  platform: string
  versions: {
    electron: string
    chrome: string
    node: string
  }
}

export interface LocalAudioTrack {
  id: string
  title: string
  fileName: string
  extension: string
  playbackUrl: string
}

export interface MyPlayerApi {
  getAppInfo: () => Promise<AppInfo>
  selectAudioFiles: () => Promise<LocalAudioTrack[]>
}
