<script setup lang="ts">
import type { MinPaymentStatus } from '~/components/loans/minPayment'

export type LoansRevolvingViewItem = {
  /** Interest and fees of this card, by preformatted month. */
  byMonth: { fine: number, interest: number, month: string }[]
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

const statusClass: Record<MinPaymentStatus, string> = {
  due: 'bg-warning',
  overdue: 'bg-error',
  paid: 'bg-success',
  stale: 'bg-muted',
}
</script>

<template>
  <div v-if="props.items.length" class="grid gap-2">
    <UiText variant="section">
      {{ t('loans.revolving.title') }}
    </UiText>

    <NuxtLink
      v-for="item in props.items"
      :key="item.walletId"
      :to="`/wallets/${item.walletId}`"
      class="border-elevated/40 grid gap-1 border-b py-2 last:border-0"
      data-loan-revolving-item
    >
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
          :class="statusClass[item.minPayment.status]"
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

      <div class="flex flex-wrap items-baseline gap-x-4">
        <UiText variant="meta">
          {{ t('loans.interest') }}
        </UiText>
        <Amount
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

      <div
        v-for="month in item.byMonth"
        :key="month.month"
        class="flex items-baseline gap-2"
        data-loan-revolving-month
      >
        <UiText variant="meta">
          {{ month.month }}
        </UiText>
        <div class="ml-auto flex items-baseline gap-3">
          <Amount
            v-if="month.interest"
            :amount="month.interest"
            :currencyCode="item.currencyCode"
            :isShowBaseRate="false"
            variant="secondary"
          />
          <Amount
            v-if="month.fine"
            :amount="month.fine"
            :currencyCode="item.currencyCode"
            :isShowBaseRate="false"
            variant="secondary"
            class="text-expense-1!"
          />
        </div>
      </div>
    </NuxtLink>
  </div>
</template>
