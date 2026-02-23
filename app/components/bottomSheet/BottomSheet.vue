<script setup lang="ts">
import { useElementSize, useScrollLock, useWindowSize } from '@vueuse/core'

import { useBottomSheetDrag } from './useBottomSheetDrag'

const props = defineProps<{
  drugClassesCustom?: string
  drugStyle?: Record<string, string>
  isHideOverflow?: boolean
  isShow?: boolean
}>()

const emit = defineEmits<{
  closed: []
}>()

// Settings
const settings = {
  debug: true,
  pixelOffsetToStartClosing: 20,
  pixelsNeedToDrugForClose: 60,
}

// Ref Elements
const drug = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const handlerRef = ref<HTMLElement | null>(null)
const contentInside = ref<HTMLElement | null>(null)

const { height: drugHeight } = useElementSize(drug)
const { height: windowHeight } = useWindowSize()

const {
  close,
  drugStyles,
  init,
  isDragging,
  opened,
  overflowClasses,
  overlayStyles,
  removeEvents,
  wrapClasses,
} = useBottomSheetDrag({
  containerRef,
  contentInside,
  drug,
  drugStyle: toRef(() => props.drugStyle),
  emit,
  handlerRef,
  settings,
})

/**
 * Body scroll lock
 */
const isBodyLocked = import.meta.client ? useScrollLock(document.body) : ref(false)

/**
 * Run init when mounted or isShow changed
 */
watch(
  () => props.isShow,
  async (value) => {
    if (value) {
      isBodyLocked.value = true
      await init()
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

/**
 * Height
 */
const drugClasses = computed(() => [
  {
    'pointer-events-none': isDragging.value && drugStyles.value.transform,
    'rounded-tl-xl rounded-tr-xl': drugHeight.value < windowHeight.value,
    'transition-opacity transition-transform duration-100':
      !isDragging.value && opened.value,
  },
  props.drugClassesCustom,
])
</script>

<template>
  <div
    ref="containerRef"
    :class="[wrapClasses, { 'pointer-events-none': isHideOverflow }]"
    class="fixed inset-0 z-50 size-full overflow-hidden select-none"
  >
    <!-- Overlay -->
    <div
      v-if="!isHideOverflow"
      :class="overflowClasses"
      :style="overlayStyles"
      class="absolute inset-0 z-10 size-full bg-(--overlay)"
      @click="close()"
    />

    <!-- Drug -->
    <div
      ref="drug"
      :class="drugClasses"
      :style="drugStyles"
      class="drug pointer-events-auto absolute bottom-0 left-1/2 z-10 w-full -translate-x-1/2 translate-y-0 overflow-hidden"
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
