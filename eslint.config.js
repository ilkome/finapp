import antfu from '@antfu/eslint-config'
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'
import { extend } from 'eslint-flat-config-utils'
import tailwind from 'eslint-plugin-tailwindcss'

function withNuxt(...customs) {
  return createConfigForNuxt({
    dirs: {
      components: ['app/app/components'],
      componentsPrefixed: [],
      composables: ['app/app/composables', 'app/app/utils'],
      layouts: ['app/app/layouts'],
      middleware: ['app/app/middleware'],
      modules: ['app/modules'],
      pages: ['app/app/pages'],
      plugins: ['app/app/plugins'],
      root: ['app'],
      servers: [],
      src: ['app/app'],
    },
    features: {
      standalone: false,
    },
  }).append(...customs)
}

export default [
  {
    ignores: [
      '**/.nuxt/**',
      '**/.output/**',
      '**/coverage/**',
      '**/dist/**',
      'app/convex/_generated/**',
      'app/playwright/profiles/**',
      'app/tests/e2e/.auth/**',
      'app/utils/migrate/data.json',
    ],
  },
  {
    settings: {
      tailwindcss: {
        config: {},
        cssFiles: ['app/app/assets/css/**/*.css'],
      },
    },
  },
  ...tailwind.configs['flat/recommended'],
  ...await extend(withNuxt(
    antfu({
      formatters: {
        css: true,
        html: true,
      },
      markdown: false,
      rules: {
        '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
        'e18e/prefer-static-regex': 'off',
        'import/order': 'off',
        'no-console': 'off',
        'perfectionist/sort-array-includes': ['error', { order: 'asc', type: 'natural' }],
        'perfectionist/sort-enums': ['error', { order: 'asc', type: 'natural' }],
        'perfectionist/sort-exports': ['error', { order: 'asc', type: 'natural' }],
        'perfectionist/sort-imports': ['error', { order: 'asc', type: 'natural' }],
        'perfectionist/sort-interfaces': ['error', { order: 'asc', type: 'natural' }],
        'perfectionist/sort-named-exports': ['error', { order: 'asc', type: 'natural' }],
        'perfectionist/sort-object-types': ['error', { order: 'asc', type: 'natural' }],
        'perfectionist/sort-objects': ['error', { order: 'asc', type: 'natural' }],
        'pnpm/json-enforce-catalog': 'off',
        'pnpm/json-valid-catalog': 'off',
        'pnpm/yaml-enforce-settings': 'off',
        'tailwindcss/no-custom-classname': 'off',
        'vue/attribute-hyphenation': ['error', 'never'],
        'vue/v-on-event-hyphenation': ['error', 'never'],
      },
      typescript: true,
      vue: true,
    }),
  )),
  {
    files: ['app/convex/**/*.ts', 'app/scripts/**/*.mjs'],
    rules: {
      'node/prefer-global/process': 'off',
    },
  },
  {
    files: ['app/app/layouts/**/*.vue'],
    rules: {
      'vue/no-multiple-template-root': 'off',
    },
  },
]
