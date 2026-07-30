import breaks from '@bytemd/plugin-breaks'
import frontmatter from '@bytemd/plugin-frontmatter'
import gemoji from '@bytemd/plugin-gemoji'
import mediumZoom from '@bytemd/plugin-medium-zoom'
import gfm from 'bytemd-plugin-gfm'
import alerts from 'bytemd-plugin-github-alerts'
import highlight from 'bytemd-plugin-highlight-github'
import math from 'bytemd-plugin-math'
import mermaid from 'bytemd-plugin-mermaid'
import { useMemo } from 'react'
import ExampleEditor from '../components/example-editor'
import ExampleLayout from '../components/example-layout'
import allPluginsMarkdown from '../examples/all-plugins.md?raw'
import 'bytemd-plugin-highlight-github/styles/pure.css'
import 'bytemd-theme-editor-github/light.css'

export default function AllPluginsPage() {
  const plugins = useMemo(
    () => [
      frontmatter(),
      alerts(),
      breaks(),
      gfm(),
      highlight(),
      gemoji(),
      math(),
      mediumZoom(),
      mermaid({
        theme: 'default',
      }),
    ],
    []
  )

  return (
    <ExampleLayout
      title="All Plugins"
      description="复用真实插件组合，统一观察主题、代码高亮、脚注、公式、Mermaid 和 GitHub Alerts 的联动效果"
    >
      <ExampleEditor initialValue={allPluginsMarkdown} plugins={plugins} />
    </ExampleLayout>
  )
}
