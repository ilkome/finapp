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
      class="pointer-events-none absolute top-2 text-center text-sm text-1/60"
      tabindex="0"
    >
      {{ amount }}
    </div>

    <FormInput
      :class="{
        '!text-income-1 placeholder:!text-income-1': highlight === 'income',
        '!text-expense-1 placeholder:!text-expense-1': highlight === 'expense',
        'text-center': !isTransfer,
      }"
      :placeholder="t('enterAmount')"
      :value="amountRaw"
      class="swiper-no-swiping border-transparent bg-item-2 pb-2 pt-6 text-center font-secondary !text-3xl placeholder:text-3xl"
      inputmode="tel"
      @updateValue="(value: string) => emit('onChange', value || '')"
    />
  </div>
</template>

<i18n lang="yaml">
en:
  enterAmount: '0'

ru:
  enterAmount: '0'
</i18n>
