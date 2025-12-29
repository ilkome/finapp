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
      :class="{ 'bg-(--ui-primary)': value, 'bg-(--ui-bg-accented)': !value }"
      class="relative h-5 w-10 rounded-xl p-px px-[2px] transition-colors ease-in-out"
    >
      <div
        :class="{ 'translate-x-4.5': value }"
        class="bg-default size-4.5 rounded-xl shadow-md transition-transform ease-in-out"
      />
    </div>
  </div>
</template>
