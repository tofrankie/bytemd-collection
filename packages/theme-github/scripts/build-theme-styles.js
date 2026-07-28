import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { compileAsync } from 'sass'

if (isExecutedAsScript()) {
  buildThemeStyles().catch(handleError)
}

export async function buildThemeStyles() {
  const packageRoot = getPackageRoot()
  const distDir = path.join(packageRoot, 'dist')
  const sourceDir = resolveGithubMarkdownCssDist()
  const patchCss = await compilePatchStyles(packageRoot)
  const themeFiles = (await readdir(sourceDir)).filter(filename => filename.endsWith('.css'))

  await rm(distDir, { recursive: true, force: true })
  await mkdir(distDir, { recursive: true })

  await Promise.all(
    themeFiles.map(async filename => {
      const sourceCss = await readFile(path.join(sourceDir, filename), 'utf8')
      const finalCss = `${sourceCss}\n\n/* bytemd-theme-github patch layer */\n${patchCss.trim()}\n`
      await writeFile(path.join(distDir, filename), finalCss)
    })
  )

  await writeFile(
    path.join(distDir, 'index.mjs'),
    "import './light.css'\n\nexport {}\n"
  )

  await writeFile(
    path.join(distDir, 'index.cjs'),
    "'use strict'\n\nrequire('./light.css')\n"
  )
}

function getPackageRoot() {
  return path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
}

function isExecutedAsScript() {
  const currentFile = fileURLToPath(import.meta.url)
  return process.argv[1] === currentFile
}

async function compilePatchStyles(packageRoot) {
  const patchFile = path.join(packageRoot, 'src', 'patch.scss')
  const result = await compileAsync(patchFile, {
    style: 'expanded',
  })
  return result.css
}

function resolveGithubMarkdownCssDist() {
  const require = createRequire(import.meta.url)
  const lightThemePath = require.resolve('@tofrankie/github-markdown-css/light.css')
  return path.dirname(lightThemePath)
}

function handleError(error) {
  console.error(error)
  process.exitCode = 1
}
