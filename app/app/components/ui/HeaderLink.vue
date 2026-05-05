<script setup lang="ts">
const props = defineProps<{
  icon?: string
}>()

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    class="interactive flex min-h-[44px] items-center gap-3 rounded-sm px-2 py-1.5 text-sm font-medium"
    @click="e => emit('click', e)"
  >
    <div
      v-if="props.icon"
      class="flex min-w-8 items-center justify-center"
    >
      <Icon
        :name="props.icon"
        size="22"
        class="text-muted"
      />
    </div>

    <slot />
  </div>
</template>
