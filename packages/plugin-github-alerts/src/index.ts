import type { BytemdPlugin } from 'bytemd'

type AlertType = 'note' | 'tip' | 'important' | 'warning' | 'caution'

type LocaleMap = Partial<Record<AlertType, string>>

interface GenericNode {
  type: string
  value?: string
  tagName?: string
  children?: GenericNode[]
  properties?: Record<string, any>
  data?: Record<string, any>
}

export interface BytemdPluginAlertsOptions {
  locale?: LocaleMap
  classPrefix?: string
}

const DEFAULT_MARKERS = ['TIP', 'NOTE', 'IMPORTANT', 'WARNING', 'CAUTION'] as const

const DEFAULT_TITLES: Record<AlertType, string> = {
  note: 'Note',
  tip: 'Tip',
  important: 'Important',
  warning: 'Warning',
  caution: 'Caution',
}

export default function alerts(options: BytemdPluginAlertsOptions = {}): BytemdPlugin {
  return {
    remark: processor => processor.use(createRemarkPlugin(options) as any),
    rehype: processor => processor.use(createRehypePlugin() as any),
  }
}

function createRemarkPlugin(options: BytemdPluginAlertsOptions = {}) {
  const classPrefix = options.classPrefix || 'markdown-alert'
  const titles: Record<AlertType, string> = {
    ...DEFAULT_TITLES,
    ...(options.locale || {}),
  }

  return () => {
    return (tree: GenericNode) => {
      walk(tree, node => {
        if (node.type !== 'blockquote' || !node.children || node.children.length === 0) return

        const firstParagraph = node.children[0]
        if (!firstParagraph || firstParagraph.type !== 'paragraph' || !firstParagraph.children)
          return

        const firstInline = firstParagraph.children[0]
        if (!firstInline || firstInline.type !== 'text' || typeof firstInline.value !== 'string')
          return

        const matched = tryMatchAlert(firstInline.value)
        if (!matched) return

        const title = matched.titleText || titles[matched.type]

        firstInline.value = firstInline.value.slice(matched.markerRaw.length).trimStart()

        node.data = {
          hName: 'div',
          hProperties: {
            className: [classPrefix, `${classPrefix}-${matched.type}`],
          },
        }

        node.children = [createTitleParagraph(classPrefix, matched.type, title), ...node.children]
      })
    }
  }
}

function walk(node: GenericNode, fn: (node: GenericNode) => void) {
  fn(node)
  if (!node.children || node.children.length === 0) return
  node.children.forEach(child => walk(child, fn))
}

function tryMatchAlert(
  text: string
): { type: AlertType; titleText: string; markerRaw: string } | null {
  const re = new RegExp(`^\\[!(${DEFAULT_MARKERS.join('|')})\\]([^\\n\\r]*)`, 'i')
  const match = text.match(re)
  if (!match) return null

  const type = match[1].toLowerCase() as AlertType
  const titleText = match[2]?.trim() || ''

  return { type, titleText, markerRaw: match[0] }
}

function createTitleParagraph(classPrefix: string, type: AlertType, title: string): GenericNode {
  return {
    type: 'paragraph',
    data: {
      hName: 'p',
      hProperties: {
        className: [`${classPrefix}-title`],
      },
    },
    children: [
      {
        type: 'emphasis',
        data: {
          hName: 'span',
          hProperties: {
            className: ['octicon', `octicon-${type}`],
          },
        },
        children: [],
      },
      {
        type: 'text',
        value: title,
      },
    ],
  }
}

const SVG_PATHS: Record<AlertType, string> = {
  note: 'M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z',
  tip: 'M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM6 15.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z',
  important:
    'M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z',
  warning:
    'M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z',
  caution:
    'M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z',
}

function createRehypePlugin() {
  return () => {
    return (tree: GenericNode) => {
      walk(tree, node => {
        if (node.type !== 'element' || node.tagName !== 'span' || !node.properties) return

        const className = node.properties.className
        const classes = Array.isArray(className)
          ? className.map(x => String(x))
          : typeof className === 'string'
            ? className.split(/\s+/)
            : []

        const matchedClass = classes.find(x => x.startsWith('octicon-'))
        if (!matchedClass) return

        const iconType = matchedClass.slice('octicon-'.length) as AlertType
        if (!(iconType in SVG_PATHS)) return

        node.tagName = 'svg'
        node.properties = {
          className: classes,
          viewBox: '0 0 16 16',
          version: '1.1',
          width: '16',
          height: '16',
          'aria-hidden': 'true',
        }
        node.children = [
          {
            type: 'element',
            tagName: 'path',
            properties: {
              d: SVG_PATHS[iconType],
            },
            children: [],
          },
        ]
      })
    }
  }
}
