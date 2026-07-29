import { act, cleanup, fireEvent, render } from '@testing-library/svelte'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Editor } from '../src'

function sleep(ms: number = 0) {
  return new Promise(r => setTimeout(r, ms))
}

function getCodeMirror($: any) {
  const dom = $.container.querySelector('.cm-editor') as any
  return dom.CodeMirror
}

function stripComment(str: string) {
  return str.replace(/<!--.*?-->/g, '')
}

const heading = '# title'
const paragraph = 'abc'
const paragraphHtml = '<p>abc</p>'

beforeEach(() => {
  cleanup()
})

it('value', async () => {
  const $ = render(Editor, { value: heading })
  const onChange = vi.fn()
  $.component.$on('change', onChange)
  await act()
  expect(getCodeMirror($).getValue()).toEqual(heading)

  // // change from UI
  // getCodeMirror($).setValue(paragraph);
  // await act();
  // expect(getCodeMirror($).getValue()).toEqual(paragraph);
  // expect(onChange).toBeCalled();
  // expect(onChange).toBeCalledTimes(1);
  // // expect(onChange).toBeCalledWith()

  // change from props
  $.component.$set({ value: heading })
  expect(getCodeMirror($).getValue()).toEqual(heading)
  expect(onChange).not.toBeCalled()
})

it('preview debounce', async () => {
  const $ = render(Editor, {})
  $.component.$set({ value: paragraph })
  expect(stripComment($.container.querySelector('.markdown-body')?.innerHTML ?? '')).toEqual('')
  await sleep(400)
  expect(stripComment($.container.querySelector('.markdown-body')?.innerHTML ?? '')).toEqual(
    paragraphHtml
  )
})

describe('mode', () => {
  it('split', async () => {
    const $ = render(Editor, { mode: 'split' })
    await act()
    expect($.container.querySelector('.bytemd-editor')).toBeTruthy()
    expect($.container.querySelector('.bytemd-preview')).toBeTruthy()
  })

  it('tab', async () => {
    const $ = render(Editor, { mode: 'tab' })
    const write = $.getByText('Write')
    const preview = $.getByText('Preview')

    expect($.container.querySelector('.bytemd-editor')).toBeTruthy()
    expect(write.classList.contains('bytemd-toolbar-tab-active')).toBe(true)
    // expect($.container.querySelector('.bytemd-preview')).toHaveStyle('width:0');
    expect(preview.classList.contains('bytemd-toolbar-tab-active')).toBe(false)

    await fireEvent.click(preview)
    // expect($.container.querySelector('.bytemd-editor')).toHaveStyle('width:0');
    expect(write.classList.contains('bytemd-toolbar-tab-active')).toBe(false)
    expect($.container.querySelector('.bytemd-preview')).toBeTruthy()
    expect(preview.classList.contains('bytemd-toolbar-tab-active')).toBe(true)
  })
})

describe('plugin', () => {
  it('editor effect', async () => {
    const $ = render(Editor, {})
    const editorOff = vi.fn()
    const editorEffect = vi.fn(() => editorOff)

    $.component.$set({ plugins: [{ editorEffect }] })
    await act()
    expect(editorEffect).toBeCalled()
    expect(editorEffect).toBeCalledTimes(1)
    expect(editorEffect).toBeCalledWith(
      expect.objectContaining({
        // $el: $.container.querySelector('.bytemd'),
        editor: getCodeMirror($),
      })
    )

    $.component.$set({ plugins: [{ editorEffect }] })
    await act()
    expect(editorOff).toBeCalled()
    expect(editorOff).toBeCalledTimes(1)
  })
})
