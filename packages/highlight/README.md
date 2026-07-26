# @tofrankie/bytemd-plugin-highlight

[![npm version](https://img.shields.io/npm/v/@tofrankie/bytemd-plugin-highlight)](https://www.npmjs.com/package/@tofrankie/bytemd-plugin-highlight) [![npm package license](https://img.shields.io/npm/l/@tofrankie/bytemd-plugin-highlight)](https://github.com/tofrankie/bytemd-plugin/blob/main/LICENSE)

ByteMD plugin for highlighting code blocks with [highlight.js](https://highlightjs.org/).

## Usage

```bash
pnpm add bytemd @bytemd/react @tofrankie/bytemd-plugin-highlight highlight.js
```

````jsx
import { Editor } from '@bytemd/react'
import highlight from '@tofrankie/bytemd-plugin-highlight'
import { useState } from 'react'
import 'bytemd/dist/index.css'
import 'highlight.js/styles/github.css'

const plugins = [highlight()]

export default function App() {
  const [value, setValue] = useState('```js\nconsole.log("Hello, ByteMD!")\n```')

  return <Editor value={value} plugins={plugins} onChange={setValue} />
}
````

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

## License

MIT License © [Frankie](https://github.com/tofrankie)
