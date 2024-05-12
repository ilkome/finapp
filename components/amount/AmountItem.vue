<script setup lang="ts">
const props = defineProps<{
  align: 'left' | 'center' | 'right'
  amount: string
  isShowMinus?: boolean
  isShowPlus?: boolean
  symbol: string
}>()
</script>

<template>
  <div
    class="flex items-baseline gap-1 whitespace-nowrap leading-none"
    :class="{
      'justify-center': props.align === 'center',
      'justify-end': props.align === 'right',
      'justify-start': props.align === 'left',
    }"
  >
    <div v-if="isShowMinus">
      -
    </div>
    <div v-if="isShowPlus">
      +
    </div>

    <div>{{ amount }}</div>
    <div>{{ symbol }}</div>
  </div>
</template>
