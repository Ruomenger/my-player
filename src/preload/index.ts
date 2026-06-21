import { contextBridge, ipcRenderer } from 'electron'
import {
  appInfoChannel,
  selectAudioFilesChannel,
  type AppInfo,
  type LocalAudioTrack,
  type MyPlayerApi
} from '../shared/contracts/app'

const api: MyPlayerApi = {
  getAppInfo: () => ipcRenderer.invoke(appInfoChannel) as Promise<AppInfo>,
  selectAudioFiles: () => ipcRenderer.invoke(selectAudioFilesChannel) as Promise<LocalAudioTrack[]>
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('myPlayer', api)
} else {
  throw new Error('contextIsolation must be enabled')
}
