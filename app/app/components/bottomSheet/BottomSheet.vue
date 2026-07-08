<script setup lang="ts">
import { useBodyScrollLock } from 'reka-ui'

import { registerSheet } from '~/composables/useSheetHistory'

import { useBottomSheetDrag } from './useBottomSheetDrag'

const props = defineProps<{
  dragClassesCustom?: string
  dragStyle?: Record<string, string>
  // Opt in to browser-Back-to-close: pushes a synthetic history entry while
  // open so the Back gesture animate-closes this sheet. See useSheetHistory.
  history?: boolean
  isShow?: boolean
  // Detent sizes as viewport fractions (<= 1) or absolute pixels (> 1); the
  // largest is the expanded/rendered height, the rest are collapsed detents.
  // Enables the iOS/Android-style sheet that opens partway and expands on drag.
  // Absent => classic single-state sheet.
  snapPoints?: number[]
}>()

const emit = defineEmits<{
  closed: []
}>()

const settings = {
  pixelOffsetToStartClosing: 20,
  pixelsNeedToDragForClose: 60,
}

const drag = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const handlerRef = ref<HTMLElement | null>(null)

const { height: dragHeight } = useElementSize(drag)
const { height: windowHeight } = useWindowSize()

const {
  close,
  detentMode,
  dragStyles,
  init,
  isDragging,
  isExpanded,
  opened,
  overflowClasses,
  overlayStyles,
  removeEvents,
  wrapClasses,
} = useBottomSheetDrag({
  containerRef,
  drag,
  dragStyle: toRef(() => props.dragStyle),
  emit,
  handlerRef,
  settings,
  snapPoints: toRef(() => props.snapPoints),
  windowHeight,
})

// In detent mode the sheet renders at a fixed height (the largest/expanded snap
// point) so collapsed offsets are deterministic; detents slide it via transform.
// Snap points accept viewport fractions (<= 1) or absolute pixels (> 1).
const detentStyle = computed(() => {
  const points = props.snapPoints
  if (!Array.isArray(points) || points.length < 2)
    return null
  const wh = windowHeight.value || 1
  const expanded = Math.min(1, Math.max(...points.map(v => (v > 1 ? v / wh : v))))
  return { height: `${expanded * 100}dvh` }
})

const isBodyLocked = useBodyScrollLock(false)

// Browser-Back-to-close wiring (opt-in via `history`). Register when visible,
// unregister (consuming the synthetic history entry) when hidden. For nested
// sheets `isShow` is static true and mount/unmount is the open/close signal, so
// register runs via the immediate watch and cleanup via onBeforeUnmount.
let unregisterHistory: (() => void) | null = null
function registerHistory() {
  if (!props.history || unregisterHistory)
    return
  unregisterHistory = registerSheet(() => close())
}
function deregisterHistory() {
  unregisterHistory?.()
  unregisterHistory = null
}

watch(
  () => props.isShow,
  (value) => {
    if (value) {
      isBodyLocked.value = true
      init()
      registerHistory()
    }

    if (!value) {
      isBodyLocked.value = false
      removeEvents()
      deregisterHistory()
    }

    if (!value && opened.value) {
      close()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  isBodyLocked.value = false
  removeEvents()
  deregisterHistory()
})

const dragClasses = computed(() => [
  {
    'duration-100': !isDragging.value && opened.value && !detentMode.value,
    // Detents travel further than a close nudge, so ease them a touch slower.
    'duration-300': !isDragging.value && opened.value && detentMode.value,
    'pointer-events-none': isDragging.value && dragStyles.value.transform,
    'rounded-tl-xl rounded-tr-xl': dragHeight.value < windowHeight.value,
    'transition-opacity transition-transform': !isDragging.value && opened.value,
  },
  props.dragClassesCustom,
])
</script>

<template>
  <div
    ref="containerRef"
    :class="wrapClasses"
    class="fixed inset-0 z-50 size-full overflow-hidden select-none"
  >
    <div
      :class="overflowClasses"
      :style="overlayStyles"
      class="bg-overlay pointer-events-auto absolute inset-0 z-10 size-full"
      @click="close()"
    />

    <div
      ref="drag"
      :class="dragClasses"
      :style="[dragStyles, detentStyle]"
      class="drag pointer-events-auto absolute bottom-0 left-1/2 z-10 w-full -translate-x-1/2 translate-y-0 overflow-hidden"
      @click.stop=""
    >
      <div ref="handlerRef">
        <slot name="handler" :close="close">
          <BottomSheetHandler />
          <BottomSheetClose @click="close" />
        </slot>
      </div>

      <slot :close="close" :isExpanded="isExpanded" />
    </div>
  </div>
</template>
