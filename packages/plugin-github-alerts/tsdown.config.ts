import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: 'src/index.ts',
  format: ['esm', 'cjs', 'umd'],
  dts: true,
  clean: true,
  target: 'es2018',
  deps: {
    neverBundle: ['bytemd'],
  },
  globalName: 'BytemdPluginGithubAlerts',
  outExtensions({ format }) {
    if (format === 'cjs') return { js: '.js', dts: '.d.ts' }
    if (format === 'es') return { dts: '.d.ts' }
  },
})
