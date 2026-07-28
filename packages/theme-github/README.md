# bytemd-theme-github

[![npm version](https://img.shields.io/npm/v/bytemd-theme-github)](https://www.npmjs.com/package/bytemd-theme-github) [![npm package license](https://img.shields.io/npm/l/bytemd-theme-github)](https://github.com/tofrankie/bytemd-collection/blob/main/packages/theme-github/LICENSE) [![npm last update](https://img.shields.io/npm/last-update/bytemd-theme-github)](https://www.npmjs.com/package/bytemd-theme-github)

GitHub Flavored Markdown theme styles for bytemd, based on `@tofrankie/github-markdown-css` with a bytemd patch layer.

## Usage

```bash
pnpm add bytemd-theme-github
```

```js
import 'bytemd-theme-github'
```

Use `bytemd-theme-github` together with `bytemd-plugin-gfm` when you want GitHub-style tables, task lists, footnotes, and other GFM presentation details.

## Themes

The package defaults to `light`:

```js
import 'bytemd-theme-github'
```

You can also import a specific theme directly.

> Import only one theme that matches your app's appearance.

### Light

```js
import 'bytemd-theme-github/light.css'
import 'bytemd-theme-github/light-colorblind.css'
import 'bytemd-theme-github/light-colorblind-high-contrast.css'
import 'bytemd-theme-github/light-high-contrast.css'
import 'bytemd-theme-github/light-tritanopia.css'
import 'bytemd-theme-github/light-tritanopia-high-contrast.css'
```

### Dark

```js
import 'bytemd-theme-github/dark.css'
import 'bytemd-theme-github/dark-colorblind.css'
import 'bytemd-theme-github/dark-colorblind-high-contrast.css'
import 'bytemd-theme-github/dark-dimmed.css'
import 'bytemd-theme-github/dark-dimmed-high-contrast.css'
import 'bytemd-theme-github/dark-high-contrast.css'
import 'bytemd-theme-github/dark-tritanopia.css'
import 'bytemd-theme-github/dark-tritanopia-high-contrast.css'
```

### Auto

These themes switch automatically based on `prefers-color-scheme`.

```js
import 'bytemd-theme-github/auto.css'
import 'bytemd-theme-github/auto-colorblind.css'
import 'bytemd-theme-github/auto-colorblind-high-contrast.css'
import 'bytemd-theme-github/auto-dimmed.css'
import 'bytemd-theme-github/auto-dimmed-high-contrast.css'
import 'bytemd-theme-github/auto-high-contrast.css'
import 'bytemd-theme-github/auto-tritanopia.css'
import 'bytemd-theme-github/auto-tritanopia-high-contrast.css'
```

## Credits

Built on top of [@tofrankie/github-markdown-css](https://www.npmjs.com/package/@tofrankie/github-markdown-css) ❤️

## License

MIT License © [Frankie](https://github.com/tofrankie)
