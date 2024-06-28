<script setup lang="ts">
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

const { t } = useI18n()

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('onChange', value || '')
}
</script>

<template lang="html">
  <div class="relative">
    <!-- Sum -->
    <div
      :class="[{
        'opacity-0': !isShowSum,
        'left-3': isTransfer,
        'left-1/2 -translate-x-1/2': !isTransfer,
      }]"
      class="
        pointer-events-none
        absolute top-2
        text-center text-sm text-prima/60
      "
      tabindex="0"
    >
      {{ amount }}
    </div>

    <!-- Input -->
    <input
      :class="{
        'text-[#f92134] placeholder:text-red-700/80': highlight === 'income',
        'text-[#2cad22] placeholder:text-green-700/80': highlight === 'expense',
        'text-center': !isTransfer,
      }"
      :placeholder="t('enterAmount')"
      :value="amountRaw"
      class="
        swiper-no-swiping
        block size-full h-auto pt-6 pb-2 px-3
        text-3xl font-unica
        bg-transparent rounded-md
        placeholder:text-3xl placeholder:font-roboto
        hocus:bg-item-7
        focus:bg-item-7
        transition
      "
      type="text"
      inputmode="tel"
      @input="onInput"
    >
  </div>
</template>

<i18n lang="yaml">
en:
  enterAmount: Type amount

ru:
  enterAmount: Введите сумму
</i18n>
