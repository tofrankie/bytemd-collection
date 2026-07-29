import { unwatchFile, watchFile } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildThemeStyles } from './build-theme-styles.js'

const packageRoot = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
const watchTargets = [
  path.join(packageRoot, 'src', 'patch.scss'),
  path.join(packageRoot, 'scripts', 'build-theme-styles.js'),
]

let timer = null
let building = false
let pending = false

await runBuild()

startWatching()

process.on('SIGINT', closeAll)
process.on('SIGTERM', closeAll)

function startWatching() {
  watchTargets.forEach(target => {
    watchFile(target, { interval: 250 }, (current, previous) => {
      if (current.mtimeMs === previous.mtimeMs) return
      scheduleBuild()
    })
  })
}

function scheduleBuild() {
  clearTimeout(timer)
  timer = setTimeout(() => {
    void runBuild()
  }, 100)
}

async function runBuild() {
  if (building) {
    pending = true
    return
  }

  building = true

  try {
    await buildThemeStyles()
    console.log(
      `[bytemd-theme-github] rebuilt at ${new Date().toLocaleTimeString('en-US', { hour12: false })}`
    )
  } catch (error) {
    console.error('[bytemd-theme-github] rebuild failed')
    console.error(error)
  } finally {
    building = false
  }

  if (pending) {
    pending = false
    await runBuild()
  }
}

function closeAll() {
  watchTargets.forEach(target => {
    unwatchFile(target)
  })
  process.exit(0)
}
