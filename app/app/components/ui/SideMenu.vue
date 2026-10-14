<script lang="ts">
import type { InjectionKey, Ref } from 'vue'

// One level of side menus: at most one is open, and a pointer inside a nested (portaled) panel
// keeps every ancestor open, since DOM pointer events do not travel through a teleport.
type Level = { current: Ref<(() => void) | null>, enter: () => void, leave: () => void }

const LEVEL: InjectionKey<Level> = Symbol('sideMenuLevel')
const rootLevel: Level = { current: ref(null), enter() {}, leave() {} }
</script>

<script setup lang="ts">
// Laptop-only nested menu: opens beside the parent menu on hover instead of replacing it.
// The trigger goes in the default slot, the panel body in `content`.
defineProps<{ contentClass?: string }>()

const CLOSE_DELAY = 200
// Switching from an open sibling waits a moment: a diagonal move toward the open panel crosses
// other rows, and those must not open on the way.
const SWITCH_DELAY = 120

const open = defineModel<boolean>('open', { default: false })

const parent = inject(LEVEL, rootLevel)
// Switching between siblings must not animate; only the first open and the last close do.
const skipAnimation = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
let switchTimer: ReturnType<typeof setTimeout> | undefined

function cancelClose() {
  clearTimeout(timer)
}

function scheduleClose() {
  cancelClose()
  timer = setTimeout(() => {
    skipAnimation.value = false
    open.value = false
  }, CLOSE_DELAY)
}

function displace() {
  cancelClose()
  skipAnimation.value = true
  open.value = false
}

provide(LEVEL, {
  current: ref(null),
  enter() {
    cancelClose()
    parent.enter()
  },
  leave() {
    scheduleClose()
    parent.leave()
  },
})

function openNow() {
  skipAnimation.value = !!parent.current.value
  parent.current.value?.()
  open.value = true
}

function onTriggerEnter() {
  cancelClose()
  parent.enter()
  if (open.value)
    return
  clearTimeout(switchTimer)
  if (parent.current.value)
    switchTimer = setTimeout(openNow, SWITCH_DELAY)
  else
    openNow()
}

function onTriggerLeave() {
  clearTimeout(switchTimer)
  scheduleClose()
  parent.leave()
}

watch(open, (value) => {
  if (value)
    parent.current.value = displace
  else if (parent.current.value === displace)
    parent.current.value = null
}, { immediate: true })

onBeforeUnmount(() => {
  cancelClose()
  clearTimeout(switchTimer)
  if (parent.current.value === displace)
    parent.current.value = null
})
</script>

<template>
  <UPopover
    v-model:open="open"
    :content="{ align: 'start', collisionPadding: 8, side: 'right', sideOffset: 8 }"
    :ui="{ content: cn('z-[80] w-64 max-w-[calc(100vw-1rem)] overflow-hidden', skipAnimation && 'data-[state=closed]:animate-none! data-[state=open]:animate-none!', contentClass) }"
  >
    <div @pointerenter="onTriggerEnter" @pointerleave="onTriggerLeave">
      <div @click.stop>
        <slot />
      </div>
    </div>

    <template #content>
      <div
        class="scroller max-h-(--reka-popper-available-height) overflow-y-auto p-2"
        @pointerenter="() => { cancelClose(); parent.enter() }"
        @pointerleave="() => { scheduleClose(); parent.leave() }"
      >
        <slot name="content" />
      </div>
    </template>
  </UPopover>
</template>
