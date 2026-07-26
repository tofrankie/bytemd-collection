import highlight from '@tofrankie/bytemd-plugin-highlight'
import ExampleEditor from '../components/example-editor'
import ExampleLayout from '../components/example-layout'

import highlightMarkdown from '../examples/highlight.md?raw'

export default function HighlightPage() {
  return (
    <ExampleLayout title="Highlight" description="">
      <ExampleEditor initialValue={highlightMarkdown} plugins={[highlight()]} />
    </ExampleLayout>
  )
}
