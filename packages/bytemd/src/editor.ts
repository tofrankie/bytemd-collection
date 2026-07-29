import type { Extension } from '@codemirror/state'
import type {
  BytemdAction,
  BytemdEditorContext,
  BytemdLocale,
  BytemdPlugin,
  EditorProps,
} from './types'
import { history, historyKeymap, indentLess, indentMore, redo, undo } from '@codemirror/commands'
import { insertNewlineContinueMarkup, markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { indentUnit } from '@codemirror/language'
import { Compartment, EditorSelection, EditorState } from '@codemirror/state'
import { EditorView, keymap, placeholder as placeholderExtension } from '@codemirror/view'
import selectFiles from 'select-files'
import { icons } from './icons'

export interface BytemdPosition {
  line: number
  ch: number
}

export interface BytemdSelectionRange {
  from: () => BytemdPosition
  to: () => BytemdPosition
}

export interface BytemdCodeMirrorCompat {
  Pos: (line: number, ch?: number) => BytemdPosition
}

export interface BytemdEditorConfig {
  extensions?: Extension[]
  tabSize?: number
  indentUnit?: number
  lineWrapping?: boolean
  autofocus?: boolean
  editable?: boolean
}

interface EditorEventMap {
  change: () => void
  scroll: () => void
  drop: (_instance: BytemdEditorAdapter, event: DragEvent) => void
  paste: (_instance: BytemdEditorAdapter, event: ClipboardEvent) => void
}

type EditorEventName = keyof EditorEventMap

type EditorFactory = ((element: HTMLElement, options?: BytemdEditorInit) => BytemdEditorAdapter) &
  BytemdCodeMirrorCompat

interface BytemdEditorInit extends BytemdEditorConfig {
  value?: string
  placeholder?: string
}

const codeMirrorCompat: BytemdCodeMirrorCompat = {
  Pos(line, ch = 0) {
    return { line, ch }
  },
}

const shortcutPriority = ['Mod', 'Shift', 'Alt']

function normalizeShortcut(shortcut: string) {
  const parts = shortcut.split('-').filter(Boolean)
  const key = parts.pop()
  if (!key) return shortcut

  const modifiers = parts
    .map(part => {
      if (part === 'Cmd' || part === 'Ctrl') return 'Mod'
      return part
    })
    .sort((a, b) => shortcutPriority.indexOf(a) - shortcutPriority.indexOf(b))

  const normalizedKey = key.length === 1 ? key.toLowerCase() : key

  return [...modifiers, normalizedKey].join('-')
}

function isWordChar(char: string) {
  return /[\p{L}\p{N}_]/u.test(char)
}

export class BytemdEditorAdapter {
  readonly keyMapCompartment = new Compartment()
  readonly tabSizeCompartment = new Compartment()
  readonly indentUnitCompartment = new Compartment()
  readonly lineWrappingCompartment = new Compartment()
  readonly placeholderCompartment = new Compartment()
  readonly editableCompartment = new Compartment()
  readonly userExtensionsCompartment = new Compartment()
  readonly view: EditorView

  private readonly listeners: {
    [K in EditorEventName]: Set<EditorEventMap[K]>
  } = {
    change: new Set(),
    scroll: new Set(),
    drop: new Set(),
    paste: new Set(),
  }

  private readonly domCleanup: Array<() => void> = []
  private readonly dynamicKeyMaps = new Map<object, Extension>()

  constructor(parent: HTMLElement, options: BytemdEditorInit = {}) {
    const updateListener = EditorView.updateListener.of(update => {
      if (update.docChanged) {
        this.listeners.change.forEach(listener => listener())
      }
    })

    this.view = new EditorView({
      parent,
      state: EditorState.create({
        doc: options.value ?? '',
        extensions: [
          history(),
          markdown({
            base: markdownLanguage,
            addKeymap: false,
          }),
          keymap.of([
            ...historyKeymap,
            {
              key: 'Mod-z',
              run: undo,
            },
            {
              key: 'Mod-Shift-z',
              run: redo,
            },
            {
              key: 'Tab',
              run: indentMore,
              shift: indentLess,
            },
            {
              key: 'Enter',
              run: insertNewlineContinueMarkup,
            },
          ]),
          this.keyMapCompartment.of([]),
          this.tabSizeCompartment.of(EditorState.tabSize.of(options.tabSize ?? 8)),
          this.indentUnitCompartment.of(indentUnit.of(' '.repeat(options.indentUnit ?? 4))),
          this.lineWrappingCompartment.of(
            options.lineWrapping === false ? [] : EditorView.lineWrapping
          ),
          this.placeholderCompartment.of(
            options.placeholder ? placeholderExtension(options.placeholder) : []
          ),
          this.editableCompartment.of(EditorView.editable.of(options.editable !== false)),
          this.userExtensionsCompartment.of(options.extensions ?? []),
          updateListener,
        ],
      }),
    })

    ;(this.view.dom as unknown as Record<string, unknown>).CodeMirror = this

    const onScroll = () => {
      this.listeners.scroll.forEach(listener => listener())
    }
    this.view.scrollDOM.addEventListener('scroll', onScroll, { passive: true })
    this.domCleanup.push(() => this.view.scrollDOM.removeEventListener('scroll', onScroll))

    const onDrop = (event: DragEvent) => {
      this.listeners.drop.forEach(listener => listener(this, event))
    }
    this.view.dom.addEventListener('drop', onDrop)
    this.domCleanup.push(() => this.view.dom.removeEventListener('drop', onDrop))

    const onPaste = (event: ClipboardEvent) => {
      this.listeners.paste.forEach(listener => listener(this, event))
    }
    this.view.dom.addEventListener('paste', onPaste)
    this.domCleanup.push(() => this.view.dom.removeEventListener('paste', onPaste))

    if (options.autofocus) {
      queueMicrotask(() => this.focus())
    }
  }

  getValue() {
    return this.view.state.doc.toString()
  }

  setValue(value: string) {
    this.view.dispatch({
      changes: {
        from: 0,
        to: this.view.state.doc.length,
        insert: value,
      },
    })
  }

  focus() {
    this.view.focus()
  }

  getCursor() {
    return this.offsetToPos(this.view.state.selection.main.head)
  }

  setSelection(anchor: BytemdPosition, head = anchor) {
    this.view.dispatch({
      selection: EditorSelection.range(this.posToOffset(anchor), this.posToOffset(head)),
      scrollIntoView: true,
    })
  }

  somethingSelected() {
    return this.view.state.selection.ranges.some(range => !range.empty)
  }

  listSelections(): BytemdSelectionRange[] {
    return this.view.state.selection.ranges.map(range => ({
      from: () => this.offsetToPos(range.from),
      to: () => this.offsetToPos(range.to),
    }))
  }

  findWordAt(pos: BytemdPosition): BytemdSelectionRange {
    const line = this.view.state.doc.line(Math.min(pos.line + 1, this.view.state.doc.lines))
    const text = line.text
    const ch = Math.max(0, Math.min(pos.ch, text.length))

    let start = ch
    let end = ch

    while (start > 0 && isWordChar(text[start - 1])) start--
    while (end < text.length && isWordChar(text[end])) end++

    return {
      from: () => ({ line: line.number - 1, ch: start }),
      to: () => ({ line: line.number - 1, ch: end }),
    }
  }

  getRange(from: BytemdPosition, to: BytemdPosition) {
    return this.view.state.doc.sliceString(this.posToOffset(from), this.posToOffset(to))
  }

  replaceRange(text: string, from: BytemdPosition, to = from) {
    this.view.dispatch({
      changes: {
        from: this.posToOffset(from),
        to: this.posToOffset(to),
        insert: text,
      },
    })
  }

  lineCount() {
    return this.view.state.doc.lines
  }

  getLine(line: number) {
    return this.view.state.doc.line(Math.min(line + 1, this.view.state.doc.lines)).text
  }

  addKeyMap(map: Record<string, () => void>) {
    const extension = keymap.of(
      Object.entries(map).map(([shortcut, run]) => ({
        key: normalizeShortcut(shortcut),
        run: () => {
          run()
          return true
        },
      }))
    )

    this.dynamicKeyMaps.set(map, extension)
    this.reconfigureKeyMaps()
  }

  removeKeyMap(map: Record<string, () => void>) {
    if (!this.dynamicKeyMaps.delete(map)) return
    this.reconfigureKeyMaps()
  }

  setOption(_name: string, _value: unknown) {}

  setSize(_width: number | null, _height: number | null) {
    this.view.requestMeasure()
  }

  getScrollInfo() {
    return {
      top: this.view.scrollDOM.scrollTop,
      height: this.view.scrollDOM.scrollHeight,
      clientHeight: this.view.scrollDOM.clientHeight,
    }
  }

  heightAtLine(line: number) {
    const offset = this.posToOffset({ line, ch: 0 })
    return this.view.lineBlockAt(offset).top
  }

  scrollTo(_x: number | null, y: number | null) {
    this.view.scrollDOM.scrollTo({
      top: y ?? 0,
    })
  }

  on<K extends EditorEventName>(event: K, handler: EditorEventMap[K]) {
    this.listeners[event].add(handler)
  }

  applyConfig(config: BytemdEditorInit = {}) {
    this.view.dispatch({
      effects: [
        this.tabSizeCompartment.reconfigure(EditorState.tabSize.of(config.tabSize ?? 8)),
        this.indentUnitCompartment.reconfigure(indentUnit.of(' '.repeat(config.indentUnit ?? 4))),
        this.lineWrappingCompartment.reconfigure(
          config.lineWrapping === false ? [] : EditorView.lineWrapping
        ),
        this.placeholderCompartment.reconfigure(
          config.placeholder ? placeholderExtension(config.placeholder) : []
        ),
        this.editableCompartment.reconfigure(EditorView.editable.of(config.editable !== false)),
        this.userExtensionsCompartment.reconfigure(config.extensions ?? []),
      ],
    })
  }

  destroy() {
    this.domCleanup.forEach(cleanup => cleanup())
    this.view.destroy()
  }

  private posToOffset(pos: BytemdPosition) {
    const lineNumber = Math.max(
      1,
      Math.min(this.view.state.doc.lines, Number.isFinite(pos.line) ? Math.floor(pos.line) + 1 : 1)
    )
    const line = this.view.state.doc.line(lineNumber)
    return line.from + Math.max(0, Math.min(line.length, Math.floor(pos.ch || 0)))
  }

  private offsetToPos(offset: number): BytemdPosition {
    const line = this.view.state.doc.lineAt(offset)
    return {
      line: line.number - 1,
      ch: offset - line.from,
    }
  }

  private reconfigureKeyMaps() {
    this.view.dispatch({
      effects: this.keyMapCompartment.reconfigure([...this.dynamicKeyMaps.values()]),
    })
  }
}

export function createCodeMirror(): EditorFactory {
  const factory = ((element: HTMLElement, options: BytemdEditorInit = {}) => {
    return new BytemdEditorAdapter(element, options)
  }) as EditorFactory

  factory.Pos = codeMirrorCompat.Pos

  return factory
}

export type EditorUtils = ReturnType<typeof createEditorUtils>

export function createEditorUtils(codemirror: BytemdCodeMirrorCompat, editor: BytemdEditorAdapter) {
  return {
    /**
     * Wrap text with decorators, for example:
     *
     * `text -> *text*`
     */
    wrapText(before: string, after = before) {
      const range = editor.somethingSelected()
        ? editor.listSelections()[0] // only handle the first selection
        : editor.findWordAt(editor.getCursor())

      const from = range.from() // use from/to instead of anchor/head for reverse select
      const to = range.to()
      const text = editor.getRange(from, to)
      const fromBefore = codemirror.Pos(from.line, from.ch - before.length)
      const toAfter = codemirror.Pos(to.line, to.ch + after.length)

      if (editor.getRange(fromBefore, from) === before && editor.getRange(to, toAfter) === after) {
        editor.replaceRange(text, fromBefore, toAfter)
        editor.setSelection(
          fromBefore,
          codemirror.Pos(fromBefore.line, fromBefore.ch + text.length)
        )
      } else {
        editor.replaceRange(before + text + after, from, to)
        const cursor = editor.getCursor()
        editor.setSelection(
          codemirror.Pos(cursor.line, cursor.ch - after.length - text.length),
          codemirror.Pos(cursor.line, cursor.ch - after.length)
        )
      }
    },
    /**
     * replace multiple lines
     *
     * `line -> # line`
     */
    replaceLines(replace: Parameters<Array<string>['map']>[0]) {
      const [selection] = editor.listSelections()

      const range = [
        codemirror.Pos(selection.from().line, 0),
        codemirror.Pos(selection.to().line),
      ] as const
      const lines = editor.getRange(...range).split('\n')
      editor.replaceRange(lines.map(replace).join('\n'), ...range)
      editor.setSelection(...range)
    },
    /**
     * Append a block based on the cursor position
     */
    appendBlock(content: string): BytemdPosition {
      const cursor = editor.getCursor()
      // find the first blank line

      let emptyLine = -1
      for (let i = cursor.line; i < editor.lineCount(); i++) {
        if (!editor.getLine(i).trim()) {
          emptyLine = i
          break
        }
      }
      if (emptyLine === -1) {
        // insert a new line to the bottom
        editor.replaceRange('\n', codemirror.Pos(editor.lineCount()))
        emptyLine = editor.lineCount()
      }

      editor.replaceRange(`\n${content}`, codemirror.Pos(emptyLine))
      return codemirror.Pos(emptyLine + 1, 0)
    },
    /**
     * Triggers a virtual file input and let user select files
     *
     * https://www.npmjs.com/package/select-files
     */
    selectFiles,
  }
}

export function findStartIndex(num: number, nums: number[]) {
  let startIndex = nums.length - 2
  for (let i = 0; i < nums.length; i++) {
    if (num < nums[i]) {
      startIndex = i - 1
      break
    }
  }
  startIndex = Math.max(startIndex, 0)
  return startIndex
}

function getShortcutWithPrefix(key: string, shift = false) {
  const shiftPrefix = shift ? 'Shift-' : ''
  const cmdPrefix =
    typeof navigator !== 'undefined' && /Mac/.test(navigator.platform) ? 'Cmd-' : 'Ctrl-'
  return shiftPrefix + cmdPrefix + key
}

export async function handleImageUpload(
  { editor, appendBlock, codemirror }: BytemdEditorContext,
  uploadImages: NonNullable<EditorProps['uploadImages']>,
  files: File[]
) {
  const imgs = await uploadImages(files)
  const pos = appendBlock(
    imgs
      .map(({ url, alt, title }, i) => {
        alt = alt ?? files[i].name
        return `![${alt}](${url}${title ? ` "${title}"` : ''})`
      })
      .join('\n\n')
  )
  editor.setSelection(pos, codemirror.Pos(pos.line + imgs.length * 2 - 2))
  editor.focus()
}

export function getBuiltinActions(
  locale: BytemdLocale,
  plugins: BytemdPlugin[],
  uploadImages: EditorProps['uploadImages']
): { leftActions: BytemdAction[]; rightActions: BytemdAction[] } {
  const leftActions: BytemdAction[] = [
    {
      icon: icons.H,
      handler: {
        type: 'dropdown',
        actions: [1, 2, 3, 4, 5, 6].map(level => ({
          title: locale[`h${level}` as keyof BytemdLocale],
          icon: [
            icons.H1,
            icons.H2,
            icons.H3,
            icons.LevelFourTitle,
            icons.LevelFiveTitle,
            icons.LevelSixTitle,
          ][level - 1],
          cheatsheet: level <= 3 ? `${'#'.repeat(level)} ${locale.headingText}` : undefined,
          handler: {
            type: 'action',
            click({ replaceLines, editor }) {
              replaceLines(line => {
                line = line.trim().replace(/^#*/, '').trim()
                line = `${'#'.repeat(level)} ${line}`
                return line
              })
              editor.focus()
            },
          },
        })),
      },
    },
    {
      title: locale.bold,
      icon: icons.TextBold,
      cheatsheet: `**${locale.boldText}**`,
      handler: {
        type: 'action',
        shortcut: getShortcutWithPrefix('B'),
        click({ wrapText, editor }) {
          wrapText('**')
          editor.focus()
        },
      },
    },
    {
      title: locale.italic,
      icon: icons.TextItalic,
      cheatsheet: `*${locale.italicText}*`,
      handler: {
        type: 'action',
        shortcut: getShortcutWithPrefix('I'),
        click({ wrapText, editor }) {
          wrapText('*')
          editor.focus()
        },
      },
    },
    {
      title: locale.quote,
      icon: icons.Quote,
      cheatsheet: `> ${locale.quotedText}`,
      handler: {
        type: 'action',
        click({ replaceLines, editor }) {
          replaceLines(line => `> ${line}`)
          editor.focus()
        },
      },
    },
    {
      title: locale.link,
      icon: icons.LinkOne,
      cheatsheet: `[${locale.linkText}](url)`,
      handler: {
        type: 'action',
        shortcut: getShortcutWithPrefix('K'),
        click({ editor, wrapText, codemirror }) {
          wrapText('[', '](url)')
          const cursor = editor.getCursor()
          editor.setSelection(
            codemirror.Pos(cursor.line, cursor.ch + 2),
            codemirror.Pos(cursor.line, cursor.ch + 5)
          )
          editor.focus()
        },
      },
    },
    {
      title: locale.image,
      icon: icons.Pic,
      cheatsheet: `![${locale.imageAlt}](url "${locale.imageTitle}")`,
      handler: uploadImages
        ? {
            type: 'action',
            shortcut: getShortcutWithPrefix('I', true),
            async click(ctx) {
              const fileList = await selectFiles({
                accept: 'image/*',
                multiple: true,
              })

              if (fileList?.length) {
                await handleImageUpload(ctx, uploadImages, Array.from(fileList))
              }
            },
          }
        : undefined,
    },
    {
      title: locale.code,
      icon: icons.Code,
      cheatsheet: `\`${locale.codeText}\``,
      handler: {
        type: 'action',
        shortcut: getShortcutWithPrefix('K', true),
        click({ wrapText, editor }) {
          wrapText('`')
          editor.focus()
        },
      },
    },
    {
      title: locale.codeBlock,
      icon: icons.CodeBrackets,
      cheatsheet: `\`\`\`${locale.codeLang}↵`,
      handler: {
        type: 'action',
        shortcut: getShortcutWithPrefix('C', true),
        click({ editor, appendBlock, codemirror }) {
          const pos = appendBlock('```js\n```')
          editor.setSelection(codemirror.Pos(pos.line, 3), codemirror.Pos(pos.line, 5))
          editor.focus()
        },
      },
    },
    {
      title: locale.ul,
      icon: icons.ListTwo,
      cheatsheet: `- ${locale.ulItem}`,
      handler: {
        type: 'action',
        shortcut: getShortcutWithPrefix('U', true),
        click({ replaceLines, editor }) {
          replaceLines(line => `- ${line}`)
          editor.focus()
        },
      },
    },
    {
      title: locale.ol,
      icon: icons.OrderedList,
      cheatsheet: `1. ${locale.olItem}`,
      handler: {
        type: 'action',
        shortcut: getShortcutWithPrefix('O', true),
        click({ replaceLines, editor }) {
          replaceLines((line, i) => `${i + 1}. ${line}`)
          editor.focus()
        },
      },
    },
    {
      title: locale.hr,
      icon: icons.DividingLine,
      cheatsheet: '---',
      handler: {
        type: 'action',
        click({ appendBlock, editor }) {
          appendBlock('---')
          editor.focus()
        },
      },
    },
    ...plugins.flatMap(plugin => plugin.actions || []).filter(v => v.position !== 'right'),
  ]

  const rightActions: BytemdAction[] = plugins
    .flatMap(plugin => plugin.actions || [])
    .filter(v => v.position === 'right')

  return { leftActions, rightActions }
}
