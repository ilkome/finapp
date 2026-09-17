import type { Component } from 'vue'

/**
 * Setup for `*View` component tests: a pure view renders from plain props, so the only things
 * stubbed are Nuxt auto-imports and the few global components that reach into the app.
 */
import { config } from '@vue/test-utils'
import { vi } from 'vitest'
import * as vue from 'vue'

import { cn } from '~/composables/useCn'

for (const [name, value] of Object.entries(vue)) {
  if (typeof value === 'function' && !(name in globalThis))
    vi.stubGlobal(name, value)
}
vi.stubGlobal('cn', cn)
vi.stubGlobal('useI18n', () => ({ t: (key: string) => key }))
vi.stubGlobal('useIdleMount', () => vue.ref(true))

config.global.mocks = { $t: (key: string) => key, cn }
config.global.stubs = {
  Amount: { props: ['amount', 'currencyCode'], template: '<span data-amount>{{ amount }} {{ currencyCode }}</span>' },
  Icon: { props: ['name'], template: '<i :data-icon="name" />' },
  UTooltip: { template: '<div><slot /></div>' },
}

// Register the pure views and the leaf components they compose the way Nuxt does
// (folder prefix + file name: `ui/Text.vue` -> `UiText`), so a test passes props only.
// ContextMenuMy and Header pull in `#imports`, which only exists inside Nuxt.
const modules = import.meta.glob<{ default: Component }>([
  '~/components/**/*View.vue',
  '~/components/ui/*.vue',
  '!~/components/ui/ContextMenuMy.vue',
  '!~/components/ui/Header.vue',
  '~/components/categories/Name.vue',
  '~/components/wallets/Item*.vue',
  '~/components/wallets/Icon.vue',
  '~/components/trns/Item.vue',
  '~/components/trns/ListGroupSum.vue',
], { eager: true })

for (const [path, mod] of Object.entries(modules)) {
  const name = path.split('/components/')[1]!.replace(/\.vue$/, '').split('/').map(part => part[0]!.toUpperCase() + part.slice(1)).join('')
  config.global.components[name] = mod.default
}
