import { _electron as electron, expect, test } from '@playwright/test'
import path from 'node:path'

test('plays the bundled MP3 fixture after selecting it', async () => {
  const appRoot = process.cwd()
  const fixturePath = path.join(appRoot, 'tests/fixtures/audio/goldberg-variation-1.mp3')
  const electronApp = await electron.launch({ args: [appRoot] })

  try {
    await electronApp.evaluate(({ dialog }, selectedFilePath) => {
      dialog.showOpenDialog = (async () => ({
        canceled: false,
        filePaths: [selectedFilePath]
      })) as typeof dialog.showOpenDialog
    }, fixturePath)

    const window = await electronApp.firstWindow()
    await window.getByRole('button', { name: '添加文件' }).click()

    await expect(window.getByRole('button', { name: /goldberg-variation-1/i })).toBeVisible()
    await window.getByRole('button', { name: '播放', exact: true }).click()

    await expect
      .poll(async () => {
        return window.evaluate(() => {
          const audio = document.querySelector('audio')
          return audio?.error?.code ?? null
        })
      })
      .toBeNull()

    await expect
      .poll(async () => {
        return window.evaluate(() => {
          const audio = document.querySelector('audio')
          return audio?.readyState ?? 0
        })
      })
      .toBeGreaterThanOrEqual(2)

    await expect
      .poll(async () => {
        return window.evaluate(() => {
          const audio = document.querySelector('audio')
          return Number.isFinite(audio?.duration) && Number(audio?.duration) > 0
        })
      })
      .toBe(true)

    await expect
      .poll(async () => {
        return window.evaluate(() => {
          const audio = document.querySelector('audio')
          return audio?.paused ? 'paused' : 'playing'
        })
      })
      .toBe('playing')

    const currentTime = await window.evaluate(() => {
      return document.querySelector('audio')?.currentTime ?? 0
    })

    await expect
      .poll(async () => {
        return window.evaluate(() => {
          return document.querySelector('audio')?.currentTime ?? 0
        })
      })
      .toBeGreaterThan(currentTime)
  } finally {
    await electronApp.close()
  }
})
