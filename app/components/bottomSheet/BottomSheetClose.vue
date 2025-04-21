<script setup lang="ts">
const emit = defineEmits<{
  onClick: [e: Event]
}>()
</script>

<template>
  <div
    class="absolute right-1 top-1 z-30 flex size-8 items-center justify-center rounded-full bg-item-3 transition ease-in-out hover:bg-[var(--item-5)]"
    @click="(e: Event) => emit('onClick', e)"
  >
    <Icon
      name="lucide:x"
      color="text-(--ui-text-muted)"
      size="22"
    />
  </div>
</template>
