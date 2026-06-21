import { contextBridge, ipcRenderer } from 'electron'
import { appInfoChannel, type AppInfo, type MyPlayerApi } from '../shared/contracts/app'

const api: MyPlayerApi = {
  getAppInfo: () => ipcRenderer.invoke(appInfoChannel) as Promise<AppInfo>
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('myPlayer', api)
} else {
  throw new Error('contextIsolation must be enabled')
}
