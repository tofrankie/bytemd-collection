import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

if (isExecutedAsScript()) {
  buildKatexStyles().catch(handleError)
}

export async function buildKatexStyles() {
  const packageRoot = getPackageRoot()
  const distStylesDir = path.join(packageRoot, 'dist', 'styles')
  const distFontsDir = path.join(distStylesDir, 'fonts')
  const katexCssFile = resolveKatexCssFile()
  const katexFontsDir = path.join(path.dirname(katexCssFile), 'fonts')
  const katexCss = await readFile(katexCssFile, 'utf8')

  await Promise.all([
    mkdir(distStylesDir, { recursive: true }),
    rm(distFontsDir, { recursive: true, force: true }),
  ])

  await cp(katexFontsDir, distFontsDir, { recursive: true })
  await writeFile(path.join(distStylesDir, 'katex.css'), katexCss)
}

function resolveKatexCssFile() {
  const require = createRequire(import.meta.url)
  return require.resolve('katex/dist/katex.css')
}

function getPackageRoot() {
  return path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
}

function isExecutedAsScript() {
  const currentFile = fileURLToPath(import.meta.url)
  return process.argv[1] === currentFile
}

function handleError(error) {
  console.error(error)
  process.exitCode = 1
}
