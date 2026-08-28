// primary/neutral must sit in appConfig before first paint (the module reads
// them to emit colour classes), so restore them here. radius and
// black-as-primary self-hydrate via useLocalStorage in useThemeOptions.
export default defineNuxtPlugin({
  enforce: 'post',
  setup() {
    const appConfig = useAppConfig()

    for (const type of ['primary', 'neutral'] as const) {
      const color = localStorage.getItem(`nuxt-ui-${type}`)
      if (color)
        appConfig.ui.colors[type] = color
    }
  },
})
