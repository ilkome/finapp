<script setup lang="ts">
import type { MinPaymentStatus } from '~/components/loans/minPayment'

import { minPaymentStatusClass } from '~/components/loans/minPayment'

const props = defineProps<{
  currencyCode: string
  /** A loan's own line; wallets without a `loans` row pass null and rely on `minPayment`. */
  loan: {
    isClosed?: boolean
    isOverdue: boolean
    monthsLeft: number
    /** Preformatted next payment day. */
    nextDate: string | null
    payment: number
  } | null
  minPayment: {
    amount: number
    /** Preformatted due day. */
    date: string
    status: MinPaymentStatus
  } | null
}>()

const { t } = useI18n()
</script>

<template>
  <div class="grid gap-0.5">
    <div v-if="props.loan?.isClosed" data-loan-card-closed>
      <UiText variant="meta">
        {{ t('loans.closed') }}
      </UiText>
    </div>

    <div v-else-if="props.loan" class="flex flex-wrap items-center gap-x-1.5" data-loan-card-line>
      <Amount
        :amount="props.loan.payment"
        :currencyCode="props.currencyCode"
        :isShowBaseRate="false"
        :isShowSymbol="false"
        align="left"
        variant="secondary"
      />
      <UiText v-if="props.loan.nextDate" variant="meta" class="whitespace-nowrap">
        · {{ props.loan.nextDate }}
      </UiText>
      <UiText variant="meta" class="whitespace-nowrap">
        · {{ t('loans.monthsShort', { count: props.loan.monthsLeft }) }}
      </UiText>
      <UiBadge
        v-if="props.loan.isOverdue"
        tone="error"
        data-loan-card-overdue
      >
        {{ t('loans.overdue') }}
      </UiBadge>
    </div>

    <div v-if="props.minPayment" class="flex items-center gap-1.5" data-loan-card-min>
      <span
        class="size-1.5 shrink-0 rounded-full"
        :class="minPaymentStatusClass[props.minPayment.status]"
        :data-loan-min-status="props.minPayment.status"
      />
      <UiText variant="meta">
        {{ t('loans.minPaymentShort') }}
      </UiText>
      <Amount
        :amount="props.minPayment.amount"
        :currencyCode="props.currencyCode"
        :isShowBaseRate="false"
        :isShowSymbol="false"
        align="left"
        variant="secondary"
      />
      <UiText variant="meta">
        {{ t('loans.by') }} {{ props.minPayment.date }}
      </UiText>
    </div>
  </div>
</template>
