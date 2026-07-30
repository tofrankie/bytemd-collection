# @tofrankie/bytemd-plugin-highlight

[![npm version](https://img.shields.io/npm/v/@tofrankie/bytemd-plugin-highlight)](https://www.npmjs.com/package/@tofrankie/bytemd-plugin-highlight) [![npm package license](https://img.shields.io/npm/l/@tofrankie/bytemd-plugin-highlight)](https://github.com/tofrankie/bytemd-collection/blob/main/packages/plugin-highlight/LICENSE) [![npm last update](https://img.shields.io/npm/last-update/@tofrankie/bytemd-plugin-highlight)](https://www.npmjs.com/package/@tofrankie/bytemd-plugin-highlight)

A bytemd plugin for syntax highlighting, plus bundled Primer-based theme styles.

> [!IMPORTANT]
> Migrate to [bytemd-plugin-highlight-github](https://www.npmjs.com/package/bytemd-plugin-highlight-github)

## Usage

```bash
pnpm add bytemd @bytemd/react @tofrankie/bytemd-plugin-highlight
```

````jsx
import { Editor } from '@bytemd/react'
import highlight from '@tofrankie/bytemd-plugin-highlight'
import { useState } from 'react'
import 'bytemd/dist/index.css'
import '@tofrankie/bytemd-plugin-highlight/styles/light.css'

const plugins = [highlight()]

export default function App() {
  const [value, setValue] = useState('```js\nconsole.log("Hello, bytemd!")\n```')

  return <Editor value={value} plugins={plugins} onChange={setValue} />
}
````

## Themes

This package publishes generated CSS themes based on `@primer/primitives`, so you can import them directly from the plugin package.

```js
import '@tofrankie/bytemd-plugin-highlight/styles/light.css'
import '@tofrankie/bytemd-plugin-highlight/styles/dark.css'
```

Available themes:

Light themes:

- `light.css`
- `light-colorblind.css`
- `light-colorblind-high-contrast.css`
- `light-high-contrast.css`
- `light-tritanopia.css`
- `light-tritanopia-high-contrast.css`

Dark themes:

- `dark.css`
- `dark-colorblind.css`
- `dark-colorblind-high-contrast.css`
- `dark-dimmed.css`
- `dark-dimmed-high-contrast.css`
- `dark-high-contrast.css`
- `dark-tritanopia.css`
- `dark-tritanopia-high-contrast.css`

If you want to keep theme variables and highlight rules separate, import `pure.css` and provide the `--prettylights-*` variables yourself:

```js
import '@tofrankie/bytemd-plugin-highlight/styles/pure.css'
```

## Custom Languages

Use `init` to register languages or configure the shared `highlight.js` instance before the first code block is highlighted.

```js
const plugins = [
  highlight({
    init(hljs) {
      hljs.configure({ ignoreUnescapedHTML: true })
    },
  }),
]
```

## Credits ❤️

Based on [@bytemd/plugin-highlight](https://github.com/pd4d10/bytemd/tree/main/packages/plugin-highlight)

Theme tokens and color system are powered by [@primer/primitives](https://github.com/primer/primitives)

## License

MIT License © [Frankie](https://github.com/tofrankie)
