<script setup lang="ts">
const props = withDefaults(defineProps<{
  align?: 'center' | 'end' | 'start'
  bottomSheetStyle?: Record<string, string>
  dragClassesCustom?: string
  isOpen?: boolean
  isShowCloseBtn?: boolean
  keyboardTrigger?: boolean
  snapPoints?: number[]
  title?: string
  titleClass?: string
  unmountOnHide?: boolean
}>(), {
  align: 'start',
  unmountOnHide: true,
})

const emit = defineEmits<{
  closeModal: []
  openModal: []
}>()

const isLaptop = useIsLaptop()

const open = ref(false)

// Render the kept-mounted sheet only once it has first opened.
const hasOpened = ref(false)
watch(() => props.isOpen, (value) => {
  if (value)
    hasOpened.value = true
}, { immediate: true })

function closeMobileSheet(closeSheet: () => void) {
  if (props.unmountOnHide) {
    closeSheet()
    return
  }

  emit('closeModal')
}
</script>

<template>
  <UPopover
    v-if="isLaptop"
    v-model:open="open"
    :unmountOnHide="props.unmountOnHide"
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
        :titleClass="props.titleClass"
        :isShowCloseBtn="props.isShowCloseBtn"
        :isShowScroll="!$slots.custom"
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
    :role="props.keyboardTrigger ? 'button' : undefined"
    :tabindex="props.keyboardTrigger ? 0 : undefined"
    @click="emit('openModal')"
    @keydown.enter.prevent="props.keyboardTrigger && emit('openModal')"
    @keydown.space.prevent="props.keyboardTrigger && emit('openModal')"
  >
    <slot name="trigger" :isActive="props.isOpen" />

    <Teleport to="body">
      <BottomSheet
        v-if="props.unmountOnHide ? props.isOpen : hasOpened"
        :isShow="props.unmountOnHide ? true : props.isOpen"
        :dragClassesCustom="`${props.dragClassesCustom ?? ''} bottom-sheet-drag-classes-custom`"
        :dragStyle="props.bottomSheetStyle"
        :snapPoints="props.snapPoints"
        @closed="emit('closeModal')"
      >
        <template #default="{ close, isExpanded }">
          <div class="bottom-sheet-content">
            <UiTitleModal v-if="props.title" :class="props.titleClass">
              {{ props.title }}
            </UiTitleModal>

            <div
              v-if="$slots.content"
              class="bottom-sheet-content-inside scroller-block"
            >
              <slot name="content" :close="() => closeMobileSheet(close)" :isExpanded />
            </div>

            <slot
              v-if="$slots.custom"
              name="custom"
              :close="() => closeMobileSheet(close)"
              :isExpanded
            />
          </div>
        </template>
      </BottomSheet>
    </Teleport>
  </div>
</template>
