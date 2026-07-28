# bytemd-plugin-github-alerts

[![npm version](https://img.shields.io/npm/v/bytemd-plugin-github-alerts)](https://www.npmjs.com/package/bytemd-plugin-github-alerts) [![npm package license](https://img.shields.io/npm/l/bytemd-plugin-github-alerts)](https://github.com/tofrankie/bytemd-collection/blob/main/packages/github-alerts/LICENSE) [![npm last update](https://img.shields.io/npm/last-update/bytemd-plugin-github-alerts)](https://www.npmjs.com/package/bytemd-plugin-github-alerts)

A bytemd plugin for rendering [GitHub Alerts](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts).

## Preview

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.

```
> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.
```

## Usage

```bash
pnpm add bytemd @bytemd/react bytemd-plugin-github-alerts
```

```js
import { Editor } from '@bytemd/react'
import alerts from 'bytemd-plugin-github-alerts'
import 'bytemd/dist/index.css'
import 'bytemd-plugin-github-alerts/index.css'

const plugins = [
  alerts(), // must be placed before @bytemd/plugin-breaks
  // Add more plugins here
]

export default function App() {
  const [value, setValue] = useState('')

  return <Editor value={value} plugins={plugins} onChange={setValue} />
}
```

## Credits

Inspired by [antfu/markdown-it-github-alerts](https://github.com/antfu/markdown-it-github-alerts) ❤️

## License

MIT License © [Frankie](https://github.com/tofrankie)
