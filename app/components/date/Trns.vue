<script setup lang="ts">
import { useDateFormats } from '~/components/date/useDateFormats'

const props = defineProps<{
  date: number
}>()

const { formatDate } = useDateFormats()
const formattedDate = computed(() => formatDate(props.date, 'full'))
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="_w-10 _text-center font-secondary text-3xl font-semibold">
      {{ formattedDate.day }}
    </div>

    <div class="text-2">
      <div class="pb-[2px] text-2xs leading-none">
        {{ formattedDate.weekday }}
      </div>

      <div class="flex gap-1 text-sm font-medium leading-none text-1">
        <div>{{ formattedDate.month }}</div>
        <div>{{ formattedDate.year }}</div>
      </div>
    </div>
  </div>
</template>
