# 本地音乐播放器架构方案

## 目标

本项目目标是开发一个类似 QQ 音乐界面的本地音乐播放器。当前开发阶段只验证 macOS，架构上保留后续适配 Windows 和 Linux 的空间。

首期重点：

1. 使用本地音乐文件完成播放、资料库管理、歌单管理、搜索等核心体验。
2. 使用 SQLite 保存歌曲、歌单、扫描目录、播放历史等本地数据。
3. 暂不引入 FFmpeg，但从架构上预留后续接入能力。
4. 代码开源在 GitHub，通过 CI 做格式化、lint、类型检查、测试和构建。

非首期重点：

1. 在线音乐服务、账号系统、云同步。
2. 歌曲转码、冷门格式完整支持。
3. Windows 和 Linux 打包适配。
4. 商店分发、正式代码签名、公证。
5. 移动端。

## 推荐技术栈

首选方案：

1. 桌面壳：Electron
2. UI：React
3. 语言：TypeScript
4. 构建：electron-vite
5. 数据库：SQLite + better-sqlite3
6. 单元测试：Vitest
7. 组件和交互测试：React Testing Library
8. 端到端测试：Playwright
9. 打包：electron-builder
10. CI：GitHub Actions

选择理由：

1. Electron 对桌面能力、媒体播放、文件系统、托盘、快捷键、打包生态支持成熟。
2. React 适合实现复杂播放器界面，例如侧边栏、歌单、播放队列、搜索结果、歌词、设置页等。
3. TypeScript 能约束主进程、预加载脚本、渲染进程、IPC API 和数据模型。
4. electron-vite 对 Electron 的 main、preload、renderer 三个环境支持清晰，开发体验好。
5. better-sqlite3 简单、稳定、性能足够，适合本地单用户桌面应用。

## 备选技术栈

### Tauri + React + TypeScript

优点：

1. 包体更小。
2. 安全边界更强。
3. 有官方 SQL 插件，支持 SQLite。

缺点：

1. 需要 Rust 工具链和平台 WebView 依赖。
2. 后续接入 FFmpeg、媒体键、系统托盘等能力时要处理 Rust 侧集成。
3. 对当前 Electron 倾向和 JavaScript/TypeScript 开发路径不如首选方案直接。

适合条件：强烈关注包体、安全边界，且愿意长期维护 Rust 侧代码。

### Wails + React + TypeScript + Go

优点：

1. 后端可以使用 Go，贴合后端开发经验。
2. 包体通常小于 Electron。
3. SQLite、文件扫描、FFmpeg 后续集成可以放在 Go 侧。

缺点：

1. 桌面播放器相关生态和资料不如 Electron 丰富。
2. UI 调试和 Web 前端生态整合不如 Electron 顺滑。
3. 需要维护 Go 与前端的桥接边界。

适合条件：希望把核心业务能力放在 Go 后端，并接受桌面生态成熟度上的取舍。

### Flutter

优点：

1. 跨平台 UI 一致性好。
2. 动画和自绘能力强。

缺点：

1. 需要引入 Dart。
2. 与当前 TypeScript 倾向不匹配。
3. 桌面端本地音乐播放器的系统集成仍需要处理平台插件。

适合条件：未来明确要同时做移动端，且愿意投入 Flutter 技术栈。

## 进程模型

Electron 应用应明确区分三类代码：

1. 主进程：掌控系统能力和本地资源。
2. 预加载脚本：暴露安全、稳定、窄口径的桌面 API。
3. 渲染进程：只负责 React UI 和用户交互。

### 主进程职责

主进程负责：

1. 创建窗口、菜单、托盘、系统快捷键。
2. 管理应用生命周期。
3. 访问文件系统。
4. 管理 SQLite 数据库。
5. 扫描本地音乐目录。
6. 读取基础音频元数据。
7. 管理播放相关的本地文件访问授权。
8. 后续启动 FFmpeg、ffprobe 或独立 worker。

主进程不应负责：

1. React UI 状态。
2. 页面组件渲染。
3. 歌单列表的视觉排序和交互细节。

### 预加载脚本职责

预加载脚本通过 `contextBridge` 暴露受控 API，例如：

1. `library.pickDirectories()`
2. `library.scan(rootIds)`
3. `tracks.search(query)`
4. `tracks.list(filter)`
5. `playlists.create(input)`
6. `playlists.addTracks(playlistId, trackIds)`
7. `player.resolveTrackUrl(trackId)`
8. `settings.get()`
9. `settings.update(patch)`

不要直接暴露 `ipcRenderer`、文件路径任意读取、SQL 执行等高权限能力。

### 渲染进程职责

渲染进程负责：

1. React 页面和组件。
2. 播放器 UI 状态。
3. 播放队列、当前歌曲、播放进度展示。
4. 歌单管理界面。
5. 搜索、筛选、排序交互。
6. 设置页面。

渲染进程只通过预加载 API 访问主进程能力。

## 建议目录结构

初始目录可以按以下方式组织：

```text
.
├── docs/
│   ├── architecture.md
│   └── roadmap.md
├── src/
│   ├── main/
│   │   ├── app/
│   │   ├── db/
│   │   ├── ipc/
│   │   ├── library/
│   │   ├── playback/
│   │   └── system/
│   ├── preload/
│   │   ├── index.ts
│   │   └── api.ts
│   ├── renderer/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── routes/
│   │   ├── styles/
│   │   └── main.tsx
│   └── shared/
│       ├── contracts/
│       ├── models/
│       └── utils/
├── tests/
│   ├── unit/
│   └── e2e/
└── package.json
```

原则：

1. `src/shared` 只能放纯类型、纯函数、常量，不能依赖 Electron。
2. `src/main` 可以依赖 Node.js、Electron、SQLite。
3. `src/renderer` 不能直接依赖 Node.js 和 Electron 主进程模块。
4. IPC 入参和出参类型放在 `src/shared/contracts`，主进程和渲染进程共用。

## 核心模块

### LibraryScanner

职责：

1. 管理用户选择的音乐目录。
2. 扫描音频文件。
3. 根据文件路径、大小、mtime 判断是否新增、更新或删除。
4. 批量写入 SQLite。
5. 记录扫描错误。

设计要求：

1. 扫描任务必须可取消。
2. 扫描进度应通过事件通知 UI。
3. 大目录扫描不能阻塞 UI。
4. 扫描结果写库要使用事务。

### MetadataService

职责：

1. 读取歌曲标题、艺术家、专辑、时长、封面等基础信息。
2. 首期可使用 Node 生态的音频标签解析库。
3. 后续可以接入 ffprobe 作为增强实现。

设计要求：

1. 对每个文件的解析失败要可记录，不应中断整个扫描任务。
2. 元数据解析结果要保留来源和更新时间。
3. 封面图片不要直接大量存入数据库，建议落盘缓存，数据库只保存引用。

### PlaybackEngine

职责：

1. 管理播放、暂停、上一首、下一首、seek、音量、播放模式。
2. 首期基于 Chromium 的音频播放能力。
3. 后续支持 FFmpeg 解码或转码管线。

设计要求：

1. UI 播放状态与实际音频状态要区分，避免界面显示和实际播放不同步。
2. 播放队列应是独立模型，不应直接等同于当前歌单。
3. 歌曲文件路径不要直接暴露给 renderer，优先通过受控协议或主进程解析 URL。

### PlaylistService

职责：

1. 创建、编辑、删除歌单。
2. 管理歌单歌曲。
3. 维护歌单内顺序。
4. 支持导入和导出扩展。

设计要求：

1. `playlist_tracks` 必须有稳定的 `position` 字段。
2. 批量调整顺序要放在事务里。
3. 删除歌曲时要处理歌单引用。

### SearchService

职责：

1. 搜索歌曲、艺术家、专辑、歌单。
2. 首期可以使用普通 SQL LIKE。
3. 歌曲数量上来后迁移到 SQLite FTS5。

设计要求：

1. 搜索 API 要支持分页。
2. 搜索结果应包含类型、匹配字段和排序权重。
3. 中文搜索后续可能需要更好的分词策略，先保留扩展点。

### SettingsService

职责：

1. 保存主题、窗口尺寸、音量、扫描偏好、播放偏好。
2. 管理应用级配置。

设计要求：

1. 结构化设置可以放 SQLite，也可以放 JSON 配置文件。
2. 用户可恢复的偏好设置不要和运行缓存混在一起。

## SQLite 设计初稿

建议从第一天就引入迁移机制，所有表结构变化通过 migration 管理。

核心表：

```text
schema_migrations
scan_roots
tracks
track_metadata_errors
albums
artists
playlists
playlist_tracks
play_queue_snapshots
play_history
favorite_tracks
app_settings
```

### tracks

建议字段：

```text
id
path
path_hash
file_name
file_ext
file_size
mtime_ms
title
artist
album
album_artist
track_no
disc_no
duration_ms
bitrate
sample_rate
channels
format
cover_cache_key
last_scanned_at
created_at
updated_at
deleted_at
```

索引建议：

1. `path_hash` 唯一索引。
2. `title`、`artist`、`album` 搜索索引。
3. `last_scanned_at` 用于增量扫描。
4. `deleted_at` 用于软删除过滤。

### playlists

建议字段：

```text
id
name
description
cover_cache_key
created_at
updated_at
deleted_at
```

### playlist_tracks

建议字段：

```text
playlist_id
track_id
position
created_at
```

索引建议：

1. `(playlist_id, position)`。
2. `(playlist_id, track_id)`。

### scan_roots

建议字段：

```text
id
path
path_hash
enabled
last_scan_started_at
last_scan_finished_at
created_at
updated_at
```

### 数据库运行参数

建议应用启动时设置：

```sql
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
```

说明：

1. `foreign_keys` 用于保证歌单和歌曲等引用关系。
2. `WAL` 适合本地桌面应用，读写并发体验更好。
3. `busy_timeout` 可以减少短时间写冲突导致的失败。

## 播放格式策略

首期不引入 FFmpeg 时，播放能力依赖 Electron 内置 Chromium 的媒体能力。

首期建议明确支持：

1. MP3
2. WAV
3. OGG/Opus
4. FLAC，按实际 Electron/平台支持验证
5. AAC/M4A，按实际 Electron/平台支持验证

首期不承诺完整支持：

1. APE
2. CUE
3. DTS
4. SACD/DSD
5. 特殊封装或 DRM 文件

产品层面要给出清晰反馈：无法播放时展示文件格式、错误原因和后续建议。

## FFmpeg 扩展预留

后续引入 FFmpeg 时，不应大规模改 UI。建议预留以下接口：

```text
AudioProbeService
AudioDecodeService
AudioTranscodeService
WaveformService
ReplayGainService
```

可能的 FFmpeg 使用场景：

1. 读取更完整的媒体信息。
2. 支持更多音频格式。
3. 生成波形数据。
4. 生成统一封面缩略图。
5. 做音量响度分析。
6. 对不支持的格式做临时转码播放。

FFmpeg 集成注意点：

1. 二进制体积和许可证。
2. macOS 二进制分发，后续再扩展 Windows 和 Linux。
3. 进程生命周期和异常退出处理。
4. 长任务进度回传。
5. 不要在主进程同步执行耗时转码。

## UI 设计方向

整体风格可以参考 QQ 音乐的信息架构，但不要直接复制视觉资产。

首期主要视图：

1. 侧边导航：本地音乐、最近播放、我喜欢、歌单、设置。
2. 顶部区域：搜索、窗口操作、当前视图操作。
3. 主列表：歌曲表格、专辑列表、歌手列表、歌单详情。
4. 底部播放栏：封面、歌曲信息、播放控制、进度条、音量、播放队列入口。
5. 右侧抽屉：播放队列、歌词或歌曲详情。

设计原则：

1. 播放器是高频工具，界面应清晰、稳定、可扫描。
2. 歌曲列表要支持大数据量，后续考虑虚拟列表。
3. 所有固定工具栏和播放栏要有稳定尺寸，避免状态变化导致布局跳动。
4. 歌曲标题、艺术家、专辑字段要处理长文本省略。

## 安全边界

Electron 安全默认要求：

1. 开启 `contextIsolation`。
2. 关闭 renderer 的 Node.js 直接访问。
3. 禁止暴露通用 IPC。
4. IPC 入参必须校验。
5. 不加载远程网页作为主界面。
6. 文件读取只允许用户授权目录内的音乐文件和应用缓存。
7. 对外部链接使用系统浏览器打开。

## 性能考虑

首期要重点关注：

1. 大目录扫描不能阻塞 UI。
2. SQLite 批量写入必须使用事务。
3. 歌曲列表超过几千条后要使用分页或虚拟列表。
4. 封面图片要生成缩略图并缓存。
5. 搜索要避免每次输入都全表重扫，至少做 debounce。
6. 播放进度更新频率要控制，避免 React 高频重渲染。

后续优化：

1. LibraryScanner 放入 worker thread 或 Electron utility process。
2. FTS5 替代 LIKE 搜索。
3. 歌单列表和歌曲表格使用虚拟滚动。
4. 元数据解析队列限流。

## 测试策略

测试分层：

1. 单元测试：纯函数、数据转换、排序、播放队列逻辑。
2. 数据库测试：migration、DAO、事务、约束。
3. IPC 测试：参数校验和主进程 handler。
4. 组件测试：核心 React 组件。
5. E2E 测试：启动应用、导入目录、播放歌曲、创建歌单、搜索。

首期至少覆盖：

1. 播放队列逻辑。
2. SQLite migration。
3. 歌单增删改。
4. 扫描结果入库。
5. 搜索基础行为。

## CI 和发布

PR 检查建议：

1. 安装依赖。
2. 格式检查。
3. lint。
4. TypeScript 类型检查。
5. 单元测试。
6. 应用构建。

当前 Release 构建建议：

1. macOS 构建 DMG 或 zip。
2. 上传构建产物到 GitHub Releases。

后续跨平台适配时再补充：

1. Windows 构建 NSIS 安装包或 portable 包。
2. Linux 构建 AppImage 和 deb。

首期可以先不做代码签名，但要在 README 中说明未签名构建可能触发系统安全提示。

## 开发约定

建议约定：

1. 使用 npm 或 pnpm 固定一种包管理器，不混用。
2. 提交前必须通过 format、lint、typecheck、test。
3. 所有 IPC channel 名称集中定义。
4. 所有数据库 schema 变化必须走 migration。
5. renderer 不允许直接访问 Node.js API。
6. 新增功能优先补充 shared contract 类型。
7. 不在数据库中保存用户隐私外传逻辑，项目默认离线本地优先。
