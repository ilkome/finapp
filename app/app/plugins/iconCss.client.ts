import { getIconCSS } from '@iconify/utils/lib/css/icon'
import { addIcon, getIcon, listIcons } from '@iconify/vue'

import { init as initClientBundle } from '#build/nuxt-icon-client-bundle'

// @nuxt/icon in css mode inserts a style element for each icon on its first render, ahead of every
// other sheet, and each insert restyles the whole document: a sheet that shows new category icons
// stalls its slide-in. Appending would not help (nuxt/icon#543): vue-echarts adopts a style sheet,
// which sorts after every style element, so an appended one is still an insert in the middle. The
// module skips an icon whose selector it finds in the page's style sheets on its first render, so the
// bundled icons get their rules here, before the app mounts, in one sheet built the way it builds them.
export default defineNuxtPlugin({
  enforce: 'pre',
  setup() {
    const { cssLayer, cssSelectorPrefix, cssWherePseudo } = useAppConfig().icon
    initClientBundle(addIcon)
    const rules = listIcons().map((name: string) => {
      const selector = `.${`${cssSelectorPrefix}${name}`.replace(/([^\w-])/g, '\\$1')}`
      return getIconCSS(getIcon(name)!, {
        format: 'compressed',
        iconSelector: cssWherePseudo ? `:where(${selector})` : selector,
      })
    }).join('')
    const style = document.createElement('style')
    style.textContent = cssLayer ? `@layer ${cssLayer} { ${rules} }` : rules
    document.head.prepend(style)
  },
})
