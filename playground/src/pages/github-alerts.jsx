import alerts from 'bytemd-plugin-github-alerts'
import { useMemo } from 'react'
import ExampleEditor from '../components/example-editor'
import ExampleLayout from '../components/example-layout'
import alertsMarkdown from '../examples/github-alerts.md?raw'

export default function GithubAlertsPage() {
  const plugins = useMemo(
    () => [
      alerts(), // must be placed before @bytemd/plugin-breaks
    ],
    []
  )

  return (
    <ExampleLayout title="GitHub Alerts" description="">
      <ExampleEditor initialValue={alertsMarkdown} plugins={plugins} />
    </ExampleLayout>
  )
}
