import { defineConfig } from '@tofrankie/eslint'

export default defineConfig(
  {
    ignores: ['packages/bytemd/**', 'playground/**/*.md'],
    typescript: true,
    react: true,
    svelte: {
      overrides: {
        'svelte/html-quotes': [
          'error',
          {
            prefer: 'double', // or "single"
            dynamic: {
              quoted: false,
              avoidInvalidUnquotedInHTML: false,
            },
          },
        ],
      },
    },
  },
  {
    files: ['**/*.md', '**/*.md/**'],
    rules: {
      'no-new': 'off',
    },
  },
  {
    files: ['**/package.json'],
    rules: {
      'pnpm/json-enforce-catalog': 'off',
      'pnpm/json-valid-catalog': 'off',
    },
  }
)
