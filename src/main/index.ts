import { app, shell, BrowserWindow, dialog, ipcMain, protocol } from 'electron'
import { randomUUID } from 'crypto'
import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import { extname, join, basename } from 'path'
import { Readable } from 'stream'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import {
  appInfoChannel,
  mediaProtocol,
  selectAudioFilesChannel,
  type AppInfo,
  type LocalAudioTrack
} from '../shared/contracts/app'
import {
  getAudioTitleFromPath,
  isSupportedAudioFilePath,
  supportedAudioExtensions
} from '../shared/audio'
import { getAudioMimeType, parseByteRange } from '../shared/media'

const mediaFiles = new Map<string, string>()

protocol.registerSchemesAsPrivileged([
  {
    scheme: mediaProtocol,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true
    }
  }
])

function toLocalAudioTrack(filePath: string): LocalAudioTrack {
  const id = randomUUID()
  mediaFiles.set(id, filePath)

  return {
    id,
    title: getAudioTitleFromPath(filePath),
    fileName: basename(filePath),
    extension: extname(filePath).replace('.', '').toUpperCase(),
    playbackUrl: `${mediaProtocol}://track/${id}`
  }
}

function createMediaResponse(filePath: string, request: Request): Promise<Response> {
  return stat(filePath).then((fileStats) => {
    const fileSize = fileStats.size
    const mimeType = getAudioMimeType(filePath)
    const rangeHeader = request.headers.get('range')
    const range = parseByteRange(rangeHeader, fileSize)

    if (rangeHeader && !range) {
      return new Response(null, {
        status: 416,
        headers: {
          'Content-Range': `bytes */${fileSize}`,
          'Accept-Ranges': 'bytes'
        }
      })
    }

    if (range) {
      const stream = createReadStream(filePath, {
        start: range.start,
        end: range.end
      })

      return new Response(Readable.toWeb(stream) as ReadableStream, {
        status: 206,
        headers: {
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'no-store',
          'Content-Length': String(range.end - range.start + 1),
          'Content-Range': `bytes ${range.start}-${range.end}/${fileSize}`,
          'Content-Type': mimeType
        }
      })
    }

    const stream = createReadStream(filePath)

    return new Response(Readable.toWeb(stream) as ReadableStream, {
      status: 200,
      headers: {
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-store',
        'Content-Length': String(fileSize),
        'Content-Type': mimeType
      }
    })
  })
}

function registerMediaProtocol(): void {
  protocol.handle(mediaProtocol, async (request) => {
    const requestUrl = new URL(request.url)
    const trackId = requestUrl.pathname.replace(/^\//, '')
    const filePath = mediaFiles.get(trackId)

    if (requestUrl.hostname !== 'track' || !filePath) {
      return new Response('Track not found', { status: 404 })
    }

    return createMediaResponse(filePath, request)
  })
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 760,
    minWidth: 960,
    minHeight: 620,
    show: false,
    autoHideMenuBar: true,
    title: 'My Player',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

ipcMain.handle(appInfoChannel, (): AppInfo => {
  return {
    name: app.getName(),
    platform: process.platform,
    versions: {
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node
    }
  }
})

ipcMain.handle(selectAudioFilesChannel, async (event): Promise<LocalAudioTrack[]> => {
  const ownerWindow = BrowserWindow.fromWebContents(event.sender)
  const options: Electron.OpenDialogOptions = {
    title: '选择音频文件',
    properties: ['openFile', 'multiSelections'],
    filters: [
      {
        name: '音频文件',
        extensions: supportedAudioExtensions.map((extension) => extension.slice(1))
      }
    ]
  }

  const result = ownerWindow
    ? await dialog.showOpenDialog(ownerWindow, options)
    : await dialog.showOpenDialog(options)

  if (result.canceled) {
    return []
  }

  return result.filePaths.filter(isSupportedAudioFilePath).map(toLocalAudioTrack)
})

app.whenReady().then(() => {
  app.setName('My Player')
  electronApp.setAppUserModelId('io.github.my-player')
  registerMediaProtocol()

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
