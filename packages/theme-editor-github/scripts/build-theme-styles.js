import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { compileAsync } from 'sass'

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
// eslint-disable-next-line no-unused-vars
const DEFAULT_THEME_TARGETS = [
  {
    container: '.bytemd',
    modes: {
      light: {
        selectors: [],
        tokens: 'light',
      },
      dark: {
        selectors: [],
        tokens: 'dark',
      },
    },
  },
  {
    container: '.tippy-box',
    modes: {
      light: {
        selectors: ["&[data-theme~='light-border']"],
        tokens: 'light',
      },
      dark: {
        selectors: ["&[data-theme~='bytemd-dark']"],
        tokens: 'dark',
      },
    },
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
  const referencedVariables = collectReferencedVariables(pureCss)
  const themeBuildData = await buildThemeData(referencedVariables)

  await Promise.all([resetDir(distDir), resetDir(artifactsDir)])

  await Promise.all([
    writeFile(path.join(distDir, 'pure.css'), `${pureCss}\n`),
    writeFile(path.join(artifactsDir, 'pure.css'), `${pureCss}\n`),
    writeFile(
      path.join(packageRoot, 'scss', 'generated-theme-data.scss'),
      createScssThemeData(themeBuildData)
    ),
  ])

  for (const themeName of themeBuildData.themeTokens.keys()) {
    const declarations = themeBuildData.themeTokens.get(themeName)

    if (!declarations) {
      throw new Error(`Missing token data for theme "${themeName}"`)
    }

    const finalCss = createThemeCss({
      banner: `/* Generated from @primer/primitives theme: ${themeName}.css */`,
      tokenCss: createFixedThemeTokenCss(themeName, declarations, themeBuildData.baseTokens),
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
        tokenCss: createAutoThemeTokenCss(themeBuildData, pair),
        pureCss,
      })

      return Promise.all([
        writeFile(path.join(distDir, `${pair.fileName}.css`), autoCss),
        writeFile(path.join(artifactsDir, `${pair.fileName}.css`), autoCss),
      ])
    })
  )

  await Promise.all([
    writeFile(path.join(distDir, 'index.mjs'), "import './light.css'\n\nexport {}\n"),
    writeFile(path.join(distDir, 'index.cjs'), "'use strict'\n\nrequire('./light.css')\n"),
  ])
}

async function buildPureCss(packageRoot) {
  const [tippyBaseCss, tippyThemeCss, result] = await Promise.all([
    readFile(resolvePackageFile('tippy.js/dist/tippy.css'), 'utf8'),
    readFile(resolvePackageFile('tippy.js/themes/light-border.css'), 'utf8'),
    compileAsync(path.join(packageRoot, 'src', 'index.scss'), {
      style: 'expanded',
    }),
  ])

  return [tippyBaseCss.trim(), tippyThemeCss.trim(), result.css.trim()].join('\n\n')
}

async function buildThemeData(referencedVariables) {
  const primerPackageRoot = path.dirname(resolvePackageFile('@primer/primitives/package.json'))
  const staticDeclarations = await readStaticDeclarations(primerPackageRoot)
  const themeDir = path.join(primerPackageRoot, 'dist', 'css', 'functional', 'themes')
  const themeFiles = (await readdir(themeDir)).filter(filename => filename.endsWith('.css')).sort()
  const themeBuildData = new Map()
  const staticDeclarationMap = new Map(staticDeclarations)
  const baseTokenEntries = resolveAvailableDeclarationClosure({
    referencedVariables,
    declarationMap: staticDeclarationMap,
  })

  for (const filename of themeFiles) {
    const content = await readFile(path.join(themeDir, filename), 'utf8')
    const declarations = parseCustomPropertyDeclarations(content)
    const declarationMap = new Map(declarations)
    const selectedDeclarations = resolveDeclarationClosure({
      referencedVariables,
      declarationMap,
      sourceLabel: filename,
      optionalNames: new Set(baseTokenEntries.map(([name]) => name)),
    })

    themeBuildData.set(filename.replace(/\.css$/, ''), selectedDeclarations)
  }

  return {
    baseTokens: baseTokenEntries,
    themeTokens: themeBuildData,
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

function createFixedThemeTokenCss(themeName, declarations, baseTokens) {
  const tokenGroup = [
    {
      container: '.bytemd',
      modes: {
        [themeName]: {
          selectors: ['.bytemd'],
          tokens: themeName,
        },
      },
    },
    {
      container: '.tippy-box',
      modes: {
        [themeName]: {
          selectors: ['.tippy-box'],
          tokens: themeName,
        },
      },
    },
  ]

  return renderTargets({
    targets: tokenGroup,
    baseTokens,
    themeTokens: new Map([[themeName, declarations]]),
  })
}

function createAutoThemeTokenCss(themeBuildData, pair) {
  const targets = [
    {
      container: '.bytemd',
      modes: {
        light: {
          selectors: [
            `[data-color-mode='light'][data-light-theme='${pair.lightThemeKey}'] .bytemd`,
          ],
          tokens: pair.lightThemeKey,
        },
        'light-auto': {
          selectors: [`[data-color-mode='auto'][data-light-theme='${pair.lightThemeKey}'] .bytemd`],
          tokens: pair.lightThemeKey,
          media: '(prefers-color-scheme: light)',
        },
        dark: {
          selectors: [`[data-color-mode='dark'][data-dark-theme='${pair.darkThemeKey}'] .bytemd`],
          tokens: pair.darkThemeKey,
        },
        'dark-auto': {
          selectors: [`[data-color-mode='auto'][data-dark-theme='${pair.darkThemeKey}'] .bytemd`],
          tokens: pair.darkThemeKey,
          media: '(prefers-color-scheme: dark)',
        },
      },
    },
    {
      container: '.tippy-box',
      modes: {
        light: {
          selectors: [
            `body:has(#root > [data-color-mode='light'][data-light-theme='${pair.lightThemeKey}']) .tippy-box`,
          ],
          tokens: pair.lightThemeKey,
        },
        'light-auto': {
          selectors: [
            `body:has(#root > [data-color-mode='auto'][data-light-theme='${pair.lightThemeKey}']) .tippy-box`,
          ],
          tokens: pair.lightThemeKey,
          media: '(prefers-color-scheme: light)',
        },
        dark: {
          selectors: [
            `body:has(#root > [data-color-mode='dark'][data-dark-theme='${pair.darkThemeKey}']) .tippy-box`,
          ],
          tokens: pair.darkThemeKey,
        },
        'dark-auto': {
          selectors: [
            `body:has(#root > [data-color-mode='auto'][data-dark-theme='${pair.darkThemeKey}']) .tippy-box`,
          ],
          tokens: pair.darkThemeKey,
          media: '(prefers-color-scheme: dark)',
        },
      },
    },
  ]

  return renderTargets({ targets, ...themeBuildData })
}

function renderTargets({ targets, baseTokens, themeTokens }) {
  const blocks = []

  for (const target of targets) {
    blocks.push(createDeclarationBlock(target.container, baseTokens))

    for (const mode of Object.values(target.modes)) {
      const declarations = themeTokens.get(mode.tokens)

      if (!declarations) {
        throw new Error(`Unknown token group "${mode.tokens}"`)
      }

      for (const selector of resolveSelectors(mode.selectors)) {
        blocks.push(createDeclarationBlock(selector, declarations, mode))
      }
    }
  }

  return blocks.join('\n\n')
}

function resolveSelectors(selectors) {
  if (!selectors || selectors.length === 0) {
    return []
  }

  return selectors
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

function createScssThemeData({ baseTokens, themeTokens }) {
  const lines = ['$base-token-map: (']

  for (const [name, value] of baseTokens) {
    lines.push(`  '${name}': "${escapeForScssString(value)}",`)
  }

  lines.push(') !default;', '', '$theme-token-groups: (')
  const themeNames = Array.from(themeTokens.keys()).sort()

  for (const themeName of themeNames) {
    lines.push(`  '${themeName}': (`)

    for (const [name, value] of themeTokens.get(themeName)) {
      lines.push(`    '${name}': "${escapeForScssString(value)}",`)
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
