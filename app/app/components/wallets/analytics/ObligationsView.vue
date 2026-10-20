<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'

export type ObligationRow = {
  color: string
  /** Every payment inside the horizon. */
  horizonTotal: number
  kind: 'card' | 'loan'
  name: string
  nextAmount: number
  nextDateLabel: string
  walletId: string
}

const props = defineProps<{
  currencyCode: CurrencyCode
  horizonLabel: string
  items: ObligationRow[]
}>()

const emit = defineEmits<{
  select: [walletId: string]
}>()

const { t } = useI18n()
</script>

<template>
  <div v-if="props.items.length" class="grid rounded-md bg-elevated/30 py-px" data-obligations>
    <UiElement
      v-for="(item, index) in props.items"
      :key="item.walletId"
      chevron="right"
      :lineWidth="index === props.items.length - 1 ? 0 : 3"
      insideClasses="min-h-11!"
      :data-obligation="item.walletId"
      @click="emit('select', item.walletId)"
    >
      <template #leftIcon>
        <div class="flex size-7 items-center justify-center rounded-full" :style="{ background: item.color }">
          <Icon :name="item.kind === 'loan' ? 'lucide:landmark' : 'lucide:credit-card'" size="16" class="text-white" />
        </div>
      </template>

      <div class="grid min-w-0 grow gap-1">
        <UiEntityName>
          {{ item.name }}
        </UiEntityName>
        <div class="flex items-center gap-1 text-2xs leading-none text-muted">
          {{ item.nextDateLabel }}
          <Amount :amount="item.nextAmount" :currencyCode="props.currencyCode" :isShowBaseRate="false" variant="secondary" />
        </div>
      </div>

      <div class="grid justify-items-end gap-1 pr-1">
        <Amount :amount="-item.horizonTotal" :currencyCode="props.currencyCode" :isShowBaseRate="false" variant="row" />
        <UiText variant="caption">
          {{ props.horizonLabel }}
        </UiText>
      </div>
    </UiElement>
  </div>

  <UiEmpty v-else data-obligations-empty>
    {{ t('wallets.analytics.obligations.empty') }}
  </UiEmpty>
</template>
