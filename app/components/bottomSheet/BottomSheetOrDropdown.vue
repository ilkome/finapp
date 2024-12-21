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
        drugClassesCustom="bottomSheetDrugClassesCustom"
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

            <slot name="content" :close />
          </div>
        </template>
      </BottomSheet>
    </Teleport>
  </template>
</template>
