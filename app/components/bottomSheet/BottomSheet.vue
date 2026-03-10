<script setup lang="ts">
import { useBottomSheetDrag } from './useBottomSheetDrag'

const props = defineProps<{
  dragClassesCustom?: string
  dragStyle?: Record<string, string>
  isShow?: boolean
}>()

const emit = defineEmits<{
  closed: []
}>()

// Settings
const settings = {
  pixelOffsetToStartClosing: 20,
  pixelsNeedToDragForClose: 60,
}

// Ref Elements
const drag = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const handlerRef = ref<HTMLElement | null>(null)

const { height: dragHeight } = useElementSize(drag)
const { height: windowHeight } = useWindowSize()

const {
  close,
  dragStyles,
  init,
  isDragging,
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
})

/**
 * Body scroll lock
 */
const isBodyLocked = useScrollLock(document.body)

/**
 * Run init when mounted or isShow changed
 */
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
    'pointer-events-none': isDragging.value && dragStyles.value.transform,
    'rounded-tl-xl rounded-tr-xl': dragHeight.value < windowHeight.value,
    'transition-opacity transition-transform duration-100':
      !isDragging.value && opened.value,
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
    <!-- Overlay -->
    <div
      :class="overflowClasses"
      :style="overlayStyles"
      class="absolute inset-0 z-10 size-full bg-(--overlay)"
      @click="close()"
    />

    <!-- Drag -->
    <div
      ref="drag"
      :class="dragClasses"
      :style="dragStyles"
      class="drag pointer-events-auto absolute bottom-0 left-1/2 z-10 w-full -translate-x-1/2 translate-y-0 overflow-hidden"
      @click.stop=""
    >
      <div ref="handlerRef">
        <slot name="handler" :close="close">
          <BottomSheetHandler />
          <BottomSheetClose @click="close" />
        </slot>
      </div>

      <slot :close="close" />
    </div>
  </div>
</template>
