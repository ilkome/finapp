<script setup lang="ts">
const props = defineProps<{
  title: string
}>()

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
    contentClass="max-w-md"
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
    contentClass="min-h-[50dvh]"
    @closed="emit('closed')"
  >
    <template #default="{ close }">
      <div class="drawer-body">
        <ReuseBody :close />
      </div>
    </template>
  </Drawer>
</template>
