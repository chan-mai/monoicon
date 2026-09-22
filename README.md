# monoicon

[![CI](https://img.shields.io/github/actions/workflow/status/chan-mai/monoicon/lint.yaml?branch=main&style=flat-square&logo=github&logoColor=white&label=CI&color=eadcf0)](https://github.com/chan-mai/monoicon/actions/workflows/lint.yaml)
[![Site](https://img.shields.io/badge/site-monoicon.mq1.dev-eadcf0?style=flat-square)](https://monoicon.mq1.dev)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)
![Nuxt](https://img.shields.io/badge/Nuxt-00DC82?style=flat-square&logo=nuxt&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)

いい感じの単色アイコンジェネレータ

https://monoicon.mq1.dev

## 機能

- パレット自動生成とカラーピッカによる色選択
- Twitter / Misskeyでの表示プレビュー
- 複数フォーマットでの書き出し

## API

- `GET /api/v1/icon` — color, size, formatを指定して単色画像を生成
- `GET /api/v1/palette` — パレットを生成

```
https://monoicon.mq1.dev/api/v1/icon?color=eadcf0&size=512&format=png
```

詳細は[APIドキュメント](https://monoicon.mq1.dev/docs)を参照。

## 開発

```bash
pnpm install
pnpm dev
```

## デプロイ

Cloudflare Workers上で動作する。

```bash
pnpm run deploy
```
