# @tofrankie/bytemd-plugin-highlight

[![npm version](https://img.shields.io/npm/v/@tofrankie/bytemd-plugin-highlight)](https://www.npmjs.com/package/@tofrankie/bytemd-plugin-highlight) [![npm package license](https://img.shields.io/npm/l/@tofrankie/bytemd-plugin-highlight)](https://github.com/tofrankie/bytemd-plugin/blob/main/packages/highlight/LICENSE) [![npm last update](https://img.shields.io/npm/last-update/bytemd-plugin-mermaid)](https://www.npmjs.com/package/@tofrankie/bytemd-plugin-highlight)

ByteMD plugin for highlighting code blocks with [highlight.js](https://highlightjs.org/).

## Usage

```bash
pnpm add bytemd @bytemd/react @tofrankie/bytemd-plugin-highlight
```

````jsx
import { Editor } from '@bytemd/react'
import highlight from '@tofrankie/bytemd-plugin-highlight'
import { useState } from 'react'
import 'bytemd/dist/index.css'
import '@tofrankie/bytemd-plugin-highlight/styles/github.css'

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

## Bundled Styles

This package republishes a small subset of `highlight.js` themes so you can import them directly from the plugin package.

```js
import '@tofrankie/bytemd-plugin-highlight/styles/default.css'
import '@tofrankie/bytemd-plugin-highlight/styles/dark.css'
import '@tofrankie/bytemd-plugin-highlight/styles/github.css'
import '@tofrankie/bytemd-plugin-highlight/styles/github-dark.css'
import '@tofrankie/bytemd-plugin-highlight/styles/github-dark-dimmed.css'
```

SCSS sources are also available:

```scss
@use '@tofrankie/bytemd-plugin-highlight/scss/default';
@use '@tofrankie/bytemd-plugin-highlight/scss/dark';
@use '@tofrankie/bytemd-plugin-highlight/scss/github';
@use '@tofrankie/bytemd-plugin-highlight/scss/github-dark';
@use '@tofrankie/bytemd-plugin-highlight/scss/github-dark-dimmed';
```

## License

MIT License © [Frankie](https://github.com/tofrankie)
