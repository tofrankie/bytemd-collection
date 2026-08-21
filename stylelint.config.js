export default {
  ignoreFiles: [
    '**/node_modules/**',
    '**/dist/**',
    '**/artifacts/**',
    'packages/theme-editor-github/scss/generated-theme-data.scss',
  ],
  extends: ['@tofrankie/stylelint', '@tofrankie/stylelint/scss'],
  rules: {
    'custom-property-pattern': null,
    'selector-no-vendor-prefix': null,
    'property-no-vendor-prefix': null,
    'declaration-empty-line-before': null,
    'no-invalid-position-at-import-rule': null,
    'selector-class-pattern': null,
  },
  overrides: [
    {
      files: ['**/*.scss'],
      rules: {
        'scss/at-function-pattern': null,
        'scss/at-if-no-null': null,
        'scss/at-mixin-pattern': null,
      },
    },
  ],
}
