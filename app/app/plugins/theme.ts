import { blackAsPrimaryCss, radiusCss, snapRadius } from '~/components/theme/themeCss'

// Restores the saved look before first paint. `pre`: in SPA mode Nuxt UI's colors plugin writes a
// temporary <style> from appConfig as soon as it runs, so primary/neutral must already be there.
// Radius and the black accent reach the page through useHead in app.vue, which renders only after
// the app mounts, so they get the same kind of temporary <style> until that first head render.
export default defineNuxtPlugin({
  enforce: 'pre',
  setup() {
    const appConfig = useAppConfig()

    for (const type of ['primary', 'neutral'] as const) {
      const color = localStorage.getItem(`nuxt-ui-${type}`)
      if (color)
        appConfig.ui.colors[type] = color
    }

    const radius = localStorage.getItem('nuxt-ui-radius')
    const style = document.createElement('style')
    style.textContent = [
      radius === null ? '' : radiusCss(snapRadius(Number(radius))),
      blackAsPrimaryCss(localStorage.getItem('nuxt-ui-black-as-primary') === 'true'),
    ].join('\n')
    document.head.appendChild(style)

    const unhook = injectHead().hooks?.hook('dom:rendered', () => {
      style.remove()
      unhook?.()
    })
  },
})
