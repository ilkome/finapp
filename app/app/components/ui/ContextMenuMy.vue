<script setup lang="ts">
import { tv } from '@nuxt/ui/utils/tv'
import { ContextMenuRoot, ContextMenuTrigger, injectContextMenuRootContext, Primitive } from 'reka-ui'

import type { ContextMenuItem } from '#ui/components/ContextMenu.vue'

import theme from '#build/ui/context-menu'
import { useAppConfig } from '#imports'
import { closeOtherContextMenus, registerContextMenu, setContextMenuOpen } from '~/composables/useContextMenuRegistry'

// The trigger and the menu root are siblings: there is no single element for the host's attributes.
defineOptions({ inheritAttrs: false })

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

// A list renders a menu per row, and reka's root and trigger are about ten components each. Until the
// first open a row carries only the trigger's handlers (the same as reka's ContextMenuTrigger); then the
// root mounts with a hidden reka trigger, opened at the row's point by a `contextmenu` event of its own.
// The row's element stays: replacing it under a finger would lose the press.
const triggerStyle = { WebkitTouchCallout: 'none' }
const isMounted = ref(false)
const isOpen = ref(false)
const anchor = useTemplateRef<HTMLElement>('anchor')
let longPressTimer = 0

function isTouchOrPen(event: PointerEvent) {
  return event.pointerType !== 'mouse'
}

async function open(event: MouseEvent) {
  isMounted.value = true
  await nextTick()
  // Not bubbling: the document's `contextmenu` guard would prevent it, and reka opens only an unprevented one.
  anchor.value?.dispatchEvent(new MouseEvent('contextmenu', { cancelable: true, clientX: event.clientX, clientY: event.clientY }))
}

// reka checks `defaultPrevented` a tick later, so a child's own handler can keep the menu shut.
async function onContextmenu(event: PointerEvent) {
  if (props.disabled)
    return
  await nextTick()
  if (event.defaultPrevented)
    return
  window.clearTimeout(longPressTimer)
  open(event)
  if (!isTouchOrPen(event))
    event.preventDefault()
}

async function onPointerdown(event: PointerEvent) {
  if (props.disabled)
    return
  await nextTick()
  if (isTouchOrPen(event) && !event.defaultPrevented) {
    window.clearTimeout(longPressTimer)
    longPressTimer = window.setTimeout(open, props.pressOpenDelay, event)
  }
}

async function onPointerEnd(event: PointerEvent) {
  if (props.disabled)
    return
  await nextTick()
  if (isTouchOrPen(event) && !event.defaultPrevented)
    window.clearTimeout(longPressTimer)
}

onBeforeUnmount(() => window.clearTimeout(longPressTimer))

function onOpen(value: boolean) {
  isOpen.value = value
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
  <Primitive
    asChild
    data-context-trigger
    :data-state="isOpen ? 'open' : 'closed'"
    :data-disabled="props.disabled ? '' : undefined"
    :style="triggerStyle"
    @contextmenu="onContextmenu"
    @pointerdown="onPointerdown"
    @pointermove="onPointerEnd"
    @pointercancel="onPointerEnd"
    @pointerup="onPointerEnd"
  >
    <slot />
  </Primitive>

  <ContextMenuRoot
    v-if="isMounted"
    :modal="props.modal"
    @update:open="onOpen"
  >
    <RegistryBridge />
    <Teleport to="body">
      <ContextMenuTrigger asChild>
        <span ref="anchor" hidden />
      </ContextMenuTrigger>
    </Teleport>
    <UContextMenuContent
      class="max-w-72"
      :items="items"
      :portal="props.portal"
      :labelKey="props.labelKey"
      :descriptionKey="props.descriptionKey"
      :ui="ui"
    />
  </ContextMenuRoot>
</template>
