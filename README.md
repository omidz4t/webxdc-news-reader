# 📰 WebXDC News Reader

A [WebXDC](https://webxdc.org/) app for reading and browsing news from Telegram channels inside [Delta Chat](https://delta.chat/).

[![CI Pipeline](https://github.com/omidz4t/webxdc-news-reader/actions/workflows/pipeline.yml/badge.svg)](https://github.com/omidz4t/webxdc-news-reader/actions)
[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-blue)](https://omidz4t.github.io/webxdc-news-reader/)

## Features

- 📱 Mobile-first, Telegram-style message layout
- 🖼️ Image lightbox with swipe navigation
- 🔗 Link extraction and preview
- 🌙 Dark mode support
- 📦 Packaged as `.xdc` for Delta Chat

## Development

```sh
bun install
bun run dev
```

## Build

```sh
# Build the web app
bun run build

# Package as .xdc
bun run package
```

## Demo

A live preview is available at [omidz4t.github.io/webxdc-news-reader](https://omidz4t.github.io/webxdc-news-reader/).

## License

This project is licensed under the [GNU Lesser General Public License v3.0](LICENSE).
