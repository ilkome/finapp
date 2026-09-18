import type { Preview } from '@storybook/vue3-vite'

import ui from '@nuxt/ui/vue-plugin'
import { setup } from '@storybook/vue3-vite'
import { createPinia } from 'pinia'
import usage from 'virtual:component-usage'
import { createI18n } from 'vue-i18n'

// Resolved by the Nuxt UI plugin to its Vue-mode stubs; the same reactive app config its
// colors plugin reads, so changing a color here re-emits the `--ui-color-*` palette.
import { useAppConfig } from '#imports'

import { NEUTRAL_COLORS, PRIMARY_COLORS, RADIUSES } from '../app/components/theme/useThemeOptions'
import { cn } from '../app/composables/useCn'
import en from '../i18n/locales/en-US.js'
import Icon from './stubs/Icon.vue'
import StoryApp from './stubs/StoryApp.vue'
import '../app/assets/css/main.css'

setup((app) => {
  // Nuxt UI's own Vue plugin: it injects the `--ui-color-*` palette from the app config, the
  // icon resolver and the head/router shims its components expect.
  app.use(ui)
  app.use(createPinia())
  app.use(createI18n({ legacy: false, locale: 'en', messages: { en } }))
  // Nuxt exposes auto-imports to templates as well; Vite's auto-import only covers scripts.
  app.config.globalProperties.cn = cn
  // Inline story templates skip the component resolver, so the Nuxt-only tags go global.
  app.component('Icon', Icon)
  app.component('NuxtLink', { props: { to: String }, template: '<a :href="to"><slot /></a>' })
})

// The appearance settings the app keeps in `useThemeOptions`: radius and the black accent are
// head styles, primary/neutral live in the app config (Nuxt UI derives the palette from them).
function applyAppearance(globals: Record<string, string>) {
  const appConfig = useAppConfig()
  const isBlack = globals.primary === 'black'
  appConfig.ui.colors.primary = isBlack ? 'black' : globals.primary
  appConfig.ui.colors.neutral = globals.neutral
  document.documentElement.style.setProperty('--ui-radius', `${globals.radius}rem`)
  let style = document.getElementById('nuxt-ui-black-as-primary')
  if (!style) {
    style = document.createElement('style')
    style.id = 'nuxt-ui-black-as-primary'
    document.head.appendChild(style)
  }
  style.textContent = isBlack ? ':root { --ui-primary: black; } .dark { --ui-primary: #ededed; }' : ''
}

// A dev-server SFC carries its path in `__file`; walk it back to the Nuxt name the usage map uses.
function usageOf(component: unknown) {
  const file = (component as { __file?: string } | undefined)?.__file?.split('/components/')[1]
  const name = file?.replace(/\.vue$/, '').split('/').map(part => part[0]!.toUpperCase() + part.slice(1)).join('')
  return name ? usage[name] : undefined
}

const preview: Preview = {
  decorators: [
    (story, { component, globals }) => {
      // The app switches theme with a `dark`/`light` class on <html> (nuxt color-mode with an
      // empty classSuffix); theme.css defines the palette on both, so neither may be missing.
      const isDark = globals.theme !== 'light'
      document.documentElement.classList.toggle('dark', isDark)
      document.documentElement.classList.toggle('light', !isDark)
      applyAppearance(globals)
      const used = usageOf(component)
      return {
        components: { StoryApp },
        data: () => ({ used }),
        template: `<StoryApp><story /></StoryApp>
          <div v-if="used" class="fixed right-2 bottom-2 text-xs text-muted" :title="used.files.join('\\n')">
            used {{ used.count }}× in {{ used.files.length }} files
          </div>`,
      }
    },
  ],
  globalTypes: {
    neutral: { toolbar: { icon: 'contrast', items: NEUTRAL_COLORS, title: 'Neutral' } },
    primary: { toolbar: { icon: 'paintbrush', items: ['black', ...PRIMARY_COLORS], title: 'Primary' } },
    radius: { toolbar: { icon: 'component', items: RADIUSES.map(String), title: 'Radius' } },
    theme: { toolbar: { icon: 'mirror', items: ['light', 'dark'], title: 'Theme' } },
  },
  // The app's defaults: black accent, `neutral` palette, 0.375rem radius.
  initialGlobals: { neutral: 'neutral', primary: 'black', radius: '0.375', theme: 'dark' },
  parameters: {
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
