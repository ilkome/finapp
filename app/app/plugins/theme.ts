export default defineNuxtPlugin({
  enforce: 'post',
  setup() {
    const appConfig = useAppConfig()

    function updateColor(type: 'primary' | 'neutral') {
      const color = localStorage.getItem(`nuxt-ui-${type}`)
      if (color) {
        appConfig.ui.colors[type] = color
      }
    }

    function updateRadius() {
      const radius = localStorage.getItem('nuxt-ui-radius')
      if (radius) {
        appConfig.theme.radius = Number.parseFloat(radius)
      }
    }

    function updateBlackAsPrimary() {
      const blackAsPrimary = localStorage.getItem('nuxt-ui-black-as-primary')
      if (blackAsPrimary) {
        appConfig.theme.blackAsPrimary = blackAsPrimary === 'true'
      }
    }

    updateColor('primary')
    updateColor('neutral')
    updateRadius()
    updateBlackAsPrimary()
  },
})
