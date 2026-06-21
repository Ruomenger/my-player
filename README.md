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
