import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { compileAsync, compileStringAsync } from 'sass'

const CUSTOM_PROPERTY_PATTERN = /var\((--[\w-]+)/g
const AUTO_THEME_PAIRS = [
  { darkThemeKey: 'dark', fileName: 'auto', lightThemeKey: 'light' },
  {
    darkThemeKey: 'dark-colorblind',
    fileName: 'auto-colorblind',
    lightThemeKey: 'light-colorblind',
  },
  {
    darkThemeKey: 'dark-high-contrast',
    fileName: 'auto-high-contrast',
    lightThemeKey: 'light-high-contrast',
  },
  {
    darkThemeKey: 'dark-tritanopia',
    fileName: 'auto-tritanopia',
    lightThemeKey: 'light-tritanopia',
  },
  {
    darkThemeKey: 'dark-colorblind-high-contrast',
    fileName: 'auto-colorblind-high-contrast',
    lightThemeKey: 'light-colorblind-high-contrast',
  },
  {
    darkThemeKey: 'dark-tritanopia-high-contrast',
    fileName: 'auto-tritanopia-high-contrast',
    lightThemeKey: 'light-tritanopia-high-contrast',
  },
  { darkThemeKey: 'dark-dimmed', fileName: 'auto-dimmed', lightThemeKey: 'light' },
  {
    darkThemeKey: 'dark-dimmed-high-contrast',
    fileName: 'auto-dimmed-high-contrast',
    lightThemeKey: 'light-high-contrast',
  },
]
const STATIC_TOKEN_FILES = [
  'dist/css/base/size/size.css',
  'dist/css/base/typography/typography.css',
  'dist/css/functional/size/size.css',
  'dist/css/functional/size/radius.css',
  'dist/css/functional/size/border.css',
  'dist/css/functional/spacing/space.css',
  'dist/css/functional/typography/typography.css',
]
const DEFAULT_THEME_TARGETS = [
  {
    container: '.bytemd',
    portal: false,
  },
  {
    container: '.tippy-box[data-theme~=light-border]',
    portal: false,
  },
  {
    container: '.tippy-box:not([data-theme~=light-border])',
    portal: true,
  },
]

if (isExecutedAsScript()) {
  buildThemeStyles().catch(handleError)
}

export async function buildThemeStyles() {
  const packageRoot = getPackageRoot()
  const distDir = path.join(packageRoot, 'dist')
  const artifactsDir = path.join(packageRoot, 'artifacts', 'styles')
  const pureCss = await buildPureCss(packageRoot)
  const ruleSources = await buildRuleSources(packageRoot)
  const themeBuildData = await buildThemeData(ruleSources)

  await Promise.all([resetDir(distDir), resetDir(artifactsDir)])

  await Promise.all([
    writeFile(path.join(distDir, 'pure.css'), `${pureCss}\n`),
    writeFile(path.join(artifactsDir, 'pure.css'), `${pureCss}\n`),
    writeFile(
      path.join(packageRoot, 'scss', 'generated-theme-data.scss'),
      createScssThemeData(themeBuildData)
    ),
  ])

  for (const themeName of themeBuildData.themeNames) {
    const finalCss = createThemeCss({
      banner: `/* Generated from @primer/primitives theme: ${themeName}.css */`,
      tokenCss: createFixedThemeTokenCss(themeName, themeBuildData.ruleSources),
      pureCss,
    })

    await Promise.all([
      writeFile(path.join(distDir, `${themeName}.css`), finalCss),
      writeFile(path.join(artifactsDir, `${themeName}.css`), finalCss),
    ])
  }

  await Promise.all(
    AUTO_THEME_PAIRS.map(pair => {
      const autoCss = createThemeCss({
        banner: `/* Generated from @primer/primitives themes: ${pair.lightThemeKey}.css + ${pair.darkThemeKey}.css */`,
        tokenCss: createAutoThemeTokenCss(themeBuildData.ruleSources, pair),
        pureCss,
      })

      return Promise.all([
        writeFile(path.join(distDir, `${pair.fileName}.css`), autoCss),
        writeFile(path.join(artifactsDir, `${pair.fileName}.css`), autoCss),
      ])
    })
  )
}

async function buildPureCss(packageRoot) {
  const [tippyBaseCss, tippyThemeCss, result] = await Promise.all([
    readFile(resolvePackageFile('tippy.js/dist/tippy.css'), 'utf8'),
    readFile(resolvePackageFile('tippy.js/themes/light-border.css'), 'utf8'),
    compileAsync(path.join(packageRoot, 'src', 'index.scss'), {
      style: 'expanded',
    }),
  ])

  return [tippyBaseCss.trim(), tippyThemeCss.trim(), stripCharset(result.css)].join('\n\n')
}

async function buildRuleSources(packageRoot) {
  const patchsDir = path.join(packageRoot, 'src', 'patchs')
  const filenames = (await readdir(patchsDir))
    .filter(filename => filename.endsWith('.scss') && filename !== 'index.scss')
    .sort()

  return Promise.all(
    filenames.map(async filename => {
      const sourceName = filename.replace(/\.scss$/, '')
      const result = await compileStringAsync(
        `@use './${filename}' as rules;\n@include rules.render-${sourceName}();`,
        {
          style: 'expanded',
          url: pathToFileURL(path.join(patchsDir, `__${sourceName}-entry.scss`)),
        }
      )
      const css = result.css.trim()
      const containers = extractTopLevelSelectors(css)

      if (containers.length === 0) {
        throw new Error(`Unable to find a top-level selector in ${filename}`)
      }

      return {
        container: containers[0],
        name: sourceName,
        referencedVariables: collectReferencedVariables(css),
      }
    })
  )
}

async function buildThemeData(ruleSources) {
  const primerPackageRoot = path.dirname(resolvePackageFile('@primer/primitives/package.json'))
  const staticDeclarations = await readStaticDeclarations(primerPackageRoot)
  const themeDir = path.join(primerPackageRoot, 'dist', 'css', 'functional', 'themes')
  const themeFiles = (await readdir(themeDir)).filter(filename => filename.endsWith('.css')).sort()
  const staticDeclarationMap = new Map(staticDeclarations)
  const themeFilesData = await Promise.all(
    themeFiles.map(async filename => ({
      declarations: parseCustomPropertyDeclarations(
        await readFile(path.join(themeDir, filename), 'utf8')
      ),
      name: filename.replace(/\.css$/, ''),
    }))
  )
  const sources = ruleSources.map(source => {
    const baseTokens = resolveAvailableDeclarationClosure({
      referencedVariables: source.referencedVariables,
      declarationMap: staticDeclarationMap,
    })
    const baseTokenNames = new Set(baseTokens.map(([name]) => name))
    const themeTokens = new Map()

    for (const theme of themeFilesData) {
      themeTokens.set(
        theme.name,
        resolveDeclarationClosure({
          referencedVariables: source.referencedVariables,
          declarationMap: new Map(theme.declarations),
          sourceLabel: `${source.name}/${theme.name}`,
          optionalNames: baseTokenNames,
        })
      )
    }

    return {
      ...source,
      baseTokens,
      themeTokens,
    }
  })

  return {
    ruleSources: sources,
    themeNames: themeFilesData.map(theme => theme.name),
  }
}

async function readStaticDeclarations(primerPackageRoot) {
  const declarations = []

  for (const relativeFile of STATIC_TOKEN_FILES) {
    const content = await readFile(path.join(primerPackageRoot, relativeFile), 'utf8')
    declarations.push(...parseCustomPropertyDeclarations(content))
  }

  return declarations
}

function resolveDeclarationClosure({
  referencedVariables,
  declarationMap,
  sourceLabel,
  optionalNames = new Set(),
}) {
  const requiredNames = new Set()
  const queue = []

  for (const name of referencedVariables) {
    if (!declarationMap.has(name)) {
      if (optionalNames.has(name)) continue
      throw new Error(`Missing token "${name}" while resolving ${sourceLabel}`)
    }

    if (requiredNames.has(name)) continue

    requiredNames.add(name)
    queue.push(name)
  }

  while (queue.length > 0) {
    const name = queue.shift()
    const value = declarationMap.get(name)

    if (!value) continue

    for (const dependency of collectReferencedVariables(value)) {
      if (!declarationMap.has(dependency)) {
        if (optionalNames.has(dependency)) continue
        throw new Error(`Missing dependent token "${dependency}" while resolving ${sourceLabel}`)
      }

      if (requiredNames.has(dependency)) continue

      requiredNames.add(dependency)
      queue.push(dependency)
    }
  }

  return Array.from(declarationMap.entries()).filter(([name]) => requiredNames.has(name))
}

function resolveAvailableDeclarationClosure({ referencedVariables, declarationMap }) {
  const requiredNames = new Set()
  const queue = []

  for (const name of referencedVariables) {
    if (!declarationMap.has(name) || requiredNames.has(name)) continue

    requiredNames.add(name)
    queue.push(name)
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

  return Array.from(declarationMap.entries()).filter(([name]) => requiredNames.has(name))
}

function createThemeCss({ banner, tokenCss, pureCss }) {
  return [banner, tokenCss.trim(), pureCss.trim(), ''].join('\n\n')
}

function createFixedThemeTokenCss(themeName, ruleSources) {
  return ruleSources
    .flatMap(source => [
      createDeclarationBlock(source.container, source.baseTokens),
      createDeclarationBlock(source.container, source.themeTokens.get(themeName)),
    ])
    .join('\n\n')
}

function createAutoThemeTokenCss(ruleSources, pair) {
  return ruleSources
    .flatMap(source => {
      const lightSelectors = createAutoSelectors(source.container, 'light', pair)
      const lightAutoSelectors = createAutoSelectors(source.container, 'light-auto', pair)
      const darkSelectors = createAutoSelectors(source.container, 'dark', pair)
      const darkAutoSelectors = createAutoSelectors(source.container, 'dark-auto', pair)

      return [
        createDeclarationBlock(source.container, source.baseTokens),
        ...lightSelectors.map(selector =>
          createDeclarationBlock(selector, source.themeTokens.get(pair.lightThemeKey))
        ),
        ...lightAutoSelectors.map(selector =>
          createDeclarationBlock(selector, source.themeTokens.get(pair.lightThemeKey), {
            media: '(prefers-color-scheme: light)',
          })
        ),
        ...darkSelectors.map(selector =>
          createDeclarationBlock(selector, source.themeTokens.get(pair.darkThemeKey))
        ),
        ...darkAutoSelectors.map(selector =>
          createDeclarationBlock(selector, source.themeTokens.get(pair.darkThemeKey), {
            media: '(prefers-color-scheme: dark)',
          })
        ),
      ]
    })
    .join('\n\n')
}

function createAutoSelectors(container, mode, pair) {
  const colorMode = mode.includes('auto') ? 'auto' : mode
  const themeType = mode.startsWith('light') ? 'light' : 'dark'
  const themeKey = themeType === 'light' ? pair.lightThemeKey : pair.darkThemeKey
  const stateSelector = `[data-color-mode='${colorMode}'][data-${themeType}-theme='${themeKey}']`
  const target = DEFAULT_THEME_TARGETS.find(
    ({ container: targetContainer }) => container === targetContainer
  )

  if (target?.portal) {
    return [`body:has(#root > ${stateSelector}) ${container}`]
  }

  return [`${stateSelector} ${container}`]
}

function extractTopLevelSelectors(css) {
  const selectors = []
  let depth = 0

  for (const line of css.split('\n')) {
    const trimmedLine = line.trim()

    if (depth === 0 && trimmedLine.endsWith('{') && !trimmedLine.startsWith('@')) {
      selectors.push(trimmedLine.slice(0, -1).trim())
    }

    depth += countCharacters(line, '{') - countCharacters(line, '}')
  }

  return selectors
}

function countCharacters(value, character) {
  return value.split(character).length - 1
}

function stripCharset(css) {
  return css.replace(/^\s*@charset\s+["'][^"']+["'];\s*/i, '').trim()
}

function createDeclarationBlock(selector, declarations, { media } = {}) {
  const block = [
    `${selector} {`,
    ...declarations.map(([name, value]) => `  ${name}: ${value};`),
    '}',
  ].join('\n')

  if (!media) {
    return block
  }

  return `@media ${media} {\n${indentLines(block, 2)}\n}`
}

function createScssThemeData({ ruleSources, themeNames }) {
  const lines = ['$base-token-maps: (']

  for (const source of ruleSources) {
    lines.push(`  '${source.container}': (`)

    for (const [name, value] of source.baseTokens) {
      lines.push(`    '${name}': "${escapeForScssString(value)}",`)
    }

    lines.push('  ),')
  }

  lines.push(') !default;', '', '$theme-token-maps: (')

  for (const source of ruleSources) {
    lines.push(`  '${source.container}': (`)

    for (const themeName of themeNames) {
      lines.push(`    '${themeName}': (`)

      for (const [name, value] of source.themeTokens.get(themeName)) {
        lines.push(`      '${name}': "${escapeForScssString(value)}",`)
      }

      lines.push('    ),')
    }

    lines.push('  ),')
  }

  lines.push(') !default;')

  return `${lines.join('\n')}\n`
}

function escapeForScssString(value) {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')
}

function indentLines(value, spaces) {
  const indent = ' '.repeat(spaces)
  return value
    .split('\n')
    .map(line => `${indent}${line}`)
    .join('\n')
}

function parseCustomPropertyDeclarations(content) {
  const declarations = []

  for (const line of content.split('\n')) {
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

async function resetDir(targetDir) {
  await rm(targetDir, { recursive: true, force: true })
  await mkdir(targetDir, { recursive: true })
}

function resolvePackageFile(id) {
  const require = createRequire(import.meta.url)
  const fallbackRoots = [
    import.meta.url,
    new URL('../../bytemd/package.json', import.meta.url),
    new URL('../../plugin-highlight/package.json', import.meta.url),
    new URL('../../../package.json', import.meta.url),
  ]

  for (const root of fallbackRoots) {
    try {
      return createRequire(root).resolve(id)
    } catch {}
  }

  return require.resolve(id)
}

function getPackageRoot() {
  return path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
}

function isExecutedAsScript() {
  return process.argv[1] === fileURLToPath(import.meta.url)
}

function handleError(error) {
  console.error(error)
  process.exitCode = 1
}
