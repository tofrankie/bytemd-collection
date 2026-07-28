import { defineConfig } from '@tofrankie/eslint'

export default defineConfig(
  {
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
  }
)
