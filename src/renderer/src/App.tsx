import {
  FolderPlus,
  Heart,
  History,
  Library,
  ListMusic,
  Play,
  Search,
  Settings,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { AppInfo } from '../../shared/contracts/app'

const navItems = [
  { label: '本地音乐', icon: Library, active: true },
  { label: '最近播放', icon: History },
  { label: '我喜欢', icon: Heart },
  { label: '歌单', icon: ListMusic },
  { label: '设置', icon: Settings }
]

const queueItems = ['等待添加音乐', '播放队列', '本地曲库']

function App(): React.JSX.Element {
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null)

  useEffect(() => {
    window.myPlayer.getAppInfo().then(setAppInfo).catch(console.error)
  }, [])

  return (
    <main className="app-shell">
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
              <input placeholder="搜索歌曲、歌手、专辑" />
            </label>
            <button className="primary-action" type="button">
              <FolderPlus size={18} aria-hidden="true" />
              <span>添加目录</span>
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

            <div className="empty-library">
              <Library size={40} aria-hidden="true" />
              <h2>本地曲库为空</h2>
              <p>添加音乐目录后，这里会显示扫描到的歌曲。</p>
            </div>
          </section>

          <aside className="queue-panel" aria-label="播放队列">
            <div className="panel-heading">
              <h2>播放队列</h2>
              <button className="icon-button" type="button" aria-label="随机播放">
                <Shuffle size={17} aria-hidden="true" />
              </button>
            </div>

            <ol>
              {queueItems.map((item, index) => (
                <li key={item}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{item}</strong>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>

      <footer className="player-bar">
        <div className="now-playing">
          <div className="cover-placeholder" aria-hidden="true" />
          <div>
            <strong>未播放</strong>
            <span>选择歌曲后开始播放</span>
          </div>
        </div>

        <div className="transport">
          <button className="icon-button" type="button" aria-label="上一首">
            <SkipBack size={19} aria-hidden="true" />
          </button>
          <button className="play-button" type="button" aria-label="播放">
            <Play size={22} fill="currentColor" aria-hidden="true" />
          </button>
          <button className="icon-button" type="button" aria-label="下一首">
            <SkipForward size={19} aria-hidden="true" />
          </button>
        </div>

        <div className="volume">
          <Volume2 size={18} aria-hidden="true" />
          <div className="volume-track" aria-hidden="true">
            <span />
          </div>
        </div>
      </footer>
    </main>
  )
}

export default App
