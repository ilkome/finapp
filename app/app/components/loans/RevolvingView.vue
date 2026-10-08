<script setup lang="ts">
import type { MinPaymentStatus } from '~/components/loans/minPayment'

import { minPaymentStatusClass } from '~/components/loans/minPayment'

export type LoansRevolvingViewItem = {
  currencyCode: string
  /** Debt on the card, as a positive number. */
  debt: number
  fine: number
  interest: number
  minPayment: { amount: number, date: string, status: MinPaymentStatus } | null
  name: string
  walletId: string
}

const props = defineProps<{
  items: LoansRevolvingViewItem[]
}>()

const { t } = useI18n()
</script>

<template>
  <div v-if="props.items.length" class="grid gap-2">
    <UiTitleSection>
      {{ t('loans.revolving.title') }}
    </UiTitleSection>

    <UiElement
      v-for="(item, index) in props.items"
      :key="item.walletId"
      :lineWidth="index === props.items.length - 1 ? 0 : 3"
      :to="`/wallets/${item.walletId}`"
      data-loan-revolving-item
      insideClasses="items-start"
    >
      <div class="grid min-w-0 grow gap-1">
        <div class="flex flex-wrap items-baseline gap-2">
          <UiText variant="navigation">
            {{ item.name }}
          </UiText>
          <Amount
            :amount="item.debt"
            :currencyCode="item.currencyCode"
            :isShowBaseRate="false"
            class="ml-auto"
            align="left"
            variant="secondary"
          />
        </div>

        <div v-if="item.minPayment" class="flex items-center gap-1.5">
          <span
            class="size-1.5 shrink-0 rounded-full"
            :class="minPaymentStatusClass[item.minPayment.status]"
            :data-loan-min-status="item.minPayment.status"
          />
          <UiText variant="meta">
            {{ t('loans.minPaymentShort') }}
          </UiText>
          <Amount
            :amount="item.minPayment.amount"
            :currencyCode="item.currencyCode"
            :isShowBaseRate="false"
            align="left"
            variant="secondary"
          />
          <UiText variant="meta">
            {{ t('loans.by') }} {{ item.minPayment.date }}
          </UiText>
        </div>

        <div v-if="item.interest || item.fine" class="flex flex-wrap items-baseline gap-x-1.5" data-loan-revolving-cost>
          <UiText v-if="item.interest" variant="meta">
            {{ t('loans.interest') }}
          </UiText>
          <Amount
            v-if="item.interest"
            :amount="item.interest"
            :currencyCode="item.currencyCode"
            :isShowBaseRate="false"
            align="left"
            variant="secondary"
          />
          <UiText v-if="item.fine" variant="meta">
            {{ t('loans.fine') }}
          </UiText>
          <Amount
            v-if="item.fine"
            :amount="item.fine"
            :currencyCode="item.currencyCode"
            :isShowBaseRate="false"
            align="left"
            variant="secondary"
            class="text-expense-1!"
          />
        </div>
      </div>
    </UiElement>
  </div>
</template>
