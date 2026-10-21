<script setup lang="ts">
import { tv } from '@nuxt/ui/utils/tv'
import { ContextMenuRoot, ContextMenuTrigger, injectContextMenuRootContext } from 'reka-ui'

import type { ContextMenuItem } from '#ui/components/ContextMenu.vue'

import theme from '#build/ui/context-menu'
import { useAppConfig } from '#imports'
import { closeOtherContextMenus, registerContextMenu, setContextMenuOpen } from '~/composables/useContextMenuRegistry'

// Workaround: @nuxt/ui 4.6+ declares pressOpenDelay but never forwards it to reka-ui ContextMenuRoot.
const props = withDefaults(defineProps<{
  descriptionKey?: string
  disabled?: boolean
  // A getter builds the items only when the menu first opens: long lists render a menu per row.
  items?: ContextMenuItem[][] | (() => ContextMenuItem[][])
  labelKey?: string
  modal?: boolean
  portal?: boolean | string
  pressOpenDelay?: number
  size?: 'lg' | 'md' | 'sm' | 'xl' | 'xs'
}>(), {
  descriptionKey: 'description',
  labelKey: 'label',
  // Modal: reka locks the page (no hover, no clicks behind), so the first outside tap only closes the menu.
  modal: true,
  portal: true,
  pressOpenDelay: 500,
})

const emit = defineEmits<{
  'update:open': [open: boolean]
}>()

// Renderless bridge: rendered inside <ContextMenuRoot> so it can inject the
// real root context and actually drive open state via onOpenChange. Without
// this, the registry's close() would only mutate an unused outer ref while
// reka-ui keeps the menu open.
const RegistryBridge = defineComponent({
  setup() {
    const ctx = injectContextMenuRootContext()
    const close = () => ctx.onOpenChange(false)

    onMounted(() => {
      const unregister = registerContextMenu(close)
      onBeforeUnmount(() => {
        unregister()
        setContextMenuOpen(close, false)
        window.removeEventListener('scroll', close, { capture: true })
      })
    })

    watch(ctx.open, (v) => {
      setContextMenuOpen(close, v)
      if (v) {
        closeOtherContextMenus(close)
        window.addEventListener('scroll', close, { capture: true, once: true, passive: true })
      }
      else {
        window.removeEventListener('scroll', close, { capture: true })
      }
    })

    return () => null
  },
})

// Content mounts on the first open and stays for the exit animation: a row that is never pressed
// renders only its trigger.
const wasOpened = ref(false)
function onOpen(value: boolean) {
  if (value)
    wasOpened.value = true
  emit('update:open', value)
}

const items = computed(() => toValue(props.items))

const appConfig = useAppConfig()
const ui = computed(() => tv({
  extend: tv(theme as any),
  ...(appConfig as any).ui?.contextMenu || {},
})({ size: props.size } as any) as any)
</script>

<template>
  <ContextMenuRoot
    :modal="props.modal"
    :pressOpenDelay="props.pressOpenDelay"
    @update:open="onOpen"
  >
    <RegistryBridge />
    <ContextMenuTrigger asChild data-context-trigger :disabled="props.disabled">
      <slot />
    </ContextMenuTrigger>
    <UContextMenuContent
      v-if="wasOpened"
      class="max-w-72"
      :items="items"
      :portal="props.portal"
      :labelKey="props.labelKey"
      :descriptionKey="props.descriptionKey"
      :ui="ui"
    />
  </ContextMenuRoot>
</template>
