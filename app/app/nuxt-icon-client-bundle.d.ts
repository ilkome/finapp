// @nuxt/icon generates this module for its components without declaring it for app code.
declare module '#build/nuxt-icon-client-bundle' {
  import type { IconifyIcon } from '@iconify/vue'

  export function init(addIcon: (name: string, data: IconifyIcon) => boolean): void
}
