<script setup lang="ts">
export type LoansUpcomingViewItem = {
  amount: number
  currencyCode: string
  /** Principal / interest split of a loan payment. */
  desc?: string
  label: string
  walletId: string
  walletName: string
}

export type LoansUpcomingViewGroup = {
  days: {
    date: number
    items: LoansUpcomingViewItem[]
    /** Day total in the base currency; null for a single-charge day. */
    sum: number | null
  }[]
  key: string
  label: string
}

const props = defineProps<{
  baseCurrencyCode: string
  groups: LoansUpcomingViewGroup[]
  isOverdue: boolean
  /** Collapsed groups; the nearest one is always open. */
  openKeys: string[]
  /** Overdue plus due within the due window, in the base currency. */
  total: number | null
}>()

const emit = defineEmits<{
  select: [walletId: string]
  toggle: [key: string, isOpen: boolean]
}>()

const { t } = useI18n()
</script>

<template>
  <div v-if="props.groups.length" class="grid gap-1" data-loan-upcoming>
    <div class="flex flex-wrap items-baseline gap-x-2 px-3">
      <UiText variant="caption">
        {{ t('loans.toPay.title') }}
      </UiText>

      <Amount
        v-if="props.total !== null"
        :amount="props.total"
        :currencyCode="props.baseCurrencyCode"
        :isShowBaseRate="false"
        :class="props.isOverdue && 'text-error!'"
        align="left"
        data-loan-upcoming-total
        variant="summary"
      />
    </div>

    <UCollapsible
      v-for="group in props.groups"
      :key="group.key"
      :open="group.key === 'nearest' || props.openKeys.includes(group.key)"
      :unmountOnHide="false"
      :data-loan-upcoming-group="group.key"
      @update:open="(value: boolean) => emit('toggle', group.key, value)"
    >
      <!-- The nearest day already prints its date in the day row below. -->
      <UiTitleDropRight v-if="group.key !== 'nearest'" :isError="group.key === 'overdue'" :isShown="props.openKeys.includes(group.key)" :title="group.label" />

      <template #content>
        <div v-for="day in group.days" :key="day.date">
          <TrnsDateRowView
            :currencyCode="props.baseCurrencyCode"
            :date="day.date"
            :isShowGroupSum="day.sum !== null"
            :sum="day.sum === null ? undefined : { expense: day.sum, income: 0 }"
          />
          <UiElement
            v-for="item in day.items"
            :key="item.walletId"
            insideClasses="py-3 min-h-9.5"
            data-loan-upcoming-item
            @click="emit('select', item.walletId)"
          >
            <template #leftIcon>
              <UiIconBase name="mdi:calendar-clock" invert />
            </template>

            <div class="grid grow gap-1 pr-1">
              <div class="flex grow items-center gap-3">
                <div class="grid grow gap-1">
                  <UiEntityName>{{ item.label }}</UiEntityName>
                  <UiEntityName variant="secondary">
                    {{ item.walletName }}
                  </UiEntityName>
                </div>
                <Amount
                  :amount="item.amount"
                  :currencyCode="item.currencyCode"
                  type="expense"
                  align="right"
                  class="grow"
                  colorize="income"
                  isShowMinus
                  variant="row"
                />
              </div>
              <UiText v-if="item.desc" class="opacity-80" variant="caption">
                {{ item.desc }}
              </UiText>
            </div>
          </UiElement>
        </div>
      </template>
    </UCollapsible>
  </div>
</template>
