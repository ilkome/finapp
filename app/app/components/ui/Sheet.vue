<script setup lang="ts">
// One body, two shells: a dialog on a laptop, a bottom drawer on a phone. Opens on mount; `closed` fires after
// the leave animation, so the parent unmounts it then. The slot gets `close` to dismiss it from inside.
const props = withDefaults(defineProps<{
  /** The drawer opens at this height and expands by swipe or scroll; see `Drawer`. */
  collapsedSnap?: number
  drawerClass?: string
  /** Scrolled content passes under the translucent title (a phone drawer). */
  isTitleOverlay?: boolean
  modalClass?: string
  /** The body scrolls by itself (a form with its own scroller), so the drawer does not wrap it in `drawer-body`. */
  ownScroll?: boolean
  title: string
  titleIcon?: { color?: string, name: string }
}>(), {
  drawerClass: 'min-h-[50dvh]',
})

const emit = defineEmits<{
  closed: []
}>()

// vueuse types a binding as a prop option, so a function type must stay `any`.
const [DefineBody, ReuseBody] = createReusableTemplate<{ close: any }>()
const isLaptop = useIsLaptop()
</script>

<template>
  <DefineBody v-slot="{ close }">
    <slot :close />
  </DefineBody>

  <UiModalWrap
    v-if="isLaptop"
    defaultOpen
    :contentClass="props.modalClass"
    :title="props.title"
    :titleIcon="props.titleIcon"
    @after:leave="emit('closed')"
  >
    <template #default="{ close }">
      <ReuseBody :close />
    </template>
    <template v-if="$slots.titleActions" #titleActions>
      <slot name="titleActions" />
    </template>
  </UiModalWrap>

  <Drawer
    v-else
    :title="props.title"
    :titleIcon="props.titleIcon"
    :collapsedSnap="props.collapsedSnap"
    :contentClass="props.drawerClass"
    :isTitleOverlay="props.isTitleOverlay"
    @closed="emit('closed')"
  >
    <template #default="{ close }">
      <ReuseBody v-if="props.ownScroll" :close />
      <div v-else class="drawer-body" :style="props.isTitleOverlay ? { paddingTop: 'var(--drawer-title-h)' } : undefined">
        <ReuseBody :close />
      </div>
    </template>
    <template v-if="$slots.titleActions" #titleActions>
      <slot name="titleActions" />
    </template>
  </Drawer>
</template>
