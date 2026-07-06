<script setup lang="ts">
import { useBodyScrollLock } from 'reka-ui'

import { useBottomSheetDrag } from './useBottomSheetDrag'

const props = defineProps<{
  dragClassesCustom?: string
  dragStyle?: Record<string, string>
  isShow?: boolean
  // Ascending viewport-height fractions (0,1]; last = expanded/rendered height,
  // earlier entries are collapsed detents. Enables the iOS/Android-style sheet
  // that opens partway and expands on drag. Absent => classic single-state sheet.
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

// In detent mode the sheet renders at a fixed height (the last/expanded snap
// point) so collapsed offsets are deterministic; detents slide it via transform.
const detentStyle = computed(() => {
  const points = props.snapPoints
  if (!Array.isArray(points) || points.length < 2)
    return null
  return { height: `${points[points.length - 1]! * 100}dvh` }
})

const isBodyLocked = useBodyScrollLock(false)

watch(
  () => props.isShow,
  (value) => {
    if (value) {
      isBodyLocked.value = true
      init()
    }

    if (!value) {
      isBodyLocked.value = false
      removeEvents()
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
