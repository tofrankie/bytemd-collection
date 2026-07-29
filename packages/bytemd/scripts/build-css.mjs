import fs from 'node:fs/promises'
import path from 'node:path'
import * as sass from 'sass'

const cwd = process.cwd()
const sourceFile = path.join(cwd, 'src/index.scss')
const distDir = path.join(cwd, 'dist')

await fs.mkdir(distDir, { recursive: true })

const { css } = sass.compile(sourceFile, {
  style: 'expanded',
  loadPaths: [path.join(cwd, 'node_modules')],
})

await fs.writeFile(path.join(distDir, 'index.css'), css)
