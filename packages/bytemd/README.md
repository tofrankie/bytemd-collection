# @tofrankie/bytemd

[![npm version](https://img.shields.io/npm/v/@tofrankie/bytemd)](https://www.npmjs.com/package/@tofrankie/bytemd) [![npm package license](https://img.shields.io/npm/l/@tofrankie/bytemd)](https://github.com/tofrankie/bytemd-collection/blob/main/packages/bytemd/LICENSE)

A hackable Markdown editor and viewer for Svelte, forked from upstream [bytemd](https://github.com/pd4d10/bytemd) and maintained in the `@tofrankie/bytemd` package line.

## Install

```bash
pnpm add @tofrankie/bytemd
```

## Usage

```ts
import { Editor } from '@tofrankie/bytemd'
import '@tofrankie/bytemd/dist/index.css'
```

## Breaking Changes in This Fork

- The package name changes from `bytemd` to `@tofrankie/bytemd`
- UMD, `unpkg`, and `jsdelivr` distribution entries are removed
- The Svelte package entry is treated as a controlled compatibility surface during the migration to Svelte 5 and CodeMirror 6

## Credits

Based from [pd4d10/bytemd](https://github.com/pd4d10/bytemd) ❤️

## License

MIT License © [Frankie](https://github.com/tofrankie)
