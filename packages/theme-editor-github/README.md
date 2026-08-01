# bytemd-theme-editor-github

[![npm version](https://img.shields.io/npm/v/bytemd-theme-editor-github)](https://www.npmjs.com/package/bytemd-theme-editor-github) [![npm package license](https://img.shields.io/npm/l/bytemd-theme-editor-github)](https://github.com/tofrankie/bytemd-collection/blob/main/packages/theme-editor-github/LICENSE) [![npm last update](https://img.shields.io/npm/last-update/bytemd-theme-editor-github)](https://www.npmjs.com/package/bytemd-theme-editor-github)

GitHub-flavored editor theme styles for bytemd, with bundled Primer-based tokens for the editor container and Tippy overlays.

## Usage

```bash
pnpm add bytemd-theme-editor-github
```

Import the package root for the default light theme:

```js
import 'bytemd-theme-editor-github'
```

Or import one published theme explicitly:

```js
import 'bytemd-theme-editor-github/light.css'
```

The package publishes every concrete theme from `@primer/primitives`, plus an automatic light/dark entry:

```js
import 'bytemd-theme-editor-github/pure.css'
import 'bytemd-theme-editor-github/light.css'
import 'bytemd-theme-editor-github/dark.css'
import 'bytemd-theme-editor-github/auto.css'
```

- `pure.css` only includes rules and `var(--token)` references
- Each concrete `<theme>.css` file provides a fixed token set
- Each `auto-*.css` file switches between a matching light and dark theme pair automatically

Available concrete themes:

- `light.css`
- `light-colorblind.css`
- `light-colorblind-high-contrast.css`
- `light-high-contrast.css`
- `light-tritanopia.css`
- `light-tritanopia-high-contrast.css`
- `dark.css`
- `dark-colorblind.css`
- `dark-colorblind-high-contrast.css`
- `dark-dimmed.css`
- `dark-dimmed-high-contrast.css`
- `dark-high-contrast.css`
- `dark-tritanopia.css`
- `dark-tritanopia-high-contrast.css`

Available automatic theme pairs:

- `auto.css`: `light` + `dark`
- `auto-colorblind.css`: `light-colorblind` + `dark-colorblind`
- `auto-high-contrast.css`: `light-high-contrast` + `dark-high-contrast`
- `auto-tritanopia.css`: `light-tritanopia` + `dark-tritanopia`
- `auto-colorblind-high-contrast.css`: `light-colorblind-high-contrast` + `dark-colorblind-high-contrast`
- `auto-tritanopia-high-contrast.css`: `light-tritanopia-high-contrast` + `dark-tritanopia-high-contrast`
- `auto-dimmed.css`: `light` + `dark-dimmed`
- `auto-dimmed-high-contrast.css`: `light-high-contrast` + `dark-dimmed-high-contrast`

## SCSS

If you want to mount tokens onto your own selectors, use the SCSS entry and define explicit targets. `container` only receives the theme-independent base tokens. Each `selectors` entry is emitted as written, so include the final editor or overlay selector yourself.

```scss
@use 'bytemd-theme-editor-github/scss' as editor;

@include editor.render-theme-tokens(
  (
    targets: (
      (
        container: '.bytemd',
        modes: (
          light: (
            selectors: ("[data-color-mode='light'][data-light-theme='light'] .bytemd"),
            tokens: 'light',
          ),
          light-auto: (
            selectors: ("[data-color-mode='auto'][data-light-theme='light'] .bytemd"),
            tokens: 'light',
            media: '(prefers-color-scheme: light)',
          ),
          dark: (
            selectors: ("[data-color-mode='dark'][data-dark-theme='dark'] .bytemd"),
            tokens: 'dark',
          ),
          dark-auto: (
            selectors: ("[data-color-mode='auto'][data-dark-theme='dark'] .bytemd"),
            tokens: 'dark',
            media: '(prefers-color-scheme: dark)',
          ),
        )
      ),
      (
        container: '.tippy-box',
        modes: (
          light: (
            selectors: (
              "[data-color-mode='light'][data-light-theme='light'] .tippy-box[data-theme~='light-border']",
              "body:has(#root > [data-color-mode='light'][data-light-theme='light']) .tippy-box:not([data-theme~='light-border'])"
            ),
            tokens: 'light',
          ),
          light-auto: (
            selectors: (
              "body:has(#root > [data-color-mode='auto'][data-light-theme='light']) .tippy-box:not([data-theme~='light-border'])"
            ),
            tokens: 'light',
            media: '(prefers-color-scheme: light)',
          ),
          dark: (
            selectors: (
              "[data-color-mode='dark'][data-dark-theme='dark'] .tippy-box[data-theme~='light-border']",
              "body:has(#root > [data-color-mode='dark'][data-dark-theme='dark']) .tippy-box:not([data-theme~='light-border'])"
            ),
            tokens: 'dark',
          ),
          dark-auto: (
            selectors: (
              "body:has(#root > [data-color-mode='auto'][data-dark-theme='dark']) .tippy-box:not([data-theme~='light-border'])"
            ),
            tokens: 'dark',
            media: '(prefers-color-scheme: dark)',
          ),
        )
      ),
    ),
  )
);

@include editor.render-rules();
```

The example above generates this theme structure:

```css
.bytemd,
.tippy-box {
  /* base token */
}

[data-color-mode='light'][data-light-theme='light'] .bytemd,
[data-color-mode='light'][data-light-theme='light'] .tippy-box[data-theme~='light-border'],
body:has(#root > [data-color-mode='light'][data-light-theme='light']) .tippy-box:not([data-theme~='light-border']) {
  /* light theme token */
}

@media (prefers-color-scheme: light) {
  [data-color-mode='auto'][data-light-theme='light'] .bytemd,
  body:has(#root > [data-color-mode='auto'][data-light-theme='light']) .tippy-box:not([data-theme~='light-border']) {
    /* light theme token */
  }
}
```

Use multiple items in `selectors` when one token group needs more than one target:

```scss
selectors: ('.editor-shell .bytemd', 'body:has(.editor-shell) .tippy-box');
```

This outputs one comma-separated selector group without combining the selectors with `container`.

## Patch Sources

Individual patch sources are published under `patchs/` for advanced composition:

```scss
@use 'bytemd-theme-editor-github/patchs/editor.scss' as editor;
@use 'bytemd-theme-editor-github/patchs/tippy-toolbar.scss' as tippy-toolbar;
@use 'bytemd-theme-editor-github/patchs/tippy-tooltip.scss' as tippy-tooltip;

@include editor.render-editor();
@include tippy-toolbar.render-tippy-toolbar();
@include tippy-tooltip.render-tippy-tooltip();
```

To add a new patch, create a new `src/patchs/<name>.scss` file, expose a matching `render-<name>()` mixin, import it from `src/patchs/index.scss`, and run the package build.

## License

MIT License © [Frankie](https://github.com/tofrankie)
