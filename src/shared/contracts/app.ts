export const appInfoChannel = 'app:get-info'
export const selectAudioFilesChannel = 'library:select-audio-files'
export const getSettingsChannel = 'settings:get'
export const updateSettingsChannel = 'settings:update'
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

export interface WindowSize {
  width: number
  height: number
}

export interface PlayerSettings {
  volume: number
  window: WindowSize
}

export interface PlayerSettingsPatch {
  volume?: number
  window?: Partial<WindowSize>
}

export interface MyPlayerApi {
  getAppInfo: () => Promise<AppInfo>
  selectAudioFiles: () => Promise<LocalAudioTrack[]>
  getSettings: () => Promise<PlayerSettings>
  updateSettings: (patch: PlayerSettingsPatch) => Promise<PlayerSettings>
}
