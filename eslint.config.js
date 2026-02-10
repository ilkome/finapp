import antfu from '@antfu/eslint-config'
import { extend } from 'eslint-flat-config-utils'
import tailwind from 'eslint-plugin-tailwindcss'

import withNuxt from './.nuxt/eslint.config.mjs'

export default [
  ...tailwind.configs['flat/recommended'],
  ...await extend(withNuxt(
    antfu({
      formatters: {
        css: true,
        html: true,
      },
      rules: {
        '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
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
        'pnpm/json-valid-catalog': 'off',
        'tailwindcss/no-custom-classname': 'off',
        'vue/attribute-hyphenation': ['error', 'never'],
        'vue/v-on-event-hyphenation': ['error', 'never'],
      },
    }),
  )),
]
