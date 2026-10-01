<script setup lang="ts">
const props = defineProps<{
  /** Preformatted month label plus its interest and fees. */
  byMonth: { fine: number, interest: number, month: string }[]
  currencyCode: string
  fine: number
  interest: number
  /** Off where the same totals already sit next to it. */
  isHideTotals?: boolean
}>()

const { t } = useI18n()

const RECENT = 6
const isShowAll = ref(false)
const shownMonths = computed(() => isShowAll.value ? props.byMonth : props.byMonth.slice(-RECENT))
</script>

<template>
  <div class="grid gap-2">
    <UiTitleSection>
      {{ t('loans.cost') }}
    </UiTitleSection>

    <div v-if="!props.isHideTotals" class="grid grid-cols-2 gap-2">
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
        v-for="item in shownMonths"
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

    <button
      v-if="props.byMonth.length > RECENT"
      type="button"
      class="justify-self-start text-xs text-muted"
      data-loan-cost-show-all
      @click="isShowAll = !isShowAll"
    >
      {{ isShowAll ? t('loans.showLess') : t('loans.showAll') }}
    </button>
  </div>
</template>
