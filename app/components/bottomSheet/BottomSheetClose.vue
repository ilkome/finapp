<script setup lang="ts">
const emit = defineEmits<{
  onClick: [e: Event]
}>()
</script>

<template>
  <div
    class="bg-item-4 hover:bg-item-hover absolute right-1 top-1 z-30 flex size-8 items-center justify-center rounded-full transition ease-in-out"
    @click="(e: Event) => emit('onClick', e)"
  >
    <Icon
      name="lucide:x"
      color="text-2"
      size="22"
    />
  </div>
</template>
