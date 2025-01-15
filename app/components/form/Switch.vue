<script setup lang="ts">
defineProps<{
  title?: string
  value: boolean
}>()

const emit = defineEmits<{
  (e: 'click', value: boolean): void
}>()
</script>

<template>
  <div class="flex items-center" @click="emit('click', !value)">
    <div v-if="title" class="grow pr-4">
      {{ title }}
    </div>

    <div
      :class="{ 'bg-accent-1': value, 'bg-item-7': !value }"
      class="relative h-6 w-11 rounded-xl transition-colors ease-in-out"
    >
      <div
        :class="{ 'translate-x-[18px]': value }"
        class="absolute left-[3px] top-[2px] size-5 rounded-xl bg-white shadow-md transition-transform ease-in-out"
      />
    </div>
  </div>
</template>
