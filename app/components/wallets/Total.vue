<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'

const props = defineProps<{
  activeType: string
  currencyCode: CurrencyCode
  items: unknown[]
}>()

const emit = defineEmits<{
  click: [v: string]
}>()
</script>

<template>
  <UiElement
    v-for="item in items"
    :key="item.id"
    :isActive="props.activeType === item.id"
    isShowLine
    class="group"
    insideClasses="!min-h-[48px]"
    @click="emit('click', item.id)"
  >
    <div
      class="pl-1 grow text-sm leading-none text-secondary"
    >
      {{ $t(`money.totals.${item.id}`) }}
    </div>

    <div class="pr-1 opacity-90">
      <Amount
        :amount="item.value"
        :currencyCode="currencyCode"
      />
    </div>
  </UiElement>
</template>
