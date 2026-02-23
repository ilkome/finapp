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
      :class="cn('relative h-5 w-10 rounded-xl py-px px-[2px] transition-colors ease-in-out',
                 value ? 'bg-(--ui-primary)' : 'bg-(--ui-bg-accented)',
      )"
    >
      <div
        :class="cn('bg-default size-4.5 rounded-xl shadow-md transition-transform ease-in-out',
                   value && 'translate-x-4.5',
        )"
      />
    </div>
  </div>
</template>
