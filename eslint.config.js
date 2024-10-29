import antfu from '@antfu/eslint-config'
import { extend } from 'eslint-flat-config-utils'
import perfectionist from 'eslint-plugin-perfectionist'
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
      plugins: {
        perfectionist,
      },
      rules: {
        '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
        'no-console': 'warn',
        'no-extra-semi': 'error',
        'perfectionist/sort-array-includes': ['error', { order: 'asc', type: 'natural' }],
        'perfectionist/sort-enums': ['error', { order: 'asc', type: 'natural' }],
        'perfectionist/sort-exports': ['error', { order: 'asc', type: 'natural' }],
        'perfectionist/sort-interfaces': ['error', { order: 'asc', type: 'natural' }],
        'perfectionist/sort-named-exports': ['error', { order: 'asc', type: 'natural' }],
        'perfectionist/sort-named-imports': ['error', { order: 'asc', type: 'natural' }],
        'perfectionist/sort-object-types': ['error', { order: 'asc', type: 'natural' }],
        'perfectionist/sort-objects': ['error', { order: 'asc', type: 'natural' }],
        'tailwindcss/no-custom-classname': 'off',
        'vue/attribute-hyphenation': ['error', 'never'],
        'vue/v-on-event-hyphenation': ['error', 'never'],
      },
    }),
  )),
]
