# My Player

一个 macOS-first 的本地音乐播放器，使用 Electron、React 和 TypeScript 开发。

## 开发环境

1. Node.js >= 24.17.0
2. npm >= 11.13.0
3. macOS

如果使用 nvm：

```bash
nvm use
```

如果 Electron 依赖下载较慢，可以在安装前临时设置镜像环境变量：

```bash
export ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
export ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/
npm install
```

### 依赖 override 说明

`package.json` 的 `overrides` 中有一条 `extract-zip > yauzl: 3.4.0`，请勿删除。

`extract-zip@2.0.1`（Electron 安装脚本用来解压预编译二进制的传递依赖，且已是其最新版）在 Node.js 24 下解压时会在写出首个条目后静默卡死，导致 Electron 二进制和 `path.txt` 缺失，安装看似成功但实际无法启动。将其依赖的 `yauzl` 升级到 3.x（现代流实现）即可修复。该 override 仅作用于 extract-zip，未来 Electron 不再使用它时会自动失效。

## 常用命令

```bash
npm install
npm run dev
npm run format:check
npm run lint
npm run typecheck
npm run test:unit
npm run build
npm run build:mac
```

## 当前范围

当前开发和 CI 只验证 macOS。Windows 和 Linux 的构建、打包、路径差异、系统集成会在后续阶段处理。

## 文档

1. [架构方案](docs/architecture.md)
2. [开发路线图](docs/roadmap.md)
