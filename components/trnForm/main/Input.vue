<script setup lang="ts">
import { formatInput } from '~/components/trnForm/utils/calculate'

defineProps<{
  amount: number
  amountRaw: string
  highlight?: 'income' | 'expense'
  isShowSum: boolean
  isTransfer?: boolean
}>()

const emit = defineEmits<{
  (e: 'onChange', value: string): void
}>()

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('onChange', value || '')
}
</script>

<template lang="pug">
.relative
  //- Sum
  div(
    :class=`[{
      'opacity-0': !isShowSum,
      'left-3': isTransfer,
      'left-1/2 -translate-x-1/2': !isTransfer,
    }]`
    class=`
      pointer-events-none
      absolute top-2
      text-center text-sm text-primary/60
    `
    tabindex="0"
  ).
    {{ formatInput(amount) }}

  //- Input
  input(
    :class=`{
      'text-[#f92134] placeholder_text-red-700/80': highlight === 'income',
      'text-[#2cad22] placeholder_text-green-700/80': highlight === 'expense',
      'text-center': !isTransfer,
    }`
    :placeholder="$t('enterAmount')"
    :value="amountRaw"
    class=`
      swiper-no-swiping
      block w-full h-auto pt-6 pb-2 px-3
      text-3xl font-unica
      bg-transparent rounded-md
      placeholder_text-3xl placeholder_font-roboto
      hocus_bg-item-hover
      focus_bg-item-hover
      transition
    `
    type="text"
    inputmode="tel"
    @input="onInput"
  )
</template>

<i18n lang="yaml">
en:
  enterAmount: Type amount

ru:
  enterAmount: Введите сумму
</i18n>
