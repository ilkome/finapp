<script setup lang="ts">
import { formatDate } from '~/components/date/format'

const props = defineProps<{
  date: number
}>()

const formattedDate = computed(() => formatDate(props.date, 'full'))
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="_w-10 _text-center font-secondary text-3xl">
      {{ formattedDate.day }}
    </div>

    <div class="text-secondary">
      <div class="pb-[2px] text-2xs leading-none">
        {{ formattedDate.weekday }}
      </div>

      <div class="flex gap-1 text-xs leading-none">
        <div>{{ formattedDate.month }}</div>
        <div>{{ formattedDate.year }}</div>
      </div>
    </div>
  </div>
</template>
