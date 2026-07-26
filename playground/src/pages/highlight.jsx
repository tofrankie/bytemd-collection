import highlight from '@tofrankie/bytemd-plugin-highlight'
import darkStyleUrl from '@tofrankie/bytemd-plugin-highlight/styles/dark.css?url'
import defaultStyleUrl from '@tofrankie/bytemd-plugin-highlight/styles/default.css?url'
import githubDarkDimmedStyleUrl from '@tofrankie/bytemd-plugin-highlight/styles/github-dark-dimmed.css?url'
import githubDarkStyleUrl from '@tofrankie/bytemd-plugin-highlight/styles/github-dark.css?url'
import githubStyleUrl from '@tofrankie/bytemd-plugin-highlight/styles/github.css?url'
import { useEffect, useState } from 'react'
import ExampleEditor from '../components/example-editor'
import ExampleLayout from '../components/example-layout'

import highlightMarkdown from '../examples/highlight.md?raw'

const themes = [
  { label: 'Default', value: 'default', href: defaultStyleUrl },
  { label: 'Dark', value: 'dark', href: darkStyleUrl },
  { label: 'GitHub', value: 'github', href: githubStyleUrl },
  { label: 'GitHub Dark', value: 'github-dark', href: githubDarkStyleUrl },
  { label: 'GitHub Dimmed', value: 'github-dark-dimmed', href: githubDarkDimmedStyleUrl },
]

export default function HighlightPage() {
  const [theme, setTheme] = useState('github')

  useEffect(() => {
    const currentTheme = themes.find(item => item.value === theme)
    const elementId = 'bytemd-highlight-theme'

    if (!currentTheme) return

    let link = document.getElementById(elementId)

    if (!(link instanceof HTMLLinkElement)) {
      link = document.createElement('link')
      link.id = elementId
      link.rel = 'stylesheet'
      document.head.append(link)
    }

    link.href = currentTheme.href

    return () => {
      if (link.parentNode) {
        link.parentNode.removeChild(link)
      }
    }
  }, [theme])

  return (
    <ExampleLayout
      title="Highlight"
      description="切换不同 highlight.js 主题，观察同一份代码块内容的渲染差异"
      toolbar={
        <div className="mode-switcher is-wrap" role="group" aria-label="切换代码高亮主题">
          {themes.map(item => (
            <button
              key={item.value}
              type="button"
              className={item.value === theme ? 'is-active' : undefined}
              onClick={() => setTheme(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      }
    >
      <ExampleEditor initialValue={highlightMarkdown} plugins={[highlight()]} />
    </ExampleLayout>
  )
}
