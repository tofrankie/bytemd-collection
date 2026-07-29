import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { compileAsync } from 'sass'

const PRETTYLIGHTS_PREFIX = '--prettylights-'
const CUSTOM_PROPERTY_PATTERN = /var\((--[\w-]+)/g

if (isExecutedAsScript()) {
  buildHighlightStyles().catch(handleError)
}

export async function buildHighlightStyles() {
  const packageRoot = getPackageRoot()
  const stylesDir = path.join(packageRoot, 'dist', 'styles')
  const artifactsDir = path.join(packageRoot, 'artifacts', 'styles')
  const baseCss = await compileBaseCss(packageRoot)
  const baseReferencedVariables = collectReferencedVariables(baseCss)
  const primerPackageJson = await readPrimerPackageJson()
  const themeDir = resolvePrimerThemeDir()
  const themeFiles = (await readdir(themeDir)).filter(filename => filename.endsWith('.css')).sort()

  if (themeFiles.length === 0) {
    throw new Error(`No theme files found in ${themeDir}`)
  }

  await Promise.all([
    resetDir(stylesDir),
    resetDir(artifactsDir),
    rm(path.join(packageRoot, 'styles'), { recursive: true, force: true }),
    rm(path.join(packageRoot, 'scss'), { recursive: true, force: true }),
  ])

  const pureCss = `${baseCss}\n`
  await Promise.all([
    writeFile(path.join(stylesDir, 'pure.css'), pureCss),
    writeFile(path.join(artifactsDir, 'pure.css'), pureCss),
  ])

  await Promise.all(
    themeFiles.map(async filename => {
      const themeCss = await readFile(path.join(themeDir, filename), 'utf8')
      const finalCss = createThemeCss({
        themeCss,
        themeFilename: filename,
        primerVersion: primerPackageJson.version,
        baseCss,
        baseReferencedVariables,
      })

      await Promise.all([
        writeFile(path.join(stylesDir, filename), finalCss),
        writeFile(path.join(artifactsDir, filename), finalCss),
      ])
    })
  )
}

function createThemeCss({
  themeCss,
  themeFilename,
  primerVersion,
  baseCss,
  baseReferencedVariables,
}) {
  const declarations = extractScopedDeclarations(themeCss, baseReferencedVariables)

  return [
    `/* Generated from @primer/primitives@${primerVersion} theme: ${themeFilename} */`,
    '.hljs {',
    ...declarations.map(declaration => `  ${declaration}`),
    '}',
    '',
    baseCss,
    '',
  ].join('\n')
}

function extractScopedDeclarations(themeCss, baseReferencedVariables) {
  const declarationEntries = parseCustomPropertyDeclarations(themeCss)
  const declarationMap = new Map(declarationEntries)
  const uniqueDeclarationEntries = Array.from(declarationMap.entries())
  const prettylightsNames = uniqueDeclarationEntries
    .map(([name]) => name)
    .filter(name => name.startsWith(PRETTYLIGHTS_PREFIX))
  const requiredNames = new Set([...prettylightsNames, ...baseReferencedVariables])

  const queue = [...requiredNames].filter(name => declarationMap.has(name))

  for (const name of baseReferencedVariables) {
    if (!declarationMap.has(name)) {
      throw new Error(`Missing theme variable "${name}" referenced by src/base.scss`)
    }
  }

  while (queue.length > 0) {
    const name = queue.shift()
    const value = declarationMap.get(name)
    if (!value) continue

    for (const dependency of collectReferencedVariables(value)) {
      if (!declarationMap.has(dependency) || requiredNames.has(dependency)) continue
      requiredNames.add(dependency)
      queue.push(dependency)
    }
  }

  return uniqueDeclarationEntries
    .filter(([name]) => requiredNames.has(name))
    .map(([name, value]) => `${name}: ${value};`)
}

function parseCustomPropertyDeclarations(themeCss) {
  const declarations = []

  for (const line of themeCss.split('\n')) {
    const trimmedLine = line.trim()
    const colonIndex = trimmedLine.indexOf(':')
    const semicolonIndex = trimmedLine.indexOf(';')

    if (colonIndex <= 2 || semicolonIndex <= colonIndex || !trimmedLine.startsWith('--')) continue

    const name = trimmedLine.slice(0, colonIndex).trim()
    const value = trimmedLine.slice(colonIndex + 1, semicolonIndex).trim()

    if (!name || !value) continue

    declarations.push([name, value])
  }

  return declarations
}

function collectReferencedVariables(value) {
  const variables = new Set()

  for (
    let match = CUSTOM_PROPERTY_PATTERN.exec(value);
    match !== null;
    match = CUSTOM_PROPERTY_PATTERN.exec(value)
  ) {
    variables.add(match[1])
  }

  CUSTOM_PROPERTY_PATTERN.lastIndex = 0

  return variables
}

async function compileBaseCss(packageRoot) {
  const baseFile = path.join(packageRoot, 'src', 'base.scss')
  const result = await compileAsync(baseFile, {
    style: 'expanded',
  })

  return result.css.trimEnd()
}

async function readPrimerPackageJson() {
  const primerPackageJsonFile = resolvePrimerPackageJsonFile()
  const content = await readFile(primerPackageJsonFile, 'utf8')
  return JSON.parse(content)
}

function resolvePrimerThemeDir() {
  const primerPackageJsonFile = resolvePrimerPackageJsonFile()
  return path.join(path.dirname(primerPackageJsonFile), 'dist', 'css', 'functional', 'themes')
}

function resolvePrimerPackageJsonFile() {
  const require = createRequire(import.meta.url)
  return require.resolve('@primer/primitives/package.json')
}

async function resetDir(targetDir) {
  await rm(targetDir, { recursive: true, force: true })
  await mkdir(targetDir, { recursive: true })
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
