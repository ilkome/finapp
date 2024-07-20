<script setup lang="ts">
import dayjs from 'dayjs'
import type { Range } from '~/components/date/types'

const props = defineProps<{
  range: Range
  title?: string
}>()
</script>

<template>
  <div class="flex gap-1">
    <!-- <div>{{ title }}</div> -->
    <div>{{ dayjs(props.range.start).format('DD MMM YYYY') }}</div>
    <div>-</div>
    <div>{{ dayjs(props.range.end).format('DD MMM YYYY') }}</div>
  </div>
</template>
