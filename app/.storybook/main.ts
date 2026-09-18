import type { StorybookConfig } from '@storybook/vue3-vite'

import ui from '@nuxt/ui/vite'
import vue from '@vitejs/plugin-vue'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
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

// Where each app component is used, keyed by its Nuxt name (`UiTabs`), counted from the tags in
// every `.vue` file that is not a story. Served as a virtual module so the preview can show it.
function componentUsage() {
  const files = readdirSync(appDir, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.vue'))
    .map(entry => `${entry.parentPath}/${entry.name}`)
  const names = files
    .filter(file => file.startsWith(`${appDir}/components/`))
    .map(file => file.slice(`${appDir}/components/`.length, -4).split('/').map(part => part[0]!.toUpperCase() + part.slice(1)).join(''))
  const usage: Record<string, { count: number, files: string[] }> = {}
  for (const name of names)
    usage[name] = { count: 0, files: [] }
  const tag = new RegExp(`<(?:Lazy)?(${names.join('|')})(?=[\\s/>])`, 'g')
  for (const file of files) {
    for (const [, name] of readFileSync(file, 'utf8').matchAll(tag)) {
      const entry = usage[name!]!
      entry.count++
      const short = file.slice(appDir.length + 1)
      if (!entry.files.includes(short))
        entry.files.push(short)
    }
  }
  return usage
}

// `app.config.ts` is Nuxt-only source: it calls the auto-imported `defineAppConfig`, and its
// `ui` block (colors and every component override) is what makes the app look like itself.
async function loadAppUiConfig() {
  ;(globalThis as any).defineAppConfig = (value: unknown) => value
  const { default: appConfig } = await import(`${appDir}/app.config.ts`)
  return appConfig.ui as Record<string, unknown>
}

const config: StorybookConfig = {
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: '@storybook/vue3-vite',
  stories: ['../app/components/**/*.stories.ts'],
  viteFinal: async config => mergeConfig(config, {
    plugins: [
      {
        load: (id: string) => (id === 'virtual:component-usage' ? `export default ${JSON.stringify(componentUsage())}` : undefined),
        name: 'finapp:component-usage',
        resolveId: (id: string) => (id === 'virtual:component-usage' ? id : undefined),
      },
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
        ui: await loadAppUiConfig(),
      }),
    ],
    // `#ui` is the Nuxt module's alias for @nuxt/ui's runtime; the Vue-mode plugin does not add it.
    resolve: { alias: { '#ui': `${rootDir}/node_modules/@nuxt/ui/dist/runtime`, '~': appDir, '~~': rootDir } },
  }),
}

export default config
