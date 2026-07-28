import gfm from 'bytemd-plugin-gfm'
import { useMemo } from 'react'
import ExampleEditor from '../components/example-editor'
import ExampleLayout from '../components/example-layout'
import gfmMarkdown from '../examples/gfm.md?raw'
import 'github-markdown-css/github-markdown-light.css'

export default function GfmPage() {
  const plugins = useMemo(() => [gfm()], [])

  return (
    <ExampleLayout
      title="GFM"
      description="观察 GitHub Flavored Markdown 在 bytemd 中的表格、任务列表、删除线和自动链接效果"
    >
      <ExampleEditor initialValue={gfmMarkdown} plugins={plugins} />
    </ExampleLayout>
  )
}
