<script setup lang="ts">
defineProps<{
  title?: string
  value: boolean
}>()

const emit = defineEmits<{
  click: [value: boolean]
}>()
</script>

<template>
  <div class="flex items-center" @click="emit('click', !value)">
    <div v-if="title" class="grow pr-4">
      {{ title }}
    </div>

    <div
      :class="cn(
        'relative h-5 w-10 rounded-xl px-0.5 py-px transition-colors ease-in-out',
        value ? 'bg-primary' : 'bg-elevated',
      )"
    >
      <div
        :class="cn(
          'size-4.5 rounded-xl bg-default shadow-md transition-transform ease-in-out',
          value && 'translate-x-4.5',
        )"
      />
    </div>
  </div>
</template>
