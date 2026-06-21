import type { MyPlayerApi } from '../shared/contracts/app'

declare global {
  interface Window {
    myPlayer: MyPlayerApi
  }
}

export {}
