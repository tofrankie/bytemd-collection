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
  globalName: 'BytemdPluginMath',
  outExtensions({ format }) {
    if (format === 'cjs') return { js: '.cjs', dts: '.d.cts' }
    if (format === 'es') return { dts: '.d.ts' }
  },
})
