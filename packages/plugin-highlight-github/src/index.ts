import type { BytemdPlugin } from 'bytemd'
import type HighlightJs from 'highlight.js'

export interface BytemdPluginHighlightOptions {
  init?: (hljs: typeof HighlightJs) => void | Promise<void>
}

export default function highlight({ init }: BytemdPluginHighlightOptions = {}): BytemdPlugin {
  let loadHighlight: Promise<typeof HighlightJs> | undefined

  return {
    viewerEffect({ markdownBody }) {
      const elements = markdownBody.querySelectorAll<HTMLElement>('pre > code')

      if (elements.length === 0) return

      loadHighlight ??= import('highlight.js').then(async ({ default: hljs }) => {
        await init?.(hljs)
        return hljs
      })

      void loadHighlight.then(hljs => {
        elements.forEach(element => {
          hljs.highlightElement(element)
        })
      })
    },
  }
}
