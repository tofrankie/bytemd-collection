import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: 'src/index.ts',
  format: ['esm', 'cjs'],
  dts: true,
  clean: false,
  target: 'es2020',
  external: [
    /^svelte($|\/)/,
    './editor.svelte',
    './viewer.svelte',
    './help.svelte',
    './status.svelte',
    './toc.svelte',
    './toolbar.svelte',
  ],
  outExtensions({ format }) {
    if (format === 'cjs') return { js: '.js', dts: '.d.ts' }
    if (format === 'es') return { js: '.mjs', dts: '.d.ts' }
    return {}
  },
})
