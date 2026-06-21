import { _electron as electron, expect, test } from '@playwright/test'
import type { ElectronApplication, Locator } from '@playwright/test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const appRoot = process.cwd()
const fixturePath = path.join(appRoot, 'tests/fixtures/audio/goldberg-variation-1.mp3')

function createUserDataDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'my-player-e2e-'))
}

function launchApp(userDataDir: string): Promise<ElectronApplication> {
  return electron.launch({ args: [appRoot, `--user-data-dir=${userDataDir}`] })
}

async function setRangeValue(slider: Locator, value: string): Promise<void> {
  await slider.evaluate((element, nextValue) => {
    const input = element as HTMLInputElement
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
    setter?.call(input, nextValue)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  }, value)
}

test('plays the bundled MP3 fixture and shows progress and volume control', async () => {
  const userDataDir = createUserDataDir()
  const electronApp = await launchApp(userDataDir)

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
        return window.evaluate(() => document.querySelector('audio')?.error?.code ?? null)
      })
      .toBeNull()

    await expect
      .poll(async () => {
        return window.evaluate(() => document.querySelector('audio')?.readyState ?? 0)
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

    // 时长显示与可 seek 的进度条
    const durationLabel = await window.locator('.progress .time').last().textContent()
    expect(durationLabel).toMatch(/^\d+:\d{2}$/)
    expect(durationLabel).not.toBe('0:00')
    const seekMax = await window.getByRole('slider', { name: '播放进度' }).getAttribute('max')
    expect(Number(seekMax)).toBeGreaterThan(0)

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

    // 音量控件作用到音频元素
    await setRangeValue(window.getByRole('slider', { name: '音量' }), '0.5')
    await expect
      .poll(async () => {
        return window.evaluate(() => document.querySelector('audio')?.volume ?? -1)
      })
      .toBe(0.5)
  } finally {
    await electronApp.close()
    fs.rmSync(userDataDir, { recursive: true, force: true })
  }
})

test('persists the last volume across restarts', async () => {
  const userDataDir = createUserDataDir()
  const settingsFile = path.join(userDataDir, 'settings.json')

  const firstRun = await launchApp(userDataDir)
  try {
    const window = await firstRun.firstWindow()
    await setRangeValue(window.getByRole('slider', { name: '音量' }), '0.5')

    // 等待防抖持久化写盘
    await expect
      .poll(() => {
        try {
          return JSON.parse(fs.readFileSync(settingsFile, 'utf-8')).volume
        } catch {
          return null
        }
      })
      .toBe(0.5)
  } finally {
    await firstRun.close()
  }

  const secondRun = await launchApp(userDataDir)
  try {
    const window = await secondRun.firstWindow()
    await expect(window.getByRole('slider', { name: '音量' })).toHaveValue('0.5')
    await expect
      .poll(async () => {
        return window.evaluate(() => document.querySelector('audio')?.volume ?? -1)
      })
      .toBe(0.5)
  } finally {
    await secondRun.close()
    fs.rmSync(userDataDir, { recursive: true, force: true })
  }
})
