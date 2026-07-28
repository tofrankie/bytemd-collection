# bytemd-plugin-gfm

[![npm version](https://img.shields.io/npm/v/bytemd-plugin-gfm)](https://www.npmjs.com/package/bytemd-plugin-gfm) [![npm package license](https://img.shields.io/npm/l/bytemd-plugin-gfm)](https://github.com/tofrankie/bytemd-collection/blob/main/packages/plugin-gfm/LICENSE) [![npm last update](https://img.shields.io/npm/last-update/bytemd-plugin-gfm)](https://www.npmjs.com/package/bytemd-plugin-gfm)

A bytemd plugin for GitHub Flavored Markdown, including autolink literals, strikethrough, tables, and task lists.

## Usage

```bash
pnpm add bytemd @bytemd/react bytemd-plugin-gfm
```

```js
import { Editor } from '@bytemd/react'
import gfm from 'bytemd-plugin-gfm'
import { useState } from 'react'
import 'bytemd/dist/index.css'

const plugins = [gfm()]

export default function App() {
  const [value, setValue] = useState('')

  return <Editor value={value} plugins={plugins} onChange={setValue} />
}
```

## Credits

Based on [@bytemd/plugin-gfm](https://github.com/pd4d10/bytemd/tree/main/packages/plugin-gfm) ❤️

## License

MIT License © [Frankie](https://github.com/tofrankie)
