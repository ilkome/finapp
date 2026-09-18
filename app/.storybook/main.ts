import type { StorybookConfig } from '@storybook/vue3-vite'

import ui from '@nuxt/ui/vite'
import vue from '@vitejs/plugin-vue'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vite'

const appDir = fileURLToPath(new URL('../app', import.meta.url))
const rootDir = fileURLToPath(new URL('..', import.meta.url))
const stubsDir = fileURLToPath(new URL('./stubs', import.meta.url))

// Nuxt names a component by its path (`stat/sum/ItemView.vue` -> `StatSumItemView`); the
// unplugin resolver only knows file names, so walk the PascalCase name back to a path.
function resolveAppComponent(name: string) {
  const parts = name.replace(/^Lazy(?=[A-Z])/, '').match(/[A-Z][a-z0-9]*/g) ?? []
  for (let split = 0; split < parts.length; split++) {
    const dir = parts.slice(0, split).map(part => part.toLowerCase()).join('/')
    const file = parts.slice(split).join('')
    for (const base of [stubsDir, `${appDir}/components`]) {
      const path = `${base}/${dir ? `${dir}/` : ''}${file}.vue`
      if (existsSync(path))
        return path
    }
  }
}

const config: StorybookConfig = {
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: '@storybook/vue3-vite',
  stories: ['../app/components/**/*.stories.ts'],
  viteFinal: config => mergeConfig(config, {
    plugins: [
      vue(),
      // Nuxt UI's Vue-mode plugin brings Tailwind, its components, icons and auto-imports; the
      // app's own components and composables are layered on top the way Nuxt names them.
      // Stubs come first so a store-backed component (Amount) resolves to its lean stand-in.
      ui({
        autoImport: {
          dirs: [`${appDir}/composables`],
          dts: false,
          imports: ['vue', '@vueuse/core', { 'vue-i18n': ['useI18n'] }, { [`${stubsDir}/router`]: ['useRouter'] }],
        },
        colorMode: false,
        components: { dirs: [stubsDir], dts: false, resolvers: [resolveAppComponent] },
        dts: false,
        ui: {},
      }),
    ],
    resolve: { alias: { '~': appDir, '~~': rootDir } },
  }),
}

export default config
