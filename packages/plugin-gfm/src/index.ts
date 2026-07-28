import type { BytemdPlugin } from 'bytemd'
import type { Options } from 'remark-gfm'
import * as remarkGfmModule from 'remark-gfm'
import { icons } from './icons'
import en from './locales/en.json'

interface Locale {
  strike: string
  strikeText: string
  task: string
  taskText: string
  table: string
  tableHeading: string
}

export interface BytemdPluginGfmOptions extends Options {
  locale?: Partial<Locale>
}

// `remark-gfm` may be exposed differently across ESM/CJS build outputs, so we
// normalize it here before passing it to `processor.use(...)`.
function resolveRemarkGfm() {
  const candidate = remarkGfmModule as unknown as {
    default?: unknown
  }

  if (typeof candidate.default === 'function') {
    return candidate.default as typeof import('remark-gfm').default
  }

  if (
    candidate.default &&
    typeof (candidate.default as { default?: unknown }).default === 'function'
  ) {
    return (candidate.default as { default: typeof import('remark-gfm').default }).default
  }

  return remarkGfmModule as unknown as typeof import('remark-gfm').default
}

const remarkGfm = resolveRemarkGfm()

export default function gfm({
  locale: _locale,
  ...remarkGfmOptions
}: BytemdPluginGfmOptions = {}): BytemdPlugin {
  const locale = { ...en, ..._locale } as Locale

  return {
    remark: processor => processor.use(remarkGfm, remarkGfmOptions),
    actions: [
      {
        title: locale.strike,
        icon: icons.Strikethrough,
        cheatsheet: `~~${locale.strikeText}~~`,
        handler: {
          type: 'action',
          click({ wrapText, editor }) {
            wrapText('~~')
            editor.focus()
          },
        },
      },
      {
        title: locale.task,
        icon: icons.CheckCorrect,
        cheatsheet: `- [ ] ${locale.taskText}`,
        handler: {
          type: 'action',
          click({ replaceLines, editor }) {
            replaceLines(line => `- [ ] ${line}`)
            editor.focus()
          },
        },
      },
      {
        title: locale.table,
        icon: icons.InsertTable,
        handler: {
          type: 'action',
          click({ editor, appendBlock, codemirror }) {
            const { line } = appendBlock(`| ${locale.tableHeading} |  |\n| --- | --- |\n|  |  |\n`)
            editor.setSelection(
              codemirror.Pos(line, 2),
              codemirror.Pos(line, 2 + locale.tableHeading.length)
            )
            editor.focus()
          },
        },
      },
    ],
  }
}
