<script setup lang="ts">
const props = defineProps<{
  align: 'left' | 'center' | 'right'
  amount: string
  isShowMinus?: boolean
  isShowPlus?: boolean
  isShowSymbol?: boolean
  symbol: string
}>()
</script>

<template>
  <div
    :class="cn('flex items-baseline gap-1 leading-none whitespace-nowrap',
               props.align === 'center' && 'justify-center',
               props.align === 'right' && 'justify-end',
               props.align === 'left' && 'justify-start',
    )"
  >
    <div v-if="isShowMinus">
      -
    </div>
    <div v-if="isShowPlus">
      +
    </div>

    <div>{{ amount }}</div>
    <div v-if="props.isShowSymbol">
      {{ symbol }}
    </div>
  </div>
</template>
