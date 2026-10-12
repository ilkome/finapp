<script setup lang="ts">
import { DrawerContent, DrawerHandle, DrawerOverlay, DrawerPortal, DrawerRoot, DrawerTitle } from 'reka-ui'

import { registerDrawer } from '~/composables/useDrawerHistory'

const props = defineProps<{
  // Resting height of the lower snap point, as a viewport fraction (<= 1) or pixels (> 1). The drawer
  // opens there and expands to the top snap point by swipe, wheel or scroll; absent => free height.
  collapsedSnap?: number
  contentClass?: string
  contentStyle?: Record<string, string>
  // Kept-mounted drawers: reka unmounts closed content unless forced.
  forceMount?: boolean
  // Live-preview mode: no overlay, the page stays scrollable and clickable; closes by swipe, Escape or Back.
  isPassthrough?: boolean
  title?: string
}>()

const emit = defineEmits<{
  closed: []
}>()

// `v-if`-mounted drawers leave this unbound: closing flips the local state, `closed` follows the animation.
const open = defineModel<boolean>('open', { default: true })

const TOP_SNAP = 0.98

function close() {
  open.value = false
}

let unregister: (() => void) | null = null
watch(open, (value) => {
  if (value) {
    unregister ??= registerDrawer(close)
    // The scaled page background pivots on the viewport, which sits this far down the scroll-locked page.
    document.documentElement.style.setProperty('--drawer-scroll-y', `${window.scrollY}px`)
    return
  }
  unregister?.()
  unregister = null
}, { immediate: true })
onBeforeUnmount(() => unregister?.())

const snapPoints = computed(() => props.collapsedSnap === undefined ? undefined : [props.collapsedSnap, TOP_SNAP])

// Snap points are measured against the drawer's own height, so it is as tall as the top one.
// The bleed is added on top: it hangs below the screen edge.
const height = computed(() => snapPoints.value ? { height: `calc(${TOP_SNAP * 100}dvh + var(--bleed))` } : undefined)

const snapPoint = ref<number | string | null>(snapPoints.value?.[0] ?? null)
watch(open, (value) => {
  if (value)
    snapPoint.value = snapPoints.value?.[0] ?? null
})

// Reka's own `update:openComplete` never fires on close: Presence unmounts the content on the same
// `animationend`, and the unmount drops reka's listener before it runs. The exit keyframes end here.
function onAnimationEnd(event: AnimationEvent) {
  if (event.target === event.currentTarget && event.animationName === 'drawer-slide-out')
    emit('closed')
}

// Reka writes the swipe progress only onto the content, so the overlay mirrors it to fade with the
// drag. A parent's content also receives its nested drawer's progress: only its own swipe (or the
// reset to 0) counts, and the last value carries the overlay into its exit fade.
const contentRef = useTemplateRef<{ $el?: HTMLElement }>('content')
const overlayRef = useTemplateRef<{ $el?: HTMLElement }>('overlay')
const contentEl = computed(() => contentRef.value?.$el)
useMutationObserver(contentEl, () => {
  const el = contentEl.value
  const progress = el?.style.getPropertyValue('--drawer-swipe-progress') || '0'
  if (el?.hasAttribute('data-swiping') || Number(progress) === 0)
    overlayRef.value?.$el?.style.setProperty('--drawer-progress', progress)
}, { attributeFilter: ['style', 'data-swiping'] })

const isExpanded = computed(() => !snapPoints.value || snapPoint.value === TOP_SNAP)

// Below the top snap point the drawer only follows a swipe that does not start in a scrollable list,
// so on touch the list stops scrolling there and a swipe up on it lifts the drawer. A mouse wheel
// scrolls the list right away and lifts the drawer with it.
const isTouch = useMediaQuery('(pointer: coarse)')
function expandOnWheel(event: WheelEvent) {
  if (!isExpanded.value && event.deltaY > 0)
    snapPoint.value = TOP_SNAP
}
</script>

<template>
  <DrawerRoot
    v-model:open="open"
    v-model:snapPoint="snapPoint"
    :modal="!props.isPassthrough"
    :snapPoints
    snapToSequentialPoints
  >
    <DrawerPortal :forceMount="props.forceMount">
      <!-- Reka skips the overlay of a nested drawer unless forced. -->
      <DrawerOverlay ref="overlay" class="drawer-overlay fixed inset-0 z-50 bg-overlay" :forceMount="props.forceMount" forceRender />
      <!-- No initial focus: on the phone it would raise the keyboard for the first field.
           `present` reaches reka's DismissableLayer through attrs, which the Drawer does not pass itself:
           without it a closed kept-mounted drawer keeps the body pointer lock and swallows Escape. -->
      <DrawerContent
        ref="content"
        :forceMount="props.forceMount"
        :present="open"
        :class="[
          props.isPassthrough && 'border border-b-0 border-accented',
          isTouch && !isExpanded && '[&_.drawer-body]:overflow-hidden [&_.scroller-block]:overflow-hidden',
          snapPoints && 'group/drawer',
          props.contentClass,
        ]"
        :style="[height, props.contentStyle]"
        :data-snap="snapPoints ? '' : undefined"
        :data-passthrough="props.isPassthrough ? '' : undefined"
        :initialFocus="false"
        class="drawer fixed right-(--scrollbar-width,0px) bottom-0 left-0 z-50 mx-auto flex w-full max-w-md flex-col overflow-hidden rounded-t-xl bg-default outline-none"
        @animationend="onAnimationEnd"
        @interactOutside="e => props.isPassthrough && e.preventDefault()"
        @wheel.passive="expandOnWheel"
      >
        <DrawerHandle class="absolute top-1.5 left-1/2 z-30 h-1 w-8 -translate-x-1/2 rounded-sm bg-inverted" />

        <div class="drawer-content">
          <div v-if="props.title || $slots.header">
            <DrawerTitle v-if="props.title" asChild>
              <UiTitleModal>{{ props.title }}</UiTitleModal>
            </DrawerTitle>
            <slot name="header" />
          </div>
          <!-- reka requires a title for screen readers even when the drawer shows none. -->
          <DrawerTitle v-if="!props.title" class="sr-only" />
          <slot :close />
        </div>
      </DrawerContent>
    </DrawerPortal>
  </DrawerRoot>
</template>
