<script setup lang="ts">
import { usePointer, useWindowSize } from '@vueuse/core'

const props = defineProps<{
  bottomSheetStyle?: Record<string, string>
  drugClassesCustom?: string
  isOpen?: boolean
  isShowCloseBtn?: boolean
  placement?: string
  title?: string
}>()

const emit = defineEmits<{
  onCloseModal: []
  onOpenModal: []
}>()

const { width } = useWindowSize()
const { pointerType } = usePointer()
const isLaptop = computed(() => width.value >= 766 && pointerType.value === 'mouse')

const open = ref(false)
</script>

<template>
  <div class="grow">
    <UPopover
      v-if="isLaptop"
      v-model:open="open"
      :popper="{
        placement: props.placement ?? 'bottom-start',
      }"
      :content="{
        align: 'center',
        side: 'bottom',
      }"
      :ui="{
        content: 'z-50 overflow-hidden',
      }"
      class="popoverGroup grow overflow-hidden"
    >
      <slot name="trigger" />

      <template #content>
        <UiPopoverWrap
          :title="props.title"
          :isShowCloseBtn="props.isShowCloseBtn"
          @close="() => open = false"
        >
          <slot
            name="content"
            :close="() => open = false"
          />
          <slot
            name="custom"
            :close="() => open = false"
          />
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
          :drugClassesCustom="`${props.drugClassesCustom ?? ''} bottomSheetDrugClassesCustom`"
          :drugStyle="props.bottomSheetStyle"
          @closed="emit('onCloseModal')"
        >
          <template #default="{ close }">
            <div class="bottomSheetContent">
              <UiTitleModal v-if="props.title">
                {{ props.title }}
              </UiTitleModal>

              <div
                v-if="$slots.content"
                class="scrollerBlock bottomSheetContentInside"
              >
                <slot name="content" :close />
              </div>

              <slot
                v-if="$slots.custom"
                name="custom"
                :close
              />
            </div>
          </template>
        </BottomSheet>
      </Teleport>
    </div>
  </div>
</template>
