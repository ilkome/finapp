<script setup lang="ts">
// One body, two shells: a dialog on a laptop, a bottom drawer on a phone. Opens on mount; `closed` fires after
// the leave animation, so the parent unmounts it then. The slot gets `close` to dismiss it from inside.
const props = withDefaults(defineProps<{
  /** The drawer opens at this height and expands by swipe or scroll; see `Drawer`. */
  collapsedSnap?: number
  drawerClass?: string
  modalClass?: string
  /** The body scrolls by itself (a form with its own scroller), so the drawer does not wrap it in `drawer-body`. */
  ownScroll?: boolean
  title: string
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
    @after:leave="emit('closed')"
  >
    <template #default="{ close }">
      <ReuseBody :close />
    </template>
  </UiModalWrap>

  <Drawer
    v-else
    :title="props.title"
    :collapsedSnap="props.collapsedSnap"
    :contentClass="props.drawerClass"
    @closed="emit('closed')"
  >
    <template #default="{ close }">
      <ReuseBody v-if="props.ownScroll" :close />
      <div v-else class="drawer-body">
        <ReuseBody :close />
      </div>
    </template>
  </Drawer>
</template>
