<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'

const props = defineProps<{
  activeType?: string
  currencyCode: CurrencyCode
  items: {
    id: string
    value: number
  }[]
}>()

const emit = defineEmits<{
  click: [v: string]
}>()
</script>

<template>
  <div class="py-px">
    <UiElement
      v-for="item in items"
      :key="item.id"
      :isActive="props.activeType === item.id"
      :lineWidth="5"
      class="group"
      insideClasses="!min-h-[44px]"
      @click="emit('click', item.id)"
    >
      <div class="text-2 grow pl-1 text-sm leading-none">
        {{ $t(`money.types.${item.id}`) }}
      </div>

      <div class="pr-1 opacity-90">
        <Amount
          :amount="item.value"
          :currencyCode="currencyCode"
        />
      </div>
    </UiElement>
  </div>
</template>
