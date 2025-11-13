<script setup lang="ts">
const emit = defineEmits<{
  onClick: [e: Event]
}>()
</script>

<template>
  <div
    class="bg-item-3 absolute top-1 right-1 z-30 flex size-8 items-center justify-center rounded-full transition ease-in-out hover:bg-[var(--item-5)]"
    @click="(e: Event) => emit('onClick', e)"
  >
    <Icon
      name="lucide:x"
      color="text-muted"
      size="22"
    />
  </div>
</template>
