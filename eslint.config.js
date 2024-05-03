import antfu from '@antfu/eslint-config'
import perfectionist from 'eslint-plugin-perfectionist'

export default antfu({
  formatters: {
    css: true,
    html: true,
  },

  plugins: {
    perfectionist,
  },

  rules: {
    'perfectionist/sort-array-includes': ['error', { order: 'asc', type: 'natural' }],
    'perfectionist/sort-enums': ['error', { order: 'asc', type: 'natural' }],
    'perfectionist/sort-exports': ['error', { order: 'asc', type: 'natural' }],
    // 'perfectionist/sort-imports': ['error', { order: 'asc', type: 'natural' }],
    'perfectionist/sort-interfaces': ['error', { order: 'asc', type: 'natural' }],
    'perfectionist/sort-interfaces': ['error', { order: 'asc', type: 'natural' }],
    'perfectionist/sort-named-exports': ['error', { order: 'asc', type: 'natural' }],
    'perfectionist/sort-named-imports': ['error', { order: 'asc', type: 'natural' }],
    'perfectionist/sort-object-types': ['error', { order: 'asc', type: 'natural' }],
    'perfectionist/sort-objects': ['error', { order: 'asc', type: 'natural' }],

    'vue/attribute-hyphenation': ['error', 'never'],
    'vue/v-on-event-hyphenation': ['error', 'never'],
  },
})
