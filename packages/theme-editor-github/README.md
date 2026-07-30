# bytemd-theme-editor-github

[![npm version](https://img.shields.io/npm/v/bytemd-theme-editor-github)](https://www.npmjs.com/package/bytemd-theme-editor-github) [![npm package license](https://img.shields.io/npm/l/bytemd-theme-editor-github)](https://github.com/tofrankie/bytemd-collection/blob/main/packages/theme-github-editor/LICENSE) [![npm last update](https://img.shields.io/npm/last-update/bytemd-theme-editor-github)](https://www.npmjs.com/package/bytemd-theme-editor-github)

GitHub-flavored editor theme styles for bytemd, with bundled Primer-based tokens for the editor container and Tippy overlays.

## Usage

```bash
pnpm add bytemd-theme-editor-github
```

Import one published theme:

```js
import 'bytemd-theme-editor-github/light.css'
```

Available first-pass outputs:

```js
import 'bytemd-theme-editor-github/pure.css'
import 'bytemd-theme-editor-github/light.css'
import 'bytemd-theme-editor-github/dark.css'
import 'bytemd-theme-editor-github/auto.css'
```

- `pure.css` only includes rules and `var(--token)` references
- `light.css` and `dark.css` provide a fixed token set
- `auto.css` switches between light and dark selectors automatically

## SCSS

If you want to mount tokens onto your own selectors, use the SCSS entry and define explicit targets.

```scss
@use 'bytemd-theme-editor-github/scss' as editor;

@include editor.render-theme-tokens(
  (
    targets: (
      (
        container: '.bytemd',
        modes: (
          light: (
            selectors: ('.theme-light'),
            tokens: 'light',
          ),
          dark: (
            selectors: ('.theme-dark'),
            tokens: 'dark',
          ),
        )
      ),
      (
        container: '.tippy-box',
        modes: (
          light: (
            selectors: ('.theme-light'),
            tokens: 'light',
          ),
          dark: (
            selectors: ('.theme-dark'),
            tokens: 'dark',
          ),
        )
      ),
    ),
  )
);

@include editor.render-rules();
```

## License

MIT License © [Frankie](https://github.com/tofrankie)
