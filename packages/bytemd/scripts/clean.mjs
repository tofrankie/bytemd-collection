import fs from 'node:fs/promises'
import path from 'node:path'

const cwd = process.cwd()

for (const relativePath of ['dist']) {
  await fs.rm(path.join(cwd, relativePath), { recursive: true, force: true })
}
