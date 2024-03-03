import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: {
    /**
     * Format CSS, LESS, SCSS files, also the `<style>` blocks in Vue
     * By default uses Prettier
     */
    css: true,
    /**
     * Format HTML files
     * By default uses Prettier
     */
    html: true,
  },
  rules: {
    'vue/attribute-hyphenation': ['error', 'never'],
    'vue/v-on-event-hyphenation': ['error', 'never'],
  },
})
