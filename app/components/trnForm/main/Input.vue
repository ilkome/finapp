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

<template>
  <div class="relative">
    <!-- Sum -->
    <div
      :class="[{
        'opacity-0': !isShowSum,
        'left-3': isTransfer,
        'left-1/2 -translate-x-1/2': !isTransfer,
      }]"
      class="
        text-1/60
        pointer-events-none absolute
        top-2 text-center text-sm
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
        font-secondary -placeholder:text-3xl focus:bg-item-5 block size-full h-auto
        rounded-md bg-transparent
        px-3 pb-2
        pt-6
        text-3xl
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
  enterAmount: '0'

ru:
  enterAmount: '0'
</i18n>
