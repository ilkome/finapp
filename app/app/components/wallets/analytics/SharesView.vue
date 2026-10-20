<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletId, WalletItemComputed } from '~/components/wallets/types'

export type AnalyticsShareRow = {
  color: string
  /** Wallets in the group; shown for type and currency groups. */
  count?: number
  id: string
  name: string
  share: number
  signedValue: number
  /** A row that is one wallet renders as the wallets list row. */
  wallet?: WalletItemComputed
}

const props = defineProps<{
  currencyCode: CurrencyCode
  /** A row opens a sheet (ellipsis) rather than another page (chevron). */
  isRowSheet?: boolean
  items: AnalyticsShareRow[]
  totalLabel: string
  totalValue: number
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const percent = (share: number) => `${Math.round(share * 1000) / 10}%`
</script>

<template>
  <div class="grid gap-2" data-analytics-shares>
    <!-- Wallet rows carry their own background, like the wallets list; group rows share one. -->
    <div :class="props.items.some(item => item.wallet) ? 'grid gap-1' : 'grid rounded-md bg-elevated/30 py-px'">
      <template v-for="(item, index) in props.items" :key="item.id">
        <WalletsRow
          v-if="item.wallet"
          :baseCurrencyCode="props.currencyCode"
          :chevron="props.isRowSheet ? 'more' : 'right'"
          :data-share-item="item.id"
          :wallet="item.wallet"
          :walletId="item.id as WalletId"
          @click="emit('select', item.id)"
        >
          <template #append>
            <div class="w-12 shrink-0 text-right text-xs leading-none text-muted tabular-nums" data-share-percent>
              {{ percent(item.share) }}
            </div>
          </template>
        </WalletsRow>
        <UiElement
          v-else
          :chevron="props.isRowSheet ? 'more' : 'right'"
          :lineWidth="index === props.items.length - 1 ? 0 : 3"
          insideClasses="min-h-10!"
          :data-share-item="item.id"
          @click="emit('select', item.id)"
        >
          <div class="size-2.5 shrink-0 rounded-full" :style="{ background: item.color }" />

          <div class="flex min-w-0 grow items-baseline gap-2 text-sm leading-none text-muted">
            <span class="truncate">{{ item.name }}</span>
            <span v-if="item.count" class="text-2xs text-dimmed">{{ item.count }}</span>
          </div>

          <div class="w-12 text-right text-xs leading-none text-muted tabular-nums" data-share-percent>
            {{ percent(item.share) }}
          </div>

          <Amount
            :amount="item.signedValue"
            :currencyCode="props.currencyCode"
            :isShowBaseRate="false"
            class="pr-1"
            variant="row"
          />
        </UiElement>
      </template>

      <div class="flex items-center gap-3 px-3 py-2.5">
        <UiText variant="meta" class="grow">
          {{ props.totalLabel }}
        </UiText>
        <Amount
          :amount="props.totalValue"
          :currencyCode="props.currencyCode"
          :isShowBaseRate="false"
          variant="row"
        />
      </div>
    </div>
  </div>
</template>
