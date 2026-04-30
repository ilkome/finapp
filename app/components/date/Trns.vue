<script setup lang="ts">
import { useDateFormats } from '~/components/date/useDateFormats'

const props = defineProps<{
  date: number
}>()

const { formatDate } = useDateFormats()
const formattedDate = computed(() => {
  const result = formatDate(props.date, 'full')
  return typeof result === 'object' ? result : undefined
})
</script>

<template>
  <div v-if="formattedDate" class="flex items-center gap-2">
    <div class="font-secondary text-3xl font-semibold">
      {{ formattedDate.day }}
    </div>

    <div class="text-muted">
      <div class="text-2xs pb-[2px] leading-none">
        {{ formattedDate.weekday }}
      </div>

      <div class="flex gap-1 text-sm leading-none font-medium">
        <div>{{ formattedDate.month }}</div>
        <div>{{ formattedDate.year }}</div>
      </div>
    </div>
  </div>
</template>
