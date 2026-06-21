import { contextBridge, ipcRenderer } from 'electron'
import {
  appInfoChannel,
  getSettingsChannel,
  selectAudioFilesChannel,
  updateSettingsChannel,
  type AppInfo,
  type LocalAudioTrack,
  type MyPlayerApi,
  type PlayerSettings,
  type PlayerSettingsPatch
} from '../shared/contracts/app'

const api: MyPlayerApi = {
  getAppInfo: () => ipcRenderer.invoke(appInfoChannel) as Promise<AppInfo>,
  selectAudioFiles: () => ipcRenderer.invoke(selectAudioFilesChannel) as Promise<LocalAudioTrack[]>,
  getSettings: () => ipcRenderer.invoke(getSettingsChannel) as Promise<PlayerSettings>,
  updateSettings: (patch: PlayerSettingsPatch) =>
    ipcRenderer.invoke(updateSettingsChannel, patch) as Promise<PlayerSettings>
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('myPlayer', api)
} else {
  throw new Error('contextIsolation must be enabled')
}
