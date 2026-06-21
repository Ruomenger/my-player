import { app } from 'electron'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import type { PlayerSettings, PlayerSettingsPatch } from '../shared/contracts/app'
import {
  defaultPlayerSettings,
  mergePlayerSettings,
  normalizePlayerSettings
} from '../shared/settings'

let cachedSettings: PlayerSettings | null = null

function settingsFilePath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

export function loadPlayerSettings(): PlayerSettings {
  if (cachedSettings) {
    return cachedSettings
  }

  try {
    const raw = readFileSync(settingsFilePath(), 'utf-8')
    cachedSettings = normalizePlayerSettings(JSON.parse(raw))
  } catch {
    cachedSettings = normalizePlayerSettings(defaultPlayerSettings)
  }

  return cachedSettings
}

export function savePlayerSettings(patch: PlayerSettingsPatch): PlayerSettings {
  const next = mergePlayerSettings(loadPlayerSettings(), patch)
  cachedSettings = next

  try {
    mkdirSync(app.getPath('userData'), { recursive: true })
    writeFileSync(settingsFilePath(), JSON.stringify(next, null, 2))
  } catch (error) {
    console.error('Failed to persist player settings', error)
  }

  return next
}
