<script setup lang="ts">
const props = withDefaults(defineProps<{
  align?: 'center' | 'end' | 'start'
  bottomSheetStyle?: Record<string, string>
  dragClassesCustom?: string
  isOpen?: boolean
  isShowCloseBtn?: boolean
  // Detent snap points for the mobile bottom sheet; ignored by the desktop
  // popover. See BottomSheet's `snapPoints`.
  snapPoints?: number[]
  title?: string
}>(), {
  align: 'start',
})

const emit = defineEmits<{
  closeModal: []
  openModal: []
}>()

const { width } = useWindowSize()
const { pointerType } = usePointer()
const isLaptop = computed(() => width.value >= 766 && pointerType.value === 'mouse')

const open = ref(false)
</script>

<template>
  <UPopover
    v-if="isLaptop"
    v-model:open="open"
    :content="{
      align: props.align,
      side: 'bottom',
    }"
    :ui="{
      content: 'z-50 overflow-hidden',
    }"
    class="popoverGroup grow overflow-hidden"
  >
    <slot name="trigger" :isActive="open" />

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
    @click="emit('openModal')"
  >
    <slot name="trigger" :isActive="props.isOpen" />

    <Teleport to="body">
      <BottomSheet
        v-if="props.isOpen"
        isShow
        :dragClassesCustom="`${props.dragClassesCustom ?? ''} bottomSheetDragClassesCustom`"
        :dragStyle="props.bottomSheetStyle"
        :snapPoints="props.snapPoints"
        @closed="emit('closeModal')"
      >
        <template #default="{ close, isExpanded }">
          <div class="bottomSheetContent">
            <UiTitleModal v-if="props.title">
              {{ props.title }}
            </UiTitleModal>

            <div
              v-if="$slots.content"
              class="bottomSheetContentInside scrollerBlock"
            >
              <slot name="content" :close :isExpanded />
            </div>

            <slot
              v-if="$slots.custom"
              name="custom"
              :close
              :isExpanded
            />
          </div>
        </template>
      </BottomSheet>
    </Teleport>
  </div>
</template>
