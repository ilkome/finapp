<script setup lang="ts">
const props = defineProps<{
  /** Preformatted month label plus its interest and fees. */
  byMonth: { fine: number, interest: number, month: string }[]
  currencyCode: string
  fine: number
  interest: number
}>()

const { t } = useI18n()
</script>

<template>
  <div class="grid gap-2">
    <UiTitleSection>
      {{ t('loans.cost') }}
    </UiTitleSection>

    <div class="grid grid-cols-2 gap-2">
      <LoansStatCell
        :amount="props.interest"
        :currencyCode="props.currencyCode"
        :title="t('loans.interest')"
      />
      <LoansStatCell
        :amount="props.fine"
        :currencyCode="props.currencyCode"
        :title="t('loans.fine')"
      />
    </div>

    <div class="grid">
      <div
        v-for="item in props.byMonth"
        :key="item.month"
        class="border-elevated/40 flex items-baseline gap-2 border-b py-1.5 last:border-0"
        data-loan-cost-month
      >
        <UiText variant="meta">
          {{ item.month }}
        </UiText>

        <div class="ml-auto flex items-baseline gap-3">
          <Amount
            v-if="item.interest"
            :amount="item.interest"
            :currencyCode="props.currencyCode"
            variant="secondary"
          />
          <Amount
            v-if="item.fine"
            :amount="item.fine"
            :currencyCode="props.currencyCode"
            variant="secondary"
            class="text-expense-1!"
          />
        </div>
      </div>
    </div>
  </div>
</template>
