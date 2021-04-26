<script>
import Pickr from '@simonwep/pickr'
import '@simonwep/pickr/dist/themes/classic.min.css'

export default {
  name: 'ThemeEditor',
  data () {
    return {
      colors: [
        '--c-bg-1',
        '--c-bg-2',
        '--c-bg-3',
        '--c-bg-4',
        '--c-bg-5',
        '--c-bg-6',
        '--c-bg-7',
        '--c-bg-8',
        '--c-bg-9',
        '--c-bg-10',
        '--c-bg-11',
        '--c-bg-12',
        '--c-bg-13',
        '--c-bg-14'
      ]
    }
  },

  mounted () {
    this.initPickrs()
  },

  methods: {
    setColor (name, color) {
      document.documentElement.style.setProperty(name, color)
    },

    initPickrs () {
      for (const colorItem of this.colors) {
        const colorIdx = this.colors.indexOf(colorItem)
        const element = document.querySelector([`.initPickElement${colorIdx}`])

        Pickr.create({
          el: element,
          useAsButton: true,
          theme: 'classic',

          components: {
            // Main components
            preview: true,
            opacity: true,
            hue: true,

            // Input / output Options
            interaction: {
              hex: true,
              rgba: true,
              hsla: true,
              hsva: true,
              cmyk: true,
              input: true
            }
          }
        }).on('change', (color) => {
          const hexColor = color.toHEXA().toString()
          this.setColor(colorItem, hexColor)
        })
      }
    }
  }
}
</script>

<template lang="pug">
.colors
  .colorItem(
    v-for="(colorItem, colorIdx) in colors"
    :key="colorItem"
    :class="`initPickElement${colorIdx}`"
  ) {{ colorItem }}
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.colors
  display flex

.colorItem
  padding $m6
</style>
