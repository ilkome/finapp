<script setup lang="ts">
import { usePointer, useWindowSize } from '@vueuse/core'

const props = defineProps<{
  bottomSheetStyle?: Record<string, string>
  drugClassesCustom?: string
  isOpen?: boolean
  placement?: string
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
  <div class="grow">
    <UPopover
      v-if="isLaptop"
      :popper="{
        placement: props.placement ?? 'bottom-start',
      }"
      class="popoverGroup grow"
    >
      <slot name="trigger" />

      <template #panel="{ close }">
        <UiPopoverWrap
          :title="props.title"
          class="pb-1"
          @close="close"
        >
          <slot name="content" :close />
        </UiPopoverWrap>
      </template>
    </UPopover>

    <div
      v-else
      class="grow"
      @click="emit('onOpenModal')"
    >
      <slot name="trigger" />

      <Teleport to="body">
        <BottomSheet
          v-if="props.isOpen"
          isShow
          :drugClassesCustom="`${props.drugClassesCustom ?? ''}`"
          :drugStyle="props.bottomSheetStyle"
          @closed="emit('onCloseModal')"
        >
          <template #handler="{ close }">
            <BottomSheetHandler />
            <BottomSheetClose @onClick="close" />
          </template>

          <template #default="{ close }">
            <div class="bottomSheetContent">
              <UiTitleModal>
                {{ props.title }}
              </UiTitleModal>

              <div class="scrollerBlock bottomSheetContentInside">
                <slot name="content" :close />
              </div>
            </div>
          </template>
        </BottomSheet>
      </Teleport>
    </div>
  </div>
</template>
