import math from 'bytemd-plugin-math'
import { useMemo } from 'react'
import ExampleEditor from '../components/example-editor'
import ExampleLayout from '../components/example-layout'
import mathMarkdown from '../examples/math.md?raw'

export default function MathPage() {
  const plugins = useMemo(() => [math()], [])

  return (
    <ExampleLayout
      title="Math"
      description="观察 bytemd-plugin-math 在 KaTeX 样式导入后对行内公式、块级公式和常见数学表达式的渲染效果"
    >
      <ExampleEditor initialValue={mathMarkdown} plugins={plugins} />
    </ExampleLayout>
  )
}
