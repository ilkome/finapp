<script setup lang="ts">
import { formatDate } from '~/utils/formatDate'

const props = defineProps<{
  date: number
}>()

const formattedDate = computed(() => formatDate(props.date, 'full'))
</script>

<template lang="pug">
.flex.items-center.gap-2
  .text-3xl.font-unica {{ formattedDate.day }}

  .text-xs.leading-none
    div(class="pb-[2px]") {{ formattedDate.weekday }}

    .flex.gap-1
      div {{ formattedDate.month }}
      div {{ formattedDate.year }}
</template>
