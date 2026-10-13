<script setup lang="ts">
const props = withDefaults(defineProps<{
  icon?: string
  iconSize?: number
}>(), {
  iconSize: 20,
})

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    class="flex min-h-10.5 items-center gap-3 rounded-sm interactive py-1.5 pr-2 pl-3 text-sm leading-none font-medium tracking-wide"
    @click="e => emit('click', e)"
  >
    <Icon
      v-if="props.icon"
      :name="props.icon"
      :size="props.iconSize"
      class="shrink-0 text-muted"
    />

    <slot />
  </div>
</template>
