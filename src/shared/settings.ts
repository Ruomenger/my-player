import type { PlayerSettings, PlayerSettingsPatch, WindowSize } from './contracts/app'

export const minWindowSize: WindowSize = { width: 960, height: 620 }

export const defaultPlayerSettings: PlayerSettings = {
  volume: 1,
  window: { width: 1200, height: 760 }
}

export function clampVolume(value: unknown): number {
  const numeric = typeof value === 'number' ? value : Number(value)

  if (!Number.isFinite(numeric)) {
    return defaultPlayerSettings.volume
  }

  if (numeric < 0) {
    return 0
  }

  if (numeric > 1) {
    return 1
  }

  return numeric
}

function normalizeDimension(value: unknown, fallback: number, min: number): number {
  const numeric = typeof value === 'number' ? value : Number(value)

  if (!Number.isFinite(numeric)) {
    return fallback
  }

  return Math.max(Math.round(numeric), min)
}

export function normalizeWindowSize(raw: unknown): WindowSize {
  const candidate = (raw ?? {}) as Partial<WindowSize>

  return {
    width: normalizeDimension(
      candidate.width,
      defaultPlayerSettings.window.width,
      minWindowSize.width
    ),
    height: normalizeDimension(
      candidate.height,
      defaultPlayerSettings.window.height,
      minWindowSize.height
    )
  }
}

export function normalizePlayerSettings(raw: unknown): PlayerSettings {
  const candidate = (raw ?? {}) as Partial<PlayerSettings>

  return {
    volume: clampVolume(candidate.volume),
    window: normalizeWindowSize(candidate.window)
  }
}

export function mergePlayerSettings(
  current: PlayerSettings,
  patch: PlayerSettingsPatch | undefined
): PlayerSettings {
  if (!patch) {
    return normalizePlayerSettings(current)
  }

  return normalizePlayerSettings({
    volume: patch.volume ?? current.volume,
    window: { ...current.window, ...(patch.window ?? {}) }
  })
}
