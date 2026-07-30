# bytemd-plugin-math

[![npm version](https://img.shields.io/npm/v/bytemd-plugin-math)](https://www.npmjs.com/package/bytemd-plugin-math) [![npm package license](https://img.shields.io/npm/l/bytemd-plugin-math)](https://github.com/tofrankie/bytemd-collection/blob/main/packages/plugin-math/LICENSE) [![npm last update](https://img.shields.io/npm/last-update/bytemd-plugin-math)](https://www.npmjs.com/package/bytemd-plugin-math)

A bytemd plugin for rendering math formulae with [KaTeX](https://github.com/KaTeX/KaTeX).

This package also publishes `bytemd-plugin-math/styles/katex.css`, so you can import KaTeX styles directly from the plugin package instead of reaching for `katex/dist/katex.css`.

The bundled styles ship with the required font assets under `dist/styles/fonts/`.

## Usage

```bash
pnpm add bytemd @bytemd/react bytemd-plugin-math
```

```jsx
import { Editor } from '@bytemd/react'
import math from 'bytemd-plugin-math'
import { useState } from 'react'
import 'bytemd/dist/index.css'
import 'bytemd-plugin-math/styles/katex.css'

const plugins = [math()]

export default function App() {
  const [value, setValue] = useState('$E=mc^2$')

  return <Editor value={value} plugins={plugins} onChange={setValue} />
}
```

## Options

You can pass `locale` and `katexOptions` to customize toolbar labels and KaTeX rendering behavior.

```js
const plugins = [
  math({
    katexOptions: {
      macros: {
        '\\RR': '\\mathbb{R}',
      },
    },
  }),
]
```

## Credits ❤️

Based on [@bytemd/plugin-math](https://github.com/pd4d10/bytemd/tree/main/packages/plugin-math)

Powered by [KaTeX](https://github.com/KaTeX/KaTeX)

## License

MIT License © [Frankie](https://github.com/tofrankie)
