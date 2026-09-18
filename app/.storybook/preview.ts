import type { Preview } from '@storybook/vue3-vite'

import { setup } from '@storybook/vue3-vite'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'

import { cn } from '../app/composables/useCn'
import en from '../i18n/locales/en-US.js'
import Icon from './stubs/Icon.vue'
import StoryApp from './stubs/StoryApp.vue'
import '../app/assets/css/main.css'

setup((app) => {
  app.use(createPinia())
  app.use(createI18n({ legacy: false, locale: 'en', messages: { en } }))
  // Nuxt exposes auto-imports to templates as well; Vite's auto-import only covers scripts.
  app.config.globalProperties.cn = cn
  // Inline story templates skip the component resolver, so the Nuxt-only tags go global.
  app.component('Icon', Icon)
  app.component('NuxtLink', { props: { to: String }, template: '<a :href="to"><slot /></a>' })
})

const preview: Preview = {
  decorators: [
    (story, { globals }) => {
      // The app switches theme with a `dark` class on <html> (see main.css custom variant).
      document.documentElement.classList.toggle('dark', globals.theme === 'dark')
      return { components: { StoryApp }, template: '<StoryApp><story /></StoryApp>' }
    },
  ],
  globalTypes: {
    theme: {
      toolbar: { icon: 'mirror', items: ['light', 'dark'], title: 'Theme' },
    },
  },
  initialGlobals: { theme: 'dark' },
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
