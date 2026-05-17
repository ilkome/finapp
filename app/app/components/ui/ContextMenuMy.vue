<script setup lang="ts">
import { tv } from '@nuxt/ui/utils/tv'
import { ContextMenuRoot, ContextMenuTrigger } from 'reka-ui'

import type { ContextMenuItem } from '#ui/components/ContextMenu.vue'

import theme from '#build/ui/context-menu'
import { useAppConfig } from '#imports'
import { closeOtherContextMenus, registerContextMenu } from '~/composables/useContextMenuRegistry'

// Workaround: @nuxt/ui 4.6+ declares pressOpenDelay but never forwards it to reka-ui ContextMenuRoot.
const props = withDefaults(defineProps<{
  descriptionKey?: string
  disabled?: boolean
  items?: ContextMenuItem[][]
  labelKey?: string
  modal?: boolean
  portal?: boolean | string
  pressOpenDelay?: number
  size?: 'lg' | 'md' | 'sm' | 'xl' | 'xs'
}>(), {
  descriptionKey: 'description',
  labelKey: 'label',
  modal: false,
  portal: true,
  pressOpenDelay: 400,
})

const emit = defineEmits<{
  'update:open': [open: boolean]
}>()

const open = ref(false)

function close() {
  open.value = false
}

onMounted(() => {
  const unregister = registerContextMenu(close)
  onBeforeUnmount(unregister)
})

function onOpen(v: boolean) {
  open.value = v
  emit('update:open', v)
  if (v) {
    closeOtherContextMenus(close)
    window.addEventListener('scroll', close, { capture: true, once: true, passive: true })
  }
  else {
    window.removeEventListener('scroll', close, { capture: true })
  }
}

const appConfig = useAppConfig()
const ui = computed(() => tv({
  extend: tv(theme as any),
  ...(appConfig as any).ui?.contextMenu || {},
})({ size: props.size }))
</script>

<template>
  <ContextMenuRoot
    :open="open"
    :modal="props.modal"
    :pressOpenDelay="props.pressOpenDelay"
    @update:open="onOpen"
  >
    <ContextMenuTrigger asChild :disabled="props.disabled">
      <slot />
    </ContextMenuTrigger>
    <UContextMenuContent
      :items="props.items"
      :portal="props.portal"
      :labelKey="props.labelKey"
      :descriptionKey="props.descriptionKey"
      :ui="ui"
    />
  </ContextMenuRoot>
</template>
