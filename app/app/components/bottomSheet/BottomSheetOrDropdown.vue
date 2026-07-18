<script setup lang="ts">
const props = withDefaults(defineProps<{
  align?: 'center' | 'end' | 'start'
  bottomSheetStyle?: Record<string, string>
  dragClassesCustom?: string
  isOpen?: boolean
  isShowCloseBtn?: boolean
  // Opt-in only: makes the mobile trigger wrapper a keyboard-focusable button.
  // Off by default because most callers pass an interactive trigger (e.g.
  // UiActionButton); enabling it there would nest one button in another.
  keyboardTrigger?: boolean
  // Detent snap points for the mobile bottom sheet; ignored by the desktop
  // popover. See BottomSheet's `snapPoints`.
  snapPoints?: number[]
  title?: string
  // Keep content mounted while closed so its state (scroll, inputs, active tab)
  // survives reopen and reopening is instant. Desktop: passthrough to UPopover.
  // Mobile: the sheet mounts on first open, then hides via `isShow` instead of
  // remounting.
  unmountOnHide?: boolean
}>(), {
  align: 'start',
  unmountOnHide: true,
})

const emit = defineEmits<{
  closeModal: []
  openModal: []
}>()

const { width } = useWindowSize()
const { pointerType } = usePointer()
const isLaptop = computed(() => width.value >= 766 && pointerType.value === 'mouse')

const open = ref(false)

// When keeping content mounted, the mobile sheet is rendered once it first opens
// and then shown/hidden via `isShow` instead of remounted, so its state survives.
const hasOpened = ref(false)
watch(() => props.isOpen, (value) => {
  if (value)
    hasOpened.value = true
}, { immediate: true })
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
        :isShowCloseBtn="props.isShowCloseBtn"
        :scroll="!$slots.custom"
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
