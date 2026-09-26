<script setup lang="ts">
import type { MinPaymentStatus } from '~/components/loans/minPayment'

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
    /** Preformatted last month of the schedule. */
    until: string
  } | null
  minPayment: {
    amount: number
    /** Preformatted due day. */
    date: string
    status: MinPaymentStatus
  } | null
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
  <div class="grid gap-0.5">
    <div v-if="props.loan?.isClosed" data-loan-card-closed>
      <UiText variant="meta">
        {{ t('loans.closed') }}
      </UiText>
    </div>

    <div v-else-if="props.loan" class="flex items-center gap-1.5" data-loan-card-line>
      <Amount
        :amount="props.loan.payment"
        :currencyCode="props.currencyCode"
        :isShowBaseRate="false"
        :isShowSymbol="false"
        align="left"
        variant="secondary"
      />
      <UiText variant="meta">
        × {{ t('loans.monthsShort', { count: props.loan.monthsLeft }) }} → {{ props.loan.until }}
      </UiText>
      <UiText v-if="props.loan.nextDate" variant="meta">
        · {{ props.loan.nextDate }}
      </UiText>
      <span
        v-if="props.loan.isOverdue"
        class="rounded-sm bg-error/15 px-1 text-2xs leading-4 text-error"
        data-loan-card-overdue
      >
        {{ t('loans.overdue') }}
      </span>
    </div>

    <div v-if="props.minPayment" class="flex items-center gap-1.5" data-loan-card-min>
      <span
        class="size-1.5 shrink-0 rounded-full"
        :class="statusClass[props.minPayment.status]"
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
