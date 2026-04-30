<script setup lang="ts">
const props = defineProps<{
  options: {
    label: string
    value: string
  }[]
  value: string
}>()

const emit = defineEmits<{
  change: [value: string]
}>()

const model = computed({
  get: () => props.value,
  set: (v: string) => emit('change', v),
})
</script>

<template>
  <USelectMenu
    v-model="model"
    :items="props.options"
    :searchInput="false"
    valueKey="value"
  />
</template>
