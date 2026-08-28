<script setup lang="ts">
import { useDateFormats } from '~/composables/useDateFormats'

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
    <UiText variant="display">
      {{ formattedDate.day }}
    </UiText>

    <div class="text-muted">
      <UiText class="pb-0.5" variant="caption">
        {{ formattedDate.weekday }}
      </UiText>

      <UiText class="flex gap-1" variant="navigation">
        <div>{{ formattedDate.month }}</div>
        <div v-if="formattedDate.year">
          {{ formattedDate.year }}
        </div>
      </UiText>
    </div>
  </div>
</template>
