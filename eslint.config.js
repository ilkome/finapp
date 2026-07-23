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
      '**/playwright-report/**',
      '.claude/**',
      '.understand-anything/**',
      'graphify-out/**',
      'app/playwright/profiles/**',
      'app/powersync/**',
      'app/supabase/config.toml',
      'app/supabase/functions/**', // Deno runtime, separate from the Nuxt toolchain
      'app/tests/e2e/.auth/**',
      'app/utils/migrate/data.json',
    ],
  },
  {
    // v4.2 ships configs.recommended as a single object scoped to js/ts only (no .vue) and with
    // its own languageOptions - spreading it would strip the Vue parser. Register the plugin
    // ourselves against .vue too and reuse just its ruleset.
    files: ['**/*.vue', '**/*.{js,jsx,ts,tsx}'],
    plugins: { tailwindcss: tailwind },
    rules: tailwind.configs.recommended.rules,
    settings: {
      tailwindcss: {
        cssConfigPath: `${import.meta.dirname}/app/app/assets/css/main.css`,
      },
    },
  },
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
    files: ['app/app/layouts/**/*.vue'],
    rules: {
      'vue/no-multiple-template-root': 'off',
    },
  },
]
