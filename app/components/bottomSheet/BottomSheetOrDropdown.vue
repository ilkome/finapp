<script setup lang="ts">
import { usePointer, useWindowSize } from '@vueuse/core'

const props = defineProps<{
  isOpen?: boolean
  title: string
}>()

const emit = defineEmits<{
  onCloseModal: []
  onOpenModal: []
}>()

const { width } = useWindowSize()
const { pointerType } = usePointer()
const isLaptop = computed(() => width.value >= 766 && pointerType.value === 'mouse')
</script>

<template>
  <UPopover v-if="isLaptop">
    <slot name="trigger" />

    <template #panel="{ close }">
      <UiPopoverWrap
        :title="props.title"
        class="pb-3"
        @close="close"
      >
        <slot name="content" :close />
      </UiPopoverWrap>
    </template>
  </UPopover>

  <template v-else>
    <div @click="emit('onOpenModal')">
      <slot name="trigger" />
    </div>

    <Teleport to="body">
      <BottomSheet
        v-if="props.isOpen"
        isShow
        drugClassesCustom="bg-foreground-1 max-w-xl grid md:mb-12 max-h-[98dvh]"
        @closed="emit('onCloseModal')"
      >
        <template #handler="{ close }">
          <BottomSheetHandler />
          <BottomSheetClose @onClick="close" />
        </template>

        <template #default="{ close }">
          <div class="scrollerBlock grid max-h-[98dvh] overflow-hidden overflow-y-auto p-2 px-3 pb-4">
            <UiTitle class="px-1 pb-3 pt-2">
              {{ props.title }}
            </UiTitle>

            <slot name="content" :close />
          </div>
        </template>
      </BottomSheet>
    </Teleport>
  </template>
</template>
