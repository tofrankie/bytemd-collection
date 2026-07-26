# bytemd-plugin-mermaid

[![npm version](https://img.shields.io/npm/v/bytemd-plugin-mermaid)](https://www.npmjs.com/package/bytemd-plugin-mermaid) [![npm package license](https://img.shields.io/npm/l/bytemd-plugin-mermaid)](https://github.com/tofrankie/bytemd-plugin/blob/main/packages/mermaid/LICENSE) [![npm last update](https://img.shields.io/npm/last-update/bytemd-plugin-mermaid)](https://www.npmjs.com/package/bytemd-plugin-mermaid)

A bytemd plugin that supports [Mermaid](https://mermaid.ai/open-source/syntax/examples.html) diagram.

## Usage

```bash
pnpm add bytemd @bytemd/react bytemd-plugin-mermaid
```

````js
import { Editor } from '@bytemd/react'
import mermaid from 'bytemd-plugin-mermaid'
import { useState } from 'react'
import 'bytemd/dist/index.css'

const plugins = [
  mermaid({
    // More Options: https://mermaid.ai/open-source/config/schema-docs/config.html
    // theme: 'dark',
  }),
]

export default function App() {
  const [value, setValue] = useState('```mermaid\nflowchart TD\nA[Dark mode] --> B[Mermaid]\n```')

  return <Editor value={value} plugins={plugins} onChange={setValue} />
}
````

## Credits

Forked from [@bytemd/plugin-mermaid](https://github.com/pd4d10/bytemd/tree/main/packages/plugin-mermaid) ❤️

## License

MIT License © [Frankie](https://github.com/tofrankie)
