<script setup lang="ts">
const props = withDefaults(defineProps<{
  align?: 'center' | 'end' | 'start'
  bodyClass?: string
  collapsedSnap?: number
  contentClass?: string
  drawerStyle?: Record<string, string>
  isShowCloseBtn?: boolean
  keyboardTrigger?: boolean
  popoverBodyClass?: string
  popoverContentClass?: string
  title?: string
  unmountOnHide?: boolean
}>(), {
  align: 'start',
  unmountOnHide: true,
})

const emit = defineEmits<{
  // After the drawer's exit animation; a popover reports it as soon as it closes.
  closed: []
}>()

const open = defineModel<boolean>('open', { default: false })

const isLaptop = useIsLaptop()

// The drawer mounts on first open and stays through its exit animation: a closing `open` must not
// unmount it. Kept-mounted ones (unmountOnHide=false) never leave.
const isMounted = ref(false)
watch(open, (value) => {
  if (value)
    isMounted.value = true
}, { immediate: true })

function onClosed() {
  if (props.unmountOnHide)
    isMounted.value = false
  emit('closed')
}

watch(open, (value) => {
  if (!value && isLaptop.value)
    emit('closed')
})

function close() {
  open.value = false
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
      content: cn('z-50 overflow-hidden', props.popoverContentClass),
    }"
    class="popoverGroup grow overflow-hidden"
  >
    <slot name="trigger" :isActive="open" />

    <template #content>
      <UiPopoverWrap
        :title="props.title"
        :contentClass="props.popoverBodyClass"
        :isShowCloseBtn="props.isShowCloseBtn"
        :isShowScroll="!$slots.custom"
        @close="close"
      >
        <slot name="content" :close />
        <slot name="custom" :close />
      </UiPopoverWrap>
    </template>
  </UPopover>

  <div
    v-else
    class="grow"
    :role="props.keyboardTrigger ? 'button' : undefined"
    :tabindex="props.keyboardTrigger ? 0 : undefined"
    @click="open = true"
    @keydown.enter.prevent="props.keyboardTrigger && (open = true)"
    @keydown.space.prevent="props.keyboardTrigger && (open = true)"
  >
    <slot name="trigger" :isActive="open" />

    <Drawer
      v-if="isMounted"
      v-model:open="open"
      :title="props.title"
      :collapsedSnap="props.collapsedSnap"
      :contentClass="props.contentClass"
      :contentStyle="props.drawerStyle"
      :forceMount="!props.unmountOnHide"
      @closed="onClosed"
    >
      <template #default="{ close: closeDrawer }">
        <div v-if="$slots.content" :class="cn('drawer-body', props.bodyClass)">
          <slot name="content" :close="closeDrawer" />
        </div>

        <slot v-if="$slots.custom" name="custom" :close="closeDrawer" />
      </template>
    </Drawer>
  </div>
</template>
