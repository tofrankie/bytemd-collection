import { cp, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

main().catch(handleError)

async function main() {
  const packageRoot = getPackageRoot()
  const highlightjsRoot = path.join(packageRoot, 'node_modules', 'highlight.js')

  await Promise.all([
    copyAssetGroup({
      filenames: getCssFiles(),
      sourceDir: path.join(highlightjsRoot, 'styles'),
      targetDir: path.join(packageRoot, 'styles'),
    }),
    copyAssetGroup({
      filenames: getScssFiles(),
      sourceDir: path.join(highlightjsRoot, 'scss'),
      targetDir: path.join(packageRoot, 'scss'),
    }),
  ])
}

function getCssFiles() {
  return [
    'dark.css',
    'dark.min.css',
    'default.css',
    'default.min.css',
    'github-dark-dimmed.css',
    'github-dark-dimmed.min.css',
    'github-dark.css',
    'github-dark.min.css',
    'github.css',
    'github.min.css',
  ]
}

function getScssFiles() {
  return ['dark.scss', 'default.scss', 'github-dark-dimmed.scss', 'github-dark.scss', 'github.scss']
}

function getPackageRoot() {
  return path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
}

async function copyAssetGroup({ filenames, sourceDir, targetDir }) {
  await mkdir(targetDir, { recursive: true })

  await Promise.all(
    filenames.map(filename => {
      return cp(path.join(sourceDir, filename), path.join(targetDir, filename))
    })
  )
}

function handleError(error) {
  console.error(error)
  process.exitCode = 1
}
