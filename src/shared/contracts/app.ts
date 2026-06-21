export const appInfoChannel = 'app:get-info'

export interface AppInfo {
  name: string
  platform: string
  versions: {
    electron: string
    chrome: string
    node: string
  }
}

export interface MyPlayerApi {
  getAppInfo: () => Promise<AppInfo>
}
