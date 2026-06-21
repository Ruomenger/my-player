import {
  FolderPlus,
  Heart,
  History,
  Library,
  ListMusic,
  Music2,
  Pause,
  Play,
  Search,
  Settings,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { AppInfo, LocalAudioTrack } from '../../shared/contracts/app'
import { formatDuration } from '../../shared/time'

const navItems = [
  { label: '本地音乐', icon: Library, active: true },
  { label: '最近播放', icon: History },
  { label: '我喜欢', icon: Heart },
  { label: '歌单', icon: ListMusic },
  { label: '设置', icon: Settings }
]

function App(): React.JSX.Element {
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null)
  const [tracks, setTracks] = useState<LocalAudioTrack[]>([])
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSelectingFiles, setIsSelectingFiles] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [playbackError, setPlaybackError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const settingsLoadedRef = useRef(false)

  const currentTrack = useMemo(
    () => tracks.find((track) => track.id === currentTrackId) ?? null,
    [currentTrackId, tracks]
  )

  const visibleTracks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return tracks
    }

    return tracks.filter((track) => track.title.toLowerCase().includes(normalizedQuery))
  }, [searchQuery, tracks])

  useEffect(() => {
    window.myPlayer.getAppInfo().then(setAppInfo).catch(console.error)
  }, [])

  useEffect(() => {
    window.myPlayer
      .getSettings()
      .then((settings) => {
        setVolume(settings.volume)
      })
      .catch(console.error)
      .finally(() => {
        settingsLoadedRef.current = true
      })
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    if (!settingsLoadedRef.current) {
      return
    }

    const timer = setTimeout(() => {
      window.myPlayer.updateSettings({ volume }).catch(console.error)
    }, 400)

    return () => clearTimeout(timer)
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    if (!currentTrack) {
      audio.removeAttribute('src')
      audio.load()
      return
    }

    if (audio.getAttribute('src') !== currentTrack.playbackUrl) {
      audio.src = currentTrack.playbackUrl
      audio.load()
    }
  }, [currentTrack])

  const handleSelectAudioFiles = async (): Promise<void> => {
    setIsSelectingFiles(true)
    setPlaybackError(null)

    try {
      const selectedTracks = await window.myPlayer.selectAudioFiles()

      if (selectedTracks.length === 0) {
        return
      }

      setTracks((existingTracks) => [...existingTracks, ...selectedTracks])
      setCurrentTrackId((existingTrackId) => existingTrackId ?? selectedTracks[0].id)
    } catch (error) {
      console.error(error)
      setPlaybackError('无法添加音频文件')
    } finally {
      setIsSelectingFiles(false)
    }
  }

  const loadTrack = (track: LocalAudioTrack): HTMLAudioElement | null => {
    const audio = audioRef.current

    if (!audio) {
      return null
    }

    if (audio.getAttribute('src') !== track.playbackUrl) {
      audio.src = track.playbackUrl
      audio.load()
    }

    return audio
  }

  const playTrack = (track: LocalAudioTrack): void => {
    const audio = loadTrack(track)

    setCurrentTrackId(track.id)
    setIsPlaying(true)
    setPlaybackError(null)

    void audio?.play().catch(() => {
      setIsPlaying(false)
      setPlaybackError('当前文件无法播放')
    })
  }

  const moveBy = (offset: number): void => {
    if (tracks.length === 0) {
      return
    }

    const currentIndex = currentTrack
      ? tracks.findIndex((track) => track.id === currentTrack.id)
      : -1
    const nextIndex = currentIndex < 0 ? 0 : (currentIndex + offset + tracks.length) % tracks.length

    playTrack(tracks[nextIndex])
  }

  const togglePlay = (): void => {
    if (!currentTrack && tracks[0]) {
      playTrack(tracks[0])
      return
    }

    if (!currentTrack) {
      return
    }

    if (isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
      return
    }

    playTrack(currentTrack)
  }

  const seek = (seconds: number): void => {
    const audio = audioRef.current

    if (!audio || !Number.isFinite(audio.duration)) {
      return
    }

    audio.currentTime = seconds
    setCurrentTime(seconds)
  }

  return (
    <main className="app-shell">
      <audio
        ref={audioRef}
        preload="metadata"
        onLoadStart={() => {
          setCurrentTime(0)
          setDuration(0)
        }}
        onLoadedMetadata={(event) => {
          const value = event.currentTarget.duration
          setDuration(Number.isFinite(value) ? value : 0)
        }}
        onDurationChange={(event) => {
          const value = event.currentTarget.duration
          setDuration(Number.isFinite(value) ? value : 0)
        }}
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime)
        }}
        onEnded={() => {
          if (tracks.length > 1) {
            moveBy(1)
          } else {
            setIsPlaying(false)
          }
        }}
        onError={() => {
          if (currentTrack) {
            setIsPlaying(false)
            setPlaybackError('当前文件无法播放')
          }
        }}
      />

      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">M</span>
          <span>My Player</span>
        </div>

        <nav className="nav-list" aria-label="主导航">
          {navItems.map((item) => (
            <button className={item.active ? 'nav-item is-active' : 'nav-item'} key={item.label}>
              <item.icon size={18} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span>macOS 开发版</span>
          <strong>
            {appInfo?.versions.electron ? `Electron ${appInfo.versions.electron}` : 'Electron'}
          </strong>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">本地曲库</p>
            <h1>本地音乐</h1>
          </div>

          <div className="topbar-actions">
            <label className="search-box">
              <Search size={17} aria-hidden="true" />
              <input
                placeholder="搜索歌曲"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>
            <button
              className="primary-action"
              type="button"
              disabled={isSelectingFiles}
              onClick={() => void handleSelectAudioFiles()}
            >
              <FolderPlus size={18} aria-hidden="true" />
              <span>{isSelectingFiles ? '选择中' : '添加文件'}</span>
            </button>
          </div>
        </header>

        <div className="content-grid">
          <section className="library-view" aria-label="歌曲列表">
            <div className="table-head">
              <span>歌曲</span>
              <span>艺术家</span>
              <span>专辑</span>
              <span>时长</span>
            </div>

            {visibleTracks.length > 0 ? (
              <div className="track-list">
                {visibleTracks.map((track) => (
                  <button
                    className={track.id === currentTrack?.id ? 'track-row is-current' : 'track-row'}
                    type="button"
                    key={track.id}
                    onClick={() => playTrack(track)}
                  >
                    <span className="track-title">
                      <Music2 size={16} aria-hidden="true" />
                      <span>{track.title}</span>
                    </span>
                    <span>本地文件</span>
                    <span>{track.extension || '音频'}</span>
                    <span>--:--</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="empty-library">
                <Library size={40} aria-hidden="true" />
                <h2>{tracks.length > 0 ? '没有匹配歌曲' : '本地曲库为空'}</h2>
                <p>{tracks.length > 0 ? '调整搜索关键词。' : '添加音频文件后开始播放。'}</p>
              </div>
            )}
          </section>

          <aside className="queue-panel" aria-label="播放队列">
            <div className="panel-heading">
              <h2>播放队列</h2>
              <button className="icon-button" type="button" aria-label="随机播放">
                <Shuffle size={17} aria-hidden="true" />
              </button>
            </div>

            {tracks.length > 0 ? (
              <ol>
                {tracks.map((track, index) => (
                  <li
                    className={track.id === currentTrack?.id ? 'is-current' : undefined}
                    key={track.id}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{track.title}</strong>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="queue-empty">暂无歌曲</p>
            )}
          </aside>
        </div>
      </section>

      <footer className="player-bar">
        <div className="now-playing">
          <div className="cover-placeholder" aria-hidden="true" />
          <div>
            <strong>{currentTrack?.title ?? '未播放'}</strong>
            <span>
              {playbackError ?? (currentTrack ? currentTrack.fileName : '选择歌曲后开始播放')}
            </span>
          </div>
        </div>

        <div className="player-center">
          <div className="transport">
            <button
              className="icon-button"
              type="button"
              aria-label="上一首"
              onClick={() => moveBy(-1)}
            >
              <SkipBack size={19} aria-hidden="true" />
            </button>
            <button
              className="play-button"
              type="button"
              aria-label={isPlaying ? '暂停' : '播放'}
              disabled={tracks.length === 0}
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause size={22} fill="currentColor" aria-hidden="true" />
              ) : (
                <Play size={22} fill="currentColor" aria-hidden="true" />
              )}
            </button>
            <button
              className="icon-button"
              type="button"
              aria-label="下一首"
              onClick={() => moveBy(1)}
            >
              <SkipForward size={19} aria-hidden="true" />
            </button>
          </div>

          <div className="progress">
            <span className="time">{formatDuration(currentTime)}</span>
            <input
              className="seek"
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={duration ? Math.min(currentTime, duration) : 0}
              disabled={!duration}
              aria-label="播放进度"
              onChange={(event) => seek(Number(event.target.value))}
            />
            <span className="time">{formatDuration(duration)}</span>
          </div>
        </div>

        <div className="volume">
          <Volume2 size={18} aria-hidden="true" />
          <input
            className="volume-slider"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            aria-label="音量"
            onChange={(event) => setVolume(Number(event.target.value))}
          />
        </div>
      </footer>
    </main>
  )
}

export default App
